import { useState, type FormEvent } from 'react'
import { useI18n, type MessageKey } from '../i18n'
import { DEMO_URLS } from '../lib/seed'
import type { useAppState } from '../lib/store'
import { parseListingUrl } from '../lib/url'
import { maskPlate } from '../lib/validation'
import { addReport, appendLog, check, type CheckResult } from '../lib/verify'

type Props = ReturnType<typeof useAppState>

const ICONS = { verified: '✓', scam: '!', unverified: '?', invalid: '×' } as const

export function CheckPage({ state, update }: Props) {
  const { t, locale } = useI18n()
  const [url, setUrl] = useState('')
  const [plate, setPlate] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [reported, setReported] = useState(false)

  function run(nextUrl: string, nextPlate: string) {
    const res = check(state, { url: nextUrl, plate: nextPlate })
    setResult(res)
    setReported(false)
    if (res.status !== 'invalid') {
      update((s) => appendLog(s, { type: 'check', site: res.listing?.site ?? siteOf(nextUrl), result: res.status }))
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    run(url, plate)
  }

  function tryExample(exampleUrl: string, examplePlate = '') {
    setUrl(exampleUrl)
    setPlate(examplePlate)
    run(exampleUrl, examplePlate)
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

  return (
    <section>
      <h1>{t('check.title')}</h1>
      <p className="lead">{t('check.lead')}</p>

      <form className="card form" onSubmit={onSubmit}>
        <label>
          {t('check.url')}
          <input type="url" inputMode="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t('check.urlPlaceholder')} />
        </label>
        <label>
          {t('check.plate')}
          <input value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="ABC1D23" maxLength={8} autoCapitalize="characters" />
          <small>{t('check.plateHint')}</small>
        </label>
        <button className="primary" type="submit">{t('check.submit')}</button>
      </form>

      <div className="examples">
        <span>{t('check.examples')}</span>
        <button type="button" className="chip" onClick={() => tryExample(DEMO_URLS.verified)}>{t('check.example.verified')}</button>
        <button type="button" className="chip" onClick={() => tryExample(DEMO_URLS.cloned, DEMO_URLS.clonedPlate)}>{t('check.example.cloned')}</button>
        <button type="button" className="chip" onClick={() => tryExample(DEMO_URLS.unknown)}>{t('check.example.unknown')}</button>
      </div>

      {result && (
        <div className={`card result ${result.status}`} role="status" aria-live="polite">
          <div className="result-head">
            <span className="result-icon" aria-hidden="true">{ICONS[result.status]}</span>
            <div>
              <h2>{t(`result.${result.status}.title` as MessageKey)}</h2>
              <p>{t(`result.${result.status}.body` as MessageKey)}</p>
            </div>
          </div>

          {result.status !== 'verified' && result.status !== 'invalid' && (
            <ul className="reasons">
              {result.reasons.map((r) => (
                <li key={r}>{t(`reason.${r}` as MessageKey, { n: result.reportCount })}</li>
              ))}
            </ul>
          )}

          {result.status === 'verified' && result.listing && (
            <>
              <dl className="facts">
                <dt>{t('result.vehicle')}</dt>
                <dd>{result.listing.make} {result.listing.model} {result.listing.year}</dd>
                <dt>{t('result.plate')}</dt>
                <dd>{maskPlate(result.listing.plate)}</dd>
                <dt>{t('result.site')}</dt>
                <dd>{result.listing.site}</dd>
                <dt>{t('result.verifiedOn')}</dt>
                <dd>{date(result.listing.createdAt)}</dd>
                <dt>{t('result.checkId')}</dt>
                <dd><code>{result.listing.checkId}</code></dd>
              </dl>
              {result.reportCount > 0 && <p className="warning">{t('result.reportsWarning', { n: result.reportCount })}</p>}
              <a className="button primary" href={result.listing.url} target="_blank" rel="noopener noreferrer">{t('result.openListing')}</a>
            </>
          )}

          {result.related.length > 0 && (
            <div className="related">
              <h3>{t('result.related')}</h3>
              <ul>
                {result.related.map((l) => (
                  <li key={l.checkId}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer">{l.site}</a>
                    <span> · {l.make} {l.model} {l.year}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.status !== 'verified' && result.status !== 'invalid' && (
            <>
              <div className="tips">
                <h3>{t('result.tips.title')}</h3>
                <ul>
                  <li>{t('result.tips.1')}</li>
                  <li>{t('result.tips.2')}</li>
                  <li>{t('result.tips.3')}</li>
                </ul>
              </div>
              {reported ? (
                <p className="ok">{t('result.reported')}</p>
              ) : (
                <button type="button" className="danger" onClick={report}>{t('result.report')}</button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}

function siteOf(url: string): string {
  return parseListingUrl(url)?.site ?? '-'
}
