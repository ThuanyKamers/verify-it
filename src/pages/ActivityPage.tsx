import { useI18n, type MessageKey } from '../i18n'
import type { useAppState } from '../lib/store'
import { displaySite, listingHref } from '../lib/mockListing'
import { maskPlate } from '../lib/validation'
import { appendLog, markSold, type LogEntry } from '../lib/verify'

type Props = ReturnType<typeof useAppState>

export function ActivityPage({ state, update, reset }: Props) {
  const { t, locale } = useI18n()
  const listings = [...state.listings].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  function sold(checkId: string, site: string) {
    update((s) => appendLog(markSold(s, checkId), { type: 'sold', site, result: checkId }))
  }

  function resultText(entry: LogEntry): string {
    if (entry.type === 'check') return t(`status.${entry.result}` as MessageKey)
    if (entry.type === 'rejected') return t(`error.${entry.result.split(', ')[0]}` as MessageKey, { id: '', site: entry.site })
    if (entry.type === 'report') return t('log.report')
    return entry.result
  }

  return (
    <section className="page">
      <h1>{t('activity.title')}</h1>
      <p className="muted">{t('activity.localNote')}</p>

      <h2 className="section-title">{t('activity.listings')}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('result.checkId')}</th>
              <th>{t('result.vehicle')}</th>
              <th>{t('result.plate')}</th>
              <th>{t('result.site')}</th>
              <th>{t('log.result')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.checkId}>
                <td><code>{l.checkId}</code></td>
                <td>{l.make} {l.model} {l.year}</td>
                <td>{maskPlate(l.plate)}</td>
                <td><a href={listingHref(l)} target="_blank" rel="noopener noreferrer">{displaySite(l.site)}</a></td>
                <td><span className={`badge ${l.status}`}>{t(`activity.status.${l.status}` as MessageKey)}</span></td>
                <td>
                  {l.status === 'active' && (
                    <button type="button" className="text-button" onClick={() => sold(l.checkId, l.site)}>{t('activity.markSold')}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title">{t('activity.log')}</h2>
      {state.log.length === 0 ? (
        <p className="muted">{t('activity.empty')}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('log.when')}</th>
                <th>{t('log.type')}</th>
                <th>{t('log.site')}</th>
                <th>{t('log.result')}</th>
              </tr>
            </thead>
            <tbody>
              {state.log.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.at).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td>{t(`log.${entry.type}` as MessageKey)}</td>
                  <td>{entry.site}</td>
                  <td>{resultText(entry)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        className="button button-quiet reset"
        onClick={() => {
          if (window.confirm(t('activity.resetConfirm'))) reset()
        }}
      >
        {t('activity.reset')}
      </button>
    </section>
  )
}
