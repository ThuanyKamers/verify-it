# Verify It

Protótipo de uma plataforma que ajuda compradores de veículos usados a descobrir se um anúncio online é verdadeiro antes de negociar.

**Acesse:** https://thuanykamers.github.io/verify-it/

## O problema

Golpes com anúncios de veículos causaram R$ 2,7 bilhões de prejuízo a 91 mil vítimas (Veja Negócios). Na pesquisa feita no Startup Weekend, 80% dos entrevistados já sofreram tentativa de golpe e 100% usariam uma plataforma de verificação. O golpe mais comum é o anúncio clonado: o golpista copia fotos e dados de um anúncio real e publica de novo, no mesmo site, com outro contato.

## Como funciona

1. **O dono cadastra o anúncio.** Informa o link, a placa, o chassi, o RENAVAM e envia o comprovante de propriedade (CRLV-e). Pode cadastrar um anúncio por site (OLX, Facebook, Webmotors...).
2. **A plataforma verifica.** Confere os documentos e recusa um segundo anúncio do mesmo veículo no mesmo site.
3. **O comprador cola o link** do anúncio que está vendo e recebe uma das respostas:
   - ✅ **Verificado:** é o link cadastrado pelo dono.
   - 🚨 **Possível golpe:** o veículo tem anúncio verificado em outro link do mesmo site, o dono marcou como vendido, ou o link foi denunciado.
   - ❔ **Não verificado:** não há registro; se o veículo estiver verificado em outro site, mostramos o link oficial.

Não há selo nem QR code no anúncio de propósito: um golpista poderia copiar a imagem. A confiança vem de o comprador consultar o Verify It por conta própria.

O fluxo completo está em [docs/fluxo.png](docs/fluxo.png).

## Idiomas

Português, inglês e alemão, com seletor no topo da página. Os textos ficam em [`src/i18n.tsx`](src/i18n.tsx); o TypeScript acusa erro se faltar alguma tradução.

## Limitações do protótipo

- A verificação de propriedade é **simulada**: só conferimos o formato da placa e do chassi e o dígito verificador do RENAVAM. A consulta real exige integração com DETRAN/SENATRAN.
- Os dados ficam **no navegador** (localStorage), com anúncios de exemplo fictícios. Para vendedor e comprador em aparelhos diferentes, troque `localStore` em [`src/lib/store.ts`](src/lib/store.ts) por um banco online (ex.: Supabase).

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local
npm test         # testes da lógica de verificação
npm run build    # gera a versão de produção em dist/
```

As regras de negócio ficam em [`src/lib/verify.ts`](src/lib/verify.ts), separadas da interface, para poderem ser reaproveitadas num back-end.

### Publicação

Cada push na `main` publica o site no GitHub Pages pelo workflow [`deploy.yml`](.github/workflows/deploy.yml). Na primeira vez, ative em **Settings → Pages → Source: GitHub Actions**.
