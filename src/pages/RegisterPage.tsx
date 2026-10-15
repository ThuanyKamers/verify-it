import { useState, type FormEvent } from 'react'
import { useI18n, type MessageKey } from '../i18n'
import type { useAppState } from '../lib/store'
import { renavamCheckDigit } from '../lib/validation'
import { appendLog, register, type Listing, type RegisterInput, type RegisterResult } from '../lib/verify'

type Props = ReturnType<typeof useAppState>

const EMPTY: RegisterInput = { url: '', plate: '', vin: '', renavam: '', make: '', model: '', year: '', proofFileName: '' }

/** Dados de exemplo: o mesmo Civic da demonstração, agora anunciado na Webmotors. */
const DEMO: RegisterInput = {
  url: 'https://www.webmotors.com.br/comprar/honda/civic/2-0-exl/4-portas/2019/47712345',
  plate: 'RIO2A18',
  vin: '93HFC2650KZ100001',
  renavam: '0123456789' + renavamCheckDigit('0123456789'),
  make: 'Honda',
  model: 'Civic EXL',
  year: '2019',
  proofFileName: 'crlv-e-exemplo.pdf',
}

export function RegisterPage({ state, update }: Props) {
  const { t, locale } = useI18n()
  const [form, setForm] = useState<RegisterInput>(EMPTY)
  const [result, setResult] = useState<RegisterResult | null>(null)

  const set = (field: keyof RegisterInput) => (value: string) => setForm((f) => ({ ...f, [field]: value }))

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const res = register(state, form)
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
    return (
      <section>
        <div className="card result verified">
          <div className="result-head">
            <span className="result-icon" aria-hidden="true">✓</span>
            <div>
              <h2>{t('register.success.title')}</h2>
              <p>{t('register.success.body')}</p>
            </div>
          </div>
          <dl className="facts">
            <dt>{t('result.checkId')}</dt>
            <dd><code>{result.listing.checkId}</code></dd>
            <dt>{t('result.vehicle')}</dt>
            <dd>{result.listing.make} {result.listing.model} {result.listing.year}</dd>
            <dt>{t('result.site')}</dt>
            <dd>{result.listing.site}</dd>
            <dt>{t('result.verifiedOn')}</dt>
            <dd>{new Date(result.listing.createdAt).toLocaleString(locale)}</dd>
          </dl>
          {result.otherSites.length > 0 && (
            <p>{t('register.success.otherSites', { sites: result.otherSites.map((l) => l.site).join(', ') })}</p>
          )}
          <button type="button" className="primary" onClick={restart}>{t('register.success.another')}</button>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h1>{t('register.title')}</h1>
      <p className="lead">{t('register.lead')}</p>

      {result && !result.ok && (
        <div className="card result scam" role="alert">
          <h2>{t('register.rejected.title')}</h2>
          <ul className="reasons">
            {result.errors.map((err) => (
              <li key={err}>{errorText(t, err, result.conflict)}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="card form" onSubmit={onSubmit} noValidate>
        <label>
          {t('register.url')}
          <input type="url" inputMode="url" value={form.url} onChange={(e) => set('url')(e.target.value)} placeholder="https://www.olx.com.br/..." />
        </label>
        <div className="grid-3">
          <label>
            {t('register.make')}
            <input value={form.make} onChange={(e) => set('make')(e.target.value)} />
          </label>
          <label>
            {t('register.model')}
            <input value={form.model} onChange={(e) => set('model')(e.target.value)} />
          </label>
          <label>
            {t('register.year')}
            <input inputMode="numeric" maxLength={4} value={form.year} onChange={(e) => set('year')(e.target.value)} />
          </label>
        </div>
        <div className="grid-3">
          <label>
            {t('register.plate')}
            <input value={form.plate} maxLength={8} placeholder="ABC1D23" onChange={(e) => set('plate')(e.target.value.toUpperCase())} />
          </label>
          <label>
            {t('register.vin')}
            <input value={form.vin} maxLength={17} onChange={(e) => set('vin')(e.target.value.toUpperCase())} />
          </label>
          <label>
            {t('register.renavam')}
            <input inputMode="numeric" maxLength={11} value={form.renavam} onChange={(e) => set('renavam')(e.target.value)} />
          </label>
        </div>
        <label>
          {t('register.proof')}
          <input type="file" accept="application/pdf,image/*" onChange={(e) => set('proofFileName')(e.target.files?.[0]?.name ?? '')} />
          <small>{form.proofFileName && form.proofFileName === DEMO.proofFileName ? `📎 ${form.proofFileName} · ` : ''}{t('register.proofHint')}</small>
        </label>
        <p className="note">{t('register.simulated')}</p>
        <div className="actions">
          <button className="primary" type="submit">{t('register.submit')}</button>
          <button type="button" className="secondary" onClick={() => setForm(DEMO)}>{t('register.demoFill')}</button>
        </div>
      </form>
    </section>
  )
}

function errorText(t: ReturnType<typeof useI18n>['t'], err: string, conflict?: Listing): string {
  return t(`error.${err}` as MessageKey, { id: conflict?.checkId ?? '', site: conflict?.site ?? '' })
}
