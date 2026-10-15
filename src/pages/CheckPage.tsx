import { useState, type FormEvent } from 'react'
import { Leaders } from '../components/Leaders'
import { PlateInput } from '../components/PlateInput'
import { listingHref } from '../lib/mockListing'
import { useI18n, type MessageKey } from '../i18n'
import { DEMO_URLS } from '../lib/seed'
import type { useAppState } from '../lib/store'
import { parseListingUrl } from '../lib/url'
import { maskPlate, type PlateCountry } from '../lib/validation'
import { addReport, appendLog, check, type CheckResult } from '../lib/verify'

type Props = ReturnType<typeof useAppState>

export function CheckPage({ state, update }: Props) {
  const { t, locale } = useI18n()
  const [url, setUrl] = useState('')
  const [plate, setPlate] = useState('')
  const [plateCountry, setPlateCountry] = useState<PlateCountry>('DE')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [reported, setReported] = useState(false)
  // Muda a cada consulta para que o carimbo "bata" de novo, mesmo com o mesmo resultado.
  const [run, setRun] = useState(0)
  // Posição do próximo exemplo de anúncio verificado: cada clique mostra outro veículo, em outro site.
  const [nextVerified, setNextVerified] = useState(0)

  function runCheck(nextUrl: string, nextPlate: string, country: PlateCountry = plateCountry) {
    const res = check(state, { url: nextUrl, plate: nextPlate, plateCountry: country })
    setResult(res)
    setReported(false)
    setRun((n) => n + 1)
    if (res.status !== 'invalid') {
      update((s) => appendLog(s, { type: 'check', site: res.listing?.site ?? siteOf(nextUrl), result: res.status }))
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    runCheck(url, plate)
  }

  function tryExample(exampleUrl: string, examplePlate = '') {
    setUrl(exampleUrl)
    setPlate(examplePlate)
    setPlateCountry('DE')
    runCheck(exampleUrl, examplePlate, 'DE')
  }

  /** Anúncios ativos em ordem embaralhada: o próximo nunca repete o veículo nem o site do anterior. */
  function tryVerified() {
    const active = state.listings.filter((l) => l.status === 'active').sort((a, b) => shuffleKey(a.checkId) - shuffleKey(b.checkId))
    if (active.length === 0) return tryExample(DEMO_URLS.verified)
    const last = result?.status === 'verified' ? result.listing : undefined
    let i = nextVerified % active.length
    for (let tries = 0; tries < active.length; tries++) {
      const l = active[i]
      if (!last || (l.plate !== last.plate && l.site !== last.site)) break
      i = (i + 1) % active.length
    }
    setNextVerified(i + 1)
    tryExample(active[i].url)
  }

  function report() {
    update((s) => {
      const next = addReport(s, url)
      return next ? appendLog(next, { type: 'report', site: siteOf(url), result: 'reported' }) : s
    })
    setReported(true)
    setResult((r) => (r ? { ...r, reportCount: r.reportCount + 1 } : r))
  }

  const date = (iso: string) => new Date(iso).toLocaleDateString(locale)
  const risky = result && result.status !== 'verified' && result.status !== 'invalid'
  // Todos os anúncios verificados do veículo, incluindo o que está sendo consultado.
  const official = !result ? [] : result.status === 'verified' && result.listing ? [result.listing, ...result.related] : result.related

  return (
    <section className="page">
      <h1>{t('check.title')}</h1>
      <p className="lead">{t('check.lead')}</p>

      <form className="form check-form" onSubmit={onSubmit}>
        <label className="field">
          {t('check.url')}
          <input type="url" inputMode="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t('check.urlPlaceholder')} />
        </label>
        <div className="check-row">
          <PlateInput value={plate} onChange={setPlate} country={plateCountry} onCountryChange={setPlateCountry} label={t('check.plate')} />
          <button className="button button-primary" type="submit">{t('check.submit')}</button>
        </div>
        <p className="muted small">{t('check.plateHint')}</p>
      </form>
      <p className="browse-link"><a className="button" href="#/market">{t('check.browse')}</a></p>

      <div className="examples">
        <span>{t('check.examples')}</span>
        <button type="button" className="text-button" onClick={tryVerified}>{t('check.example.verified')}</button>
        <button type="button" className="text-button" onClick={() => tryExample(DEMO_URLS.cloned, DEMO_URLS.clonedPlate)}>{t('check.example.cloned')}</button>
        <button type="button" className="text-button" onClick={() => tryExample(DEMO_URLS.unknown)}>{t('check.example.unknown')}</button>
      </div>

      {result && (
        <article className={`report report-${result.status}`} role="status" aria-live="polite">
          <h2 key={run} className="stamp">{t(`status.${result.status}` as MessageKey)}</h2>
          <p className="report-body">{t(`result.${result.status}.body` as MessageKey)}</p>

          {risky && (
            <ul className="reasons">
              {result.reasons.map((r) => (
                <li key={r}>{t(`reason.${r}` as MessageKey, { n: result.reportCount })}</li>
              ))}
            </ul>
          )}

          {result.status === 'verified' && result.listing && (
            <>
              <Leaders
                rows={[
                  { label: t('result.vehicle'), value: `${result.listing.make} ${result.listing.model} ${result.listing.year}` },
                  { label: t('result.plate'), value: maskPlate(result.listing.plate) },
                  { label: t('result.site'), value: result.listing.site },
                  { label: t('result.verifiedOn'), value: date(result.listing.createdAt) },
                  { label: t('result.checkId'), value: <code>{result.listing.checkId}</code> },
                ]}
              />
              {result.reportCount > 0 && <p className="warning">{t('result.reportsWarning', { n: result.reportCount })}</p>}
            </>
          )}

          {official.length > 0 && (
            <div className="report-part">
              <h3>{t('result.related')}</h3>
              <ul className="plain-list">
                {official.map((l) => (
                  <li key={l.checkId}>
                    <a href={listingHref(l)} target="_blank" rel="noopener noreferrer">{l.site}</a>, {l.make} {l.model} {l.year}
                    {l.checkId === result.listing?.checkId && result.status === 'verified' && <> ({t('result.thisListing')})</>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {risky && (
            <>
              <div className="report-part">
                <h3>{t('result.tips.title')}</h3>
                <ul className="plain-list">
                  <li>{t('result.tips.1')}</li>
                  <li>{t('result.tips.2')}</li>
                  <li>{t('result.tips.3')}</li>
                </ul>
              </div>
              {reported ? (
                <p className="confirmation">{t('result.reported')}</p>
              ) : (
                <button type="button" className="button button-danger" onClick={report}>{t('result.report')}</button>
              )}
            </>
          )}
        </article>
      )}
    </section>
  )
}

/** Ordem fixa, mas sem relação com a ordem de cadastro, para os exemplos variarem de site e de veículo. */
function shuffleKey(id: string): number {
  return [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 1009, 7)
}

function siteOf(url: string): string {
  return parseListingUrl(url)?.site ?? '-'
}
