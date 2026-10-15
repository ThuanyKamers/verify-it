import { useState, type FormEvent } from 'react'
import { Leaders } from '../components/Leaders'
import { PlateInput } from '../components/PlateInput'
import { useI18n, type MessageKey } from '../i18n'
import type { useAppState } from '../lib/store'
import { renavamCheckDigit } from '../lib/validation'
import { appendLog, register, type Listing, type RegisterInput, type RegisterResult } from '../lib/verify'

type Props = ReturnType<typeof useAppState>

const EMPTY: RegisterInput = { url: '', plate: '', vin: '', renavam: '', make: '', model: '', year: '', proofFileName: '' }

/** Dados de exemplo: o mesmo Civic da demonstração, agora anunciado no Kleinanzeigen. */
const DEMO: RegisterInput = {
  url: 'https://www.kleinanzeigen.de/s-anzeige/honda-civic-exl-2019/2845123456-216-3331',
  plate: 'B KM 4821',
  vin: 'JHMFC2650KS100001',
  renavam: '0123456789' + renavamCheckDigit('0123456789'),
  make: 'Honda',
  model: 'Civic EXL',
  year: '2019',
  proofFileName: 'crlv-e-exemplo.pdf',
  price: '21900',
  km: '62400',
  city: 'Berlin',
  description: '2019 Honda Civic EXL, single owner, garage kept, full service history. Happy for you to have it inspected by a mechanic you trust.',
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
      <section className="page">
        <article className="report report-verified">
          <h2 className="stamp">{t('status.verified')}</h2>
          <p className="report-body">{t('register.success.body')}</p>
          <Leaders
            rows={[
              { label: t('result.checkId'), value: <code>{result.listing.checkId}</code> },
              { label: t('result.vehicle'), value: `${result.listing.make} ${result.listing.model} ${result.listing.year}` },
              { label: t('result.site'), value: result.listing.site },
              { label: t('result.verifiedOn'), value: new Date(result.listing.createdAt).toLocaleString(locale) },
            ]}
          />
          {result.otherSites.length > 0 && (
            <p>{t('register.success.otherSites', { sites: result.otherSites.map((l) => l.site).join(', ') })}</p>
          )}
          <button type="button" className="button button-primary" onClick={restart}>{t('register.success.another')}</button>
        </article>
      </section>
    )
  }

  return (
    <section className="page">
      <h1>{t('register.title')}</h1>
      <p className="lead">{t('register.lead')}</p>

      {result && !result.ok && (
        <div className="alert" role="alert">
          <h2>{t('register.rejected.title')}</h2>
          <ul className="reasons">
            {result.errors.map((err) => (
              <li key={err}>{errorText(t, err, result.conflict)}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="form" onSubmit={onSubmit} noValidate>
        <label className="field">
          {t('register.url')}
          <input type="url" inputMode="url" value={form.url} onChange={(e) => set('url')(e.target.value)} placeholder="https://www.kleinanzeigen.de/..." />
        </label>
        <div className="grid-3">
          <label className="field">
            {t('register.make')}
            <input value={form.make} onChange={(e) => set('make')(e.target.value)} />
          </label>
          <label className="field">
            {t('register.model')}
            <input value={form.model} onChange={(e) => set('model')(e.target.value)} />
          </label>
          <label className="field">
            {t('register.year')}
            <input inputMode="numeric" maxLength={4} value={form.year} onChange={(e) => set('year')(e.target.value)} />
          </label>
        </div>
        <div className="grid-3">
          <PlateInput value={form.plate} onChange={set('plate')} label={t('register.plate')} />
          <label className="field">
            {t('register.vin')}
            <input value={form.vin} maxLength={17} onChange={(e) => set('vin')(e.target.value.toUpperCase())} />
          </label>
          <label className="field">
            {t('register.renavam')}
            <input inputMode="numeric" maxLength={11} value={form.renavam} onChange={(e) => set('renavam')(e.target.value)} />
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
        <label className="field">
          {t('register.proof')}
          <input type="file" accept="application/pdf,image/*" onChange={(e) => set('proofFileName')(e.target.files?.[0]?.name ?? '')} />
          <small>{form.proofFileName || t('register.proofHint')}</small>
        </label>
        <p className="muted small">{t('register.simulated')}</p>
        <div className="actions">
          <button className="button button-primary" type="submit">{t('register.submit')}</button>
          <button type="button" className="button button-quiet" onClick={() => setForm(DEMO)}>{t('register.demoFill')}</button>
        </div>
      </form>
    </section>
  )
}

function errorText(t: ReturnType<typeof useI18n>['t'], err: string, conflict?: Listing): string {
  return t(`error.${err}` as MessageKey, { id: conflict?.checkId ?? '', site: conflict?.site ?? '' })
}
