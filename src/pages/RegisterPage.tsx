import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Leaders } from '../components/Leaders'
import { PlateInput } from '../components/PlateInput'
import { useI18n, type MessageKey } from '../i18n'
import { getAuthProvider } from '../lib/auth'
import { MARKET_SITE } from '../lib/market'
import type { useAppState } from '../lib/store'
import { PLATES, renavamCheckDigit } from '../lib/validation'
import { DEMO_DOCUMENTS } from '../lib/seed'
import { appendLog, missingDocuments, OPTIONAL_DOCUMENTS, register, VEHICLE_DOCUMENTS, type DocumentKind, type Listing, type RegisterError, type RegisterInput, type RegisterResult } from '../lib/verify'

type Props = ReturnType<typeof useAppState>

/** Campos destacados em vermelho para cada erro do cadastro. */
const FIELDS_BY_ERROR: Partial<Record<RegisterError, string[]>> = {
  invalidUrl: ['url'],
  urlAlreadyRegistered: ['url'],
  duplicateOnSite: ['url'],
  invalidPlate: ['plate'],
  invalidVin: ['vin'],
  invalidRenavam: ['renavam'],
  missingVehicle: ['make', 'model'],
  invalidYear: ['year'],
  dataMismatch: ['plate', 'vin', 'renavam'],
}

const EMPTY: RegisterInput = { market: true, url: '', plate: '', vin: '', renavam: '', make: '', model: '', year: '', documents: {} }

/** Dados de exemplo: um Civic anunciado no próprio marketplace do Verify It. */
const DEMO: Omit<RegisterInput, 'market'> = {
  url: 'https://www.kleinanzeigen.de/s-anzeige/honda-civic-exl-2019/2845123456-216-3331',
  plate: 'B KM 4821',
  plateCountry: 'DE',
  vin: 'JHMFC2650KS100001',
  renavam: '0123456789' + renavamCheckDigit('0123456789'),
  make: 'Honda',
  model: 'Civic EXL',
  year: '2019',
  documents: DEMO_DOCUMENTS,
  price: '21900',
  km: '62400',
  city: 'Berlin',
  description: '2019 Honda Civic EXL, single owner, garage kept, full service history. Happy for you to have it inspected by a mechanic you trust.',
}

export function RegisterPage({ state, update }: Props) {
  const { t, locale } = useI18n()
  const [form, setForm] = useState<RegisterInput>(EMPTY)
  const [seller, setSeller] = useState('')
  const [result, setResult] = useState<RegisterResult | null>(null)
  const alertRef = useRef<HTMLDivElement>(null)

  // Nome do vendedor logado: aparece no anúncio do marketplace.
  useEffect(() => {
    let active = true
    void getAuthProvider().currentAccount().then((account) => {
      if (active && account) setSeller(account.name)
    })
    return () => { active = false }
  }, [])

  // Depois de um envio recusado, leva o foco (e a tela) para a lista de erros.
  useEffect(() => {
    if (result && !result.ok) alertRef.current?.focus()
  }, [result])

  const market = form.market === true
  const bad = new Set(result && !result.ok ? result.errors.flatMap((err) => FIELDS_BY_ERROR[err] ?? []) : [])
  const missingDocs = result && !result.ok ? (result.missing ?? []) : []
  const invalid = (field: string) => (bad.has(field) ? true : undefined)

  const set = (field: Exclude<keyof RegisterInput, 'documents' | 'plateCountry' | 'market'>) => (value: string) => setForm((f) => ({ ...f, [field]: value }))
  const setDocument = (kind: DocumentKind, name: string) => setForm((f) => ({ ...f, documents: { ...f.documents, [kind]: name } }))
  const setMarket = (value: boolean) => setForm((f) => ({ ...f, market: value }))
  const required = VEHICLE_DOCUMENTS.filter((d) => !OPTIONAL_DOCUMENTS.includes(d))
  const uploaded = required.length - missingDocuments(form.documents, VEHICLE_DOCUMENTS).length

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const res = register(state, { ...form, seller })
    setResult(res)
    if (res.ok) {
      update((s) => appendLog({ ...s, listings: [...s.listings, res.listing] }, { type: 'register', site: res.listing.site, result: res.listing.checkId }))
    } else {
      update((s) => appendLog(s, { type: 'rejected', site: res.conflict?.site ?? '-', result: res.errors.join(', ') }))
    }
  }

  function restart() {
    setForm(EMPTY)
    setResult(null)
  }

  if (result?.ok) {
    const onMarket = result.listing.site === MARKET_SITE
    // O anúncio nasce como rascunho: só é publicado depois de a conta e o veículo
    // serem aprovados (ver ActivityPage). Por isso não dizemos "verificado" aqui.
    return (
      <section className="page">
        <article className="report report-draft">
          <h2 className="stamp">{t('register.draft.stamp')}</h2>
          <p className="report-body">{t('register.draft.body')}</p>
          <Leaders
            rows={[
              { label: t('result.checkId'), value: <code>{result.listing.checkId}</code> },
              { label: t('result.vehicle'), value: `${result.listing.make} ${result.listing.model} ${result.listing.year}` },
              { label: t('result.site'), value: onMarket ? t('register.where.market') : result.listing.site },
              { label: t('register.draft.created'), value: new Date(result.listing.createdAt).toLocaleString(locale) },
            ]}
          />
          {result.otherSites.length > 0 && (
            <p>{t('register.success.otherSites', { sites: result.otherSites.map((l) => l.site).join(', ') })}</p>
          )}
          <div className="actions">
            <a className="button button-primary" href="#/activity">{t('register.draft.track')}</a>
            <button type="button" className="button button-quiet" onClick={restart}>{t('register.success.another')}</button>
          </div>
        </article>
      </section>
    )
  }

  return (
    <section className="page">
      <h1>{t('register.title')}</h1>
      <p className="lead">{t('register.lead')}</p>

      {result && !result.ok && (
        <div className="alert" role="alert" tabIndex={-1} ref={alertRef}>
          <h2>{t('register.rejected.title')}</h2>
          <ul className="reasons">
            {result.errors.map((err) => (
              <li key={err}>
                {err === 'missingDocuments'
                  ? t('error.missingDocuments', { docs: (result.missing ?? []).map((d) => t(`doc.${d}`)).join(', ') })
                  : errorText(t, err, result.conflict, PLATES[form.plateCountry ?? 'DE'].example)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form className="form" onSubmit={onSubmit} noValidate>
        <div className="lang-switch" role="group" aria-label={t('register.where.label')}>
          <button type="button" aria-pressed={market} onClick={() => setMarket(true)}>{t('register.where.market')}</button>
          <button type="button" aria-pressed={!market} onClick={() => setMarket(false)}>{t('register.where.external')}</button>
        </div>

        {market ? (
          <p className="muted small">{t('register.where.marketNote')}</p>
        ) : (
          <label className="field">
            {t('register.url')}
            <input type="url" inputMode="url" value={form.url} aria-invalid={invalid('url')} onChange={(e) => set('url')(e.target.value)} placeholder="https://www.kleinanzeigen.de/..." />
          </label>
        )}
        <div className="grid-3">
          <label className="field">
            {t('register.make')}
            <input value={form.make} aria-invalid={invalid('make')} onChange={(e) => set('make')(e.target.value)} />
          </label>
          <label className="field">
            {t('register.model')}
            <input value={form.model} aria-invalid={invalid('model')} onChange={(e) => set('model')(e.target.value)} />
          </label>
          <label className="field">
            {t('register.year')}
            <input inputMode="numeric" maxLength={4} value={form.year} aria-invalid={invalid('year')} onChange={(e) => set('year')(e.target.value)} />
          </label>
        </div>
        <div className="grid-3">
          <PlateInput value={form.plate} onChange={set('plate')} country={form.plateCountry ?? 'DE'} onCountryChange={(c) => setForm((f) => ({ ...f, plateCountry: c }))} label={t('register.plate')} invalid={bad.has('plate')} />
          <label className="field">
            {t('register.vin')}
            <input value={form.vin} aria-invalid={invalid('vin')} maxLength={17} onChange={(e) => set('vin')(e.target.value.toUpperCase())} />
          </label>
          <label className="field">
            {t('register.renavam')}
            <input inputMode="numeric" maxLength={11} value={form.renavam} aria-invalid={invalid('renavam')} onChange={(e) => set('renavam')(e.target.value)} />
          </label>
        </div>
        <div className="grid-3">
          <label className="field">
            {t('register.price')}
            <input inputMode="numeric" value={form.price ?? ''} onChange={(e) => set('price')(e.target.value)} />
          </label>
          <label className="field">
            {t('register.km')}
            <input inputMode="numeric" value={form.km ?? ''} onChange={(e) => set('km')(e.target.value)} />
          </label>
          <label className="field">
            {t('register.city')}
            <input value={form.city ?? ''} onChange={(e) => set('city')(e.target.value)} />
          </label>
        </div>
        <label className="field">
          {t('register.description')}
          <textarea rows={3} value={form.description ?? ''} onChange={(e) => set('description')(e.target.value)} />
          <small>{t('register.adHint')}</small>
        </label>
        <fieldset className="docs">
          <legend>{t('register.docs.title')}</legend>
          <p className="docs-lead">{t('register.docs.lead')}</p>
          <p className="docs-progress" aria-live="polite">
            <progress max={required.length} value={uploaded} />
            {t('register.docs.progress', { n: uploaded, total: required.length })}
          </p>
          <ul className="docs-list">
            {VEHICLE_DOCUMENTS.map((kind) => {
              const file = form.documents[kind]
              const optional = OPTIONAL_DOCUMENTS.includes(kind)
              return (
                <li key={kind} className={file ? 'doc doc-done' : missingDocs.includes(kind) ? 'doc doc-missing' : 'doc'}>
                  <span className="doc-mark" aria-hidden="true">{file ? '✓' : ''}</span>
                  <div className="doc-text">
                    <strong>{t(`doc.${kind}`)}{optional && <span className="doc-optional"> · {t('register.docs.optional')}</span>}</strong>
                    <small>{file ?? t(`doc.${kind}.hint`)}</small>
                  </div>
                  <label className="button button-quiet doc-upload">
                    {file ? t('register.docs.replace') : t('register.docs.choose')}
                    <span className="visually-hidden">: {t(`doc.${kind}`)}</span>
                    <input
                      type="file"
                      className="visually-hidden"
                      accept="application/pdf,image/*"
                      onChange={(e) => setDocument(kind, e.target.files?.[0]?.name ?? '')}
                    />
                  </label>
                </li>
              )
            })}
          </ul>
          <small className="docs-hint">{t('register.docs.hint')}</small>
        </fieldset>
        <p className="muted small">{t('register.simulated')}</p>
        <div className="actions">
          <button className="button button-primary" type="submit">{market ? t('register.submit.market') : t('register.submit')}</button>
          <button type="button" className="button button-quiet" onClick={() => setForm((f) => ({ ...DEMO, market: f.market }))}>{t('register.demoFill')}</button>
        </div>
      </form>
    </section>
  )
}

function errorText(t: ReturnType<typeof useI18n>['t'], err: string, conflict: Listing | undefined, example: string): string {
  return t(`error.${err}` as MessageKey, { id: conflict?.checkId ?? '', site: conflict?.site ?? '', example })
}
