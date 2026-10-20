import { useI18n, type MessageKey } from '../i18n'
import type { useAppState } from '../lib/store'
import { getAuthProvider, type Account } from '../lib/auth'
import { displaySite, listingHref } from '../lib/mockListing'
import { maskPlate } from '../lib/validation'
import { appendLog, markSold, publishListing, reviewVehicle, type LogEntry } from '../lib/verify'

type Props = ReturnType<typeof useAppState> & {
  account: Account | null
  onAccountChange: (account: Account) => void
}

export function ActivityPage({ state, update, reset, account, onAccountChange }: Props) {
  const { t, locale } = useI18n()
  const auth = getAuthProvider()
  const listings = [...state.listings].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  // A conta precisa estar aprovada para liberar o veículo e, só então, publicar.
  const sellerApproved = account?.verification === 'approved'

  function sold(checkId: string, site: string) {
    update((s) => appendLog(markSold(s, checkId), { type: 'sold', site, result: checkId }))
  }

  // Demonstração: faz o papel da empresa que confere os documentos do vendedor.
  async function decideAccount(decision: 'approved' | 'rejected') {
    if (!account || !auth.completeVerification) return
    const next = await auth.completeVerification({ accountId: account.id, decision })
    if (next) onAccountChange(next)
  }

  // Conferência do veículo pela empresa (aprovar exige o vendedor já aprovado).
  function decideVehicle(checkId: string, decision: 'approved' | 'rejected') {
    update((s) => {
      const res = reviewVehicle(s, checkId, decision, sellerApproved)
      return res.ok ? res.state : s
    })
  }

  function publish(checkId: string) {
    update((s) => {
      const res = publishListing(s, checkId, sellerApproved)
      return res.ok ? res.state : s
    })
  }

  function resultText(entry: LogEntry): string {
    if (entry.type === 'check') return t(`status.${entry.result}` as MessageKey)
    if (entry.type === 'rejected') return t(`error.${entry.result.split(', ')[0]}` as MessageKey, { id: '', site: entry.site })
    if (entry.type === 'report') return t('log.report')
    return entry.result
  }

  const accountState = account?.verification
  const accountNote =
    accountState === 'approved' ? t('activity.account.approved') : accountState === 'rejected' ? t('activity.account.rejected') : t('activity.account.pending')

  return (
    <section className="page">
      <h1>{t('activity.title')}</h1>
      <p className="muted">{t('activity.localNote')}</p>

      {accountState && (
        <div className="sheet account-card">
          <h2 className="section-title">{t('activity.account')}</h2>
          <p className={`verification ${accountState}`}>{accountNote}</p>
          <p className="muted small">{account?.notifyBy === 'sms' ? t('activity.account.bySms') : t('activity.account.byEmail')}</p>
          {auth.completeVerification && (
            <>
              <p className="muted small">{t('activity.account.demo')}</p>
              <div className="actions">
                <button type="button" disabled={accountState === 'approved'} onClick={() => void decideAccount('approved')}>{t('activity.account.approve')}</button>
                <button type="button" className="button button-quiet" onClick={() => void decideAccount('rejected')}>{t('activity.account.reject')}</button>
              </div>
            </>
          )}
        </div>
      )}

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
                <td>
                  <span className={`badge ${l.status}`}>{t(`activity.status.${l.status}` as MessageKey)}</span>
                  {l.status === 'draft' && (
                    <small className="draft-review">{t(`activity.vehicle.${l.vehicleReview ?? 'pending'}` as MessageKey)}</small>
                  )}
                </td>
                <td>
                  {l.status === 'active' && (
                    <button type="button" className="text-button" onClick={() => sold(l.checkId, l.site)}>{t('activity.markSold')}</button>
                  )}
                  {l.status === 'draft' && (
                    <div className="draft-actions">
                      {l.vehicleReview !== 'approved' && (
                        <button type="button" className="text-button" disabled={!sellerApproved} title={!sellerApproved ? t('activity.needSeller') : undefined} onClick={() => decideVehicle(l.checkId, 'approved')}>
                          {t('activity.vehicle.approve')}
                        </button>
                      )}
                      {l.vehicleReview !== 'rejected' && (
                        <button type="button" className="text-button" onClick={() => decideVehicle(l.checkId, 'rejected')}>{t('activity.vehicle.reject')}</button>
                      )}
                      <button type="button" disabled={!sellerApproved || l.vehicleReview !== 'approved'} onClick={() => publish(l.checkId)}>{t('activity.publish')}</button>
                    </div>
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
