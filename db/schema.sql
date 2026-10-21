-- Esquema do banco do Verify It (PostgreSQL).
--
-- Espelha os dados que o protótipo já usa em memória (ver src/lib/verify.ts e
-- src/lib/auth/types.ts) para quando houver um banco online de verdade. É SQL
-- padrão do Postgres, então serve em qualquer host (Supabase, Neon, Railway, um
-- Postgres próprio...). NENHUMA senha fica aqui: a autenticação é do provedor de
-- login; este banco guarda só os dados do negócio.
--
-- A regra central do produto ("o anúncio só sobe depois de o VENDEDOR ser
-- aprovado e, então, o VEÍCULO") está travada no próprio banco, por gatilho, no
-- fim deste arquivo — além de já estar em src/lib/verify.ts.
--
-- Rodar: psql "$DATABASE_URL" -f db/schema.sql

begin;

-- gen_random_uuid() é nativo no Postgres 13+; a extensão garante versões antigas.
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Tipos (espelham as uniões de string do app)
-- ----------------------------------------------------------------------------
create type role as enum ('buyer', 'seller');
create type verification_status as enum ('pending', 'approved', 'rejected');
create type notify_channel as enum ('email', 'sms');
create type listing_status as enum ('draft', 'active', 'sold');
create type vehicle_review as enum ('pending', 'approved', 'rejected');
create type document_kind as enum ('idFront', 'idBack', 'selfie', 'registration', 'title', 'inspection');
create type log_type as enum ('register', 'rejected', 'check', 'report', 'sold');

-- ----------------------------------------------------------------------------
-- Contas (Account). Sem senha: quem valida login/2FA é o provedor de auth.
-- ----------------------------------------------------------------------------
create table accounts (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  role          role not null,
  two_factor    boolean not null default false,
  -- Só o vendedor passa por análise; comprador fica sem (null).
  verification  verification_status,
  notify_by     notify_channel,
  phone         text,
  created_at    timestamptz not null default now(),
  -- Vendedor tem situação de análise; comprador não.
  constraint verification_only_for_sellers
    check ((role = 'seller') = (verification is not null))
);

-- E-mail único sem diferenciar maiúsculas/minúsculas.
create unique index accounts_email_lower_idx on accounts (lower(email));

-- ----------------------------------------------------------------------------
-- Documentos pessoais do vendedor (identidade), enviados no cadastro da conta.
-- Guarda só o caminho do arquivo no storage, nunca o arquivo em si.
-- ----------------------------------------------------------------------------
create table account_documents (
  account_id   uuid not null references accounts (id) on delete cascade,
  kind         document_kind not null,
  file_path    text not null,
  uploaded_at  timestamptz not null default now(),
  primary key (account_id, kind),
  constraint account_docs_are_identity
    check (kind in ('idFront', 'idBack', 'selfie'))
);

-- ----------------------------------------------------------------------------
-- Anúncios (Listing). Todo anúncio nasce 'draft' e só vira 'active' (publicado)
-- depois das duas aprovações, na ordem (ver gatilho no fim).
-- ----------------------------------------------------------------------------
create table listings (
  check_id        text primary key,                      -- código único (ex.: VI-7K3P9Q)
  seller_id       uuid not null references accounts (id) on delete cascade,
  url             text not null,
  key             text not null,                          -- chave normalizada do link
  site            text not null,
  plate           text not null,
  vin             text not null,
  renavam         text not null,
  make            text not null,
  model           text not null,
  year            int  not null check (year between 1950 and extract(year from now())::int + 1),
  status          listing_status not null default 'draft',
  vehicle_review  vehicle_review not null default 'pending',
  created_at      timestamptz not null default now(),
  -- Dados opcionais do anúncio no marketplace do Verify It.
  price_cents     int check (price_cents is null or price_cents >= 0),
  km              int check (km is null or km >= 0),
  city            text,
  description     text,
  body_color      text,
  transmission    text,
  fuel            text,
  exterior        text,
  interior        text,
  owners          int,
  member_since    int,
  features        text[]
);

create index listings_seller_idx  on listings (seller_id);
create index listings_status_idx  on listings (status);
create index listings_site_plate_idx on listings (site, plate);
-- Enquanto não é vendido, cada link só existe uma vez (anti-clone por URL).
create unique index listings_active_key_idx on listings (key) where status <> 'sold';

-- ----------------------------------------------------------------------------
-- Documentos do veículo, enviados a cada anúncio.
-- ----------------------------------------------------------------------------
create table listing_documents (
  listing_id   text not null references listings (check_id) on delete cascade,
  kind         document_kind not null,
  file_path    text not null,
  uploaded_at  timestamptz not null default now(),
  primary key (listing_id, kind),
  constraint listing_docs_are_vehicle
    check (kind in ('registration', 'title', 'inspection'))
);

-- ----------------------------------------------------------------------------
-- Denúncias de links (Report), feitas pelos compradores.
-- ----------------------------------------------------------------------------
create table reports (
  id          uuid primary key default gen_random_uuid(),
  key         text not null,
  site        text not null,
  url         text not null,
  created_at  timestamptz not null default now()
);

create index reports_key_idx on reports (key);

-- ----------------------------------------------------------------------------
-- Histórico de interações (LogEntry).
-- ----------------------------------------------------------------------------
create table interaction_log (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid references accounts (id) on delete set null,
  type        log_type not null,
  site        text not null,
  result      text not null,
  at          timestamptz not null default now()
);

create index interaction_log_at_idx on interaction_log (at desc);

-- ----------------------------------------------------------------------------
-- A TRAVA: vendedor primeiro, veículo depois, e só então publica.
-- Mesma garantia de src/lib/verify.ts, agora também no banco, para que nenhum
-- caminho (app, API ou acesso direto ao banco) consiga furar a ordem.
-- ----------------------------------------------------------------------------
create or replace function enforce_listing_publish_order()
returns trigger
language plpgsql
as $$
declare
  seller_ok boolean;
begin
  select verification = 'approved'
    into seller_ok
    from accounts
   where id = new.seller_id;

  -- Aprovar o VEÍCULO exige o VENDEDOR já aprovado.
  if new.vehicle_review = 'approved' and coalesce(seller_ok, false) = false then
    raise exception 'sellerNotApproved: o veículo não pode ser aprovado antes do vendedor';
  end if;

  -- Publicar (status 'active') exige vendedor aprovado E veículo aprovado.
  if new.status = 'active' then
    if coalesce(seller_ok, false) = false then
      raise exception 'sellerNotApproved: o anúncio não pode ser publicado antes de o vendedor ser aprovado';
    end if;
    if new.vehicle_review <> 'approved' then
      raise exception 'vehicleNotApproved: o anúncio não pode ser publicado antes de o veículo ser aprovado';
    end if;
  end if;

  return new;
end;
$$;

create trigger listings_publish_order
  before insert or update on listings
  for each row
  execute function enforce_listing_publish_order();

commit;

-- ----------------------------------------------------------------------------
-- (Opcional) Segurança por linha para Supabase, onde auth.uid() é a conta logada.
-- Deixe comentado em um Postgres comum. Em produção, adeque os nomes das colunas
-- de identidade ao seu provedor de auth.
-- ----------------------------------------------------------------------------
-- alter table accounts            enable row level security;
-- alter table account_documents   enable row level security;
-- alter table listings            enable row level security;
-- alter table listing_documents   enable row level security;
-- alter table interaction_log     enable row level security;
--
-- -- Cada pessoa só lê/edita a própria conta.
-- create policy account_self on accounts
--   using (id = auth.uid()) with check (id = auth.uid());
--
-- -- Comprador vê qualquer anúncio PUBLICADO; vendedor vê e edita os seus.
-- create policy listings_public_read on listings
--   for select using (status = 'active');
-- create policy listings_owner on listings
--   using (seller_id = auth.uid()) with check (seller_id = auth.uid());
--
-- -- Documentos só do dono.
-- create policy account_docs_owner on account_documents
--   using (account_id = auth.uid()) with check (account_id = auth.uid());
-- create policy listing_docs_owner on listing_documents
--   using (exists (select 1 from listings l
--                   where l.check_id = listing_documents.listing_id
--                     and l.seller_id = auth.uid()));
