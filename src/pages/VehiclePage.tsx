import { useRef, useState } from 'react'
import { CarArt, type CarView } from '../components/CarArt'
import { PhotoCredit, VehicleImage } from '../components/VehicleImage'
import { useI18n } from '../i18n'
import { describe, mockDetails } from '../lib/mockListing'
import { photoFor, vehicleKind } from '../lib/photos'
import { maskPlate } from '../lib/validation'
import type { AppState } from '../lib/verify'

const VIEWS: CarView[] = ['side', 'front', 'rear', 'cabin']

/** Página do anúncio dentro do marketplace do Verify It: `#/market/{checkId}`. */
export function VehiclePage({ state, checkId }: { state: AppState; checkId: string }) {
  const { t, locale } = useI18n()
  const [index, setIndex] = useState(0)
  const [sent, setSent] = useState(false)
  const [draft, setDraft] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const l = state.listings.find((x) => x.checkId === checkId)

  if (!l) {
    return (
      <section className="page vehicle">
        <a className="vehicle-back" href="#/market">← {t('vp.back')}</a>
        <p className="market-empty">{t('vp.missing')}</p>
      </section>
    )
  }

  const d = mockDetails(l)
  const photo = photoFor(l)
  const moto = vehicleKind(l) === 'motorcycle'
  const sky = [...l.plate].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 4
  const price = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(d.price)
  const km = `${new Intl.NumberFormat(locale).format(d.km)} km`
  const title = `${l.make} ${l.model}`

  const rows: [string, string][] = [
    [t('cl.make'), l.make],
    [t('cl.model'), l.model],
    [t('cl.year'), String(l.year)],
    [t('cl.mileage'), km],
    [t('cl.fuel'), t(d.fuel)],
    [t('cl.transmission'), t(d.transmission)],
    [t('cl.color'), t(d.exterior)],
    [t('mo.owners'), String(d.owners)],
    [t('cl.plate'), maskPlate(l.plate)],
  ]

  return (
    <section className="page vehicle">
      <a className="vehicle-back" href="#/market">← {t('vp.back')}</a>
      {l.status === 'sold' && <p className="vehicle-sold" role="status">{t('cl.soldBanner')}</p>}

      <div className="vehicle-grid">
        <div className="vehicle-main">
          <figure className="vehicle-gallery">
            <div className="vehicle-stage">
              <VehicleImage photo={photo} alt={title} view={VIEWS[index]} body={d.bodyColor} sky={sky} />
            </div>
            {photo ? <PhotoCredit photo={photo} className="vehicle-credit" /> : (
              <div className="vehicle-thumbs">
                {VIEWS.map((v, i) => (
                  <button key={v} type="button" aria-current={i === index} aria-label={t('mp.photo', { n: i + 1, total: VIEWS.length })} onClick={() => setIndex(i)}>
                    <CarArt view={v} body={d.bodyColor} sky={sky} />
                  </button>
                ))}
              </div>
            )}
          </figure>

          <section className="vehicle-block">
            <h2>{t('cl.details')}</h2>
            <dl className="vehicle-table">
              {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </section>

          {d.features.length > 0 && (
            <section className="vehicle-block">
              <h2>{t('ka.features')}</h2>
              <ul className="vehicle-features">
                {d.features.map((f) => <li key={f}>{t(f)}</li>)}
              </ul>
            </section>
          )}

          <section className="vehicle-block">
            <h2>{t('cl.description')}</h2>
            <p className="vehicle-desc">{describe(d, t)}</p>
          </section>
        </div>

        <aside className="vehicle-side">
          <div className="vehicle-card">
            <p className="vehicle-kind">{t(moto ? 'mk.type.motorcycle' : 'mk.type.car')}</p>
            <h1>{title}</h1>
            <p className="muted">{l.year} · {km} · {d.city}</p>
            <p className="vehicle-price">{price}</p>
            {sent ? (
              <p className="vehicle-sent" role="status">{t('vp.sent', { name: d.seller })}</p>
            ) : (
              <button type="button" className="button button-primary" onClick={() => { setDraft(t('vp.draft', { vehicle: title })); dialog.current?.showModal() }} disabled={l.status === 'sold'}>{t('vp.contact')}</button>
            )}
            <div className="vehicle-seller">
              <span className="vehicle-avatar" aria-hidden="true">{d.seller.charAt(0)}</span>
              <span><strong>{d.seller}</strong><br /><span className="muted">{t('vp.owner')}</span></span>
            </div>
          </div>
        </aside>
      </div>
      <dialog ref={dialog} className="vehicle-dialog" aria-labelledby="vehicle-dialog-title">
        <form method="dialog" onSubmit={() => setSent(true)}>
          <h2 id="vehicle-dialog-title">{t('vp.dialogTitle', { name: d.seller })}</h2>
          <p className="muted">{title} · {price}</p>
          <label className="field">
            {t('vp.message')}
            <textarea rows={5} value={draft} onChange={(e) => setDraft(e.target.value)} required />
          </label>
          <div className="vehicle-dialog-actions">
            <button type="button" className="button" onClick={() => dialog.current?.close()}>{t('vp.cancel')}</button>
            <button type="submit" className="button button-primary">{t('vp.send')}</button>
          </div>
        </form>
      </dialog>
    </section>
  )
}
