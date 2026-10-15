import { useState, type FormEvent } from 'react'
import { Leaders } from '../components/Leaders'
import { PlateInput } from '../components/PlateInput'
import { useI18n, type MessageKey } from '../i18n'
import { DEMO_URLS } from '../lib/seed'
import type { useAppState } from '../lib/store'
import { parseListingUrl } from '../lib/url'
import { maskPlate } from '../lib/validation'
import { addReport, appendLog, check, type CheckResult } from '../lib/verify'

type Props = ReturnType<typeof useAppState>

export function CheckPage({ state, update }: Props) {
  const { t, locale } = useI18n()
  const [url, setUrl] = useState('')
  const [plate, setPlate] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [reported, setReported] = useState(false)
  // Muda a cada consulta para que o carimbo "bata" de novo, mesmo com o mesmo resultado.
  const [run, setRun] = useState(0)

  function runCheck(nextUrl: string, nextPlate: string) {
    const res = check(state, { url: nextUrl, plate: nextPlate })
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
    runCheck(exampleUrl, examplePlate)
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
          <PlateInput value={plate} onChange={setPlate} label={t('check.plate')} />
          <button className="button button-primary" type="submit">{t('check.submit')}</button>
        </div>
        <p className="muted small">{t('check.plateHint')}</p>
      </form>

      <div className="examples">
        <span>{t('check.examples')}</span>
        <button type="button" className="text-button" onClick={() => tryExample(DEMO_URLS.verified)}>{t('check.example.verified')}</button>
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
              <a className="button button-primary" href={result.listing.url} target="_blank" rel="noopener noreferrer">{t('result.openListing')}</a>
            </>
          )}

          {result.related.length > 0 && (
            <div className="report-part">
              <h3>{t('result.related')}</h3>
              <ul className="plain-list">
                {result.related.map((l) => (
                  <li key={l.checkId}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer">{l.site}</a>, {l.make} {l.model} {l.year}
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

function siteOf(url: string): string {
  return parseListingUrl(url)?.site ?? '-'
}
