import { useState } from 'react'
import { CarArt, type CarView } from '../components/CarArt'
import { PhotoCredit, VehicleImage } from '../components/VehicleImage'
import { useI18n } from '../i18n'
import { describe, listingHref, mockDetails, siteTheme } from '../lib/mockListing'
import { photoFor, vehicleKind } from '../lib/photos'
import { maskPlate } from '../lib/validation'
import type { AppState, Listing } from '../lib/verify'
import '../marketplace.css'
import '../kleinanzeigen.css'

const VIEWS: CarView[] = ['side', 'front', 'rear', 'cabin']

/** Ícones de traço fino, no estilo dos ícones do Kleinanzeigen. */
const ICONS = {
  tag: 'M3 12V4h8l10 10-8 8L3 12zm4.5-4.5a1.5 1.5 0 1 0 0 .01',
  message: 'M4 5h16v11H8l-4 4V5zm4 4h8m-8 3h5',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  share: 'M12 15V4m0 0L8 8m4-4 4 4M5 13v6h14v-6',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8c0-3.3 3.1-5 7-5s7 1.7 7 5',
  bookmark: 'M7 4h10v16l-5-4-5 4V4z',
  follow: 'M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-6 8c0-3 2.7-5 6-5m8-1v6m-3-3h6',
  pin: 'M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zm0-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  calendar: 'M5 6h14v14H5V6zm0 4h14M9 4v4m6-4v4',
  eye: 'M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  camera: 'M4 8h4l2-2h4l2 2h4v11H4V8zm8 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  warning: 'M12 4 2 20h20L12 4zm0 6v5m0 2v1',
  prev: 'M15 5 8 12l7 7',
  next: 'M9 5l7 7-7 7',
}

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg className="ka-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

/** ID numérico do anúncio, tirado do link do Kleinanzeigen (ex.: .../2851122334-216-3912). */
function adId(l: Listing): string {
  return /\/(\d{9,})-/.exec(l.url)?.[1] ?? l.checkId
}

/** Cópia fictícia de um anúncio do Kleinanzeigen, no layout atual do site. */
export function KleinanzeigenPage({ state, listing: l }: { state: AppState; listing: Listing }) {
  const { t, locale } = useI18n()
  const [index, setIndex] = useState(0)
  const d = mockDetails(l)
  const photo = photoFor(l)
  const moto = vehicleKind(l) === 'motorcycle'
  const total = photo ? 1 : VIEWS.length
  const sky = l.plate.charCodeAt(0) % 4
  const go = (step: number) => setIndex((i) => (i + step + total) % total)

  const title = `${l.make} ${l.model}, ${l.year}`
  const price = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(d.price)
  const number = new Intl.NumberFormat(locale)
  const longDate = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  const views = 40 + (l.plate.charCodeAt(l.plate.length - 1) * 7) % 300
  const activeSince = longDate.format(new Date(d.memberSince, l.plate.length % 12, 1 + (l.plate.charCodeAt(0) % 27)))

  const details: [string, string][] = [
    [t('cl.make'), l.make],
    [t('cl.model'), l.model],
    [t('cl.mileage'), `${number.format(d.km)} km`],
    [t('ka.firstReg'), String(l.year)],
    [t('cl.fuel'), t(d.fuel)],
    [t('cl.transmission'), t(d.transmission)],
    [t('cl.color'), t(d.exterior)],
    [t('cl.plate'), maskPlate(l.plate)],
  ]

  const related = state.listings
    .filter((x) => x.status === 'active' && x.checkId !== l.checkId && x.plate !== l.plate && siteTheme(x.site) === 'kleinanzeigen')
    .slice(0, 3)

  return (
    <div className="mp ka">
      <div className="mp-demo">
        <span>{t('mp.demo')}</span>
        <a href="#">{t('mp.back')}</a>
      </div>
      <header className="ka-top">
        <div className="ka-wrap">
          <strong className="ka-logo">kleinanzeigen</strong>
        </div>
      </header>

      <main className="ka-wrap">
        <p className="ka-crumb">
          <a href="#" onClick={(e) => e.preventDefault()}>{t('ka.crumbCity', { city: d.city })}</a> ›{' '}
          <a href="#" onClick={(e) => e.preventDefault()}>{t('ka.crumbCat')}</a> ›{' '}
          <a href="#" onClick={(e) => e.preventDefault()}>{t(moto ? 'ka.crumbMotos' : 'ka.crumbCars')}</a> ›
        </p>
        {l.status === 'sold' && <p className="cl-sold" role="status">{t('cl.soldBanner')}</p>}

        <div className="ka-grid">
          <div className="ka-main">
            <section className="ka-gallery" aria-label={title}>
              <div className="ka-backdrop" aria-hidden="true">
                <VehicleImage photo={photo} alt="" view={VIEWS[index]} body={d.bodyColor} sky={sky} />
              </div>
              <div className="ka-photo">
                <VehicleImage photo={photo} alt={title} view={VIEWS[index]} body={d.bodyColor} sky={sky} />
              </div>
              <button type="button" className="ka-arrow ka-prev" onClick={() => go(-1)} aria-label={t('mp.prev')} disabled={total === 1}><Icon name="prev" /></button>
              <button type="button" className="ka-arrow ka-next" onClick={() => go(1)} aria-label={t('mp.next')} disabled={total === 1}><Icon name="next" /></button>
              <span className="ka-count"><Icon name="camera" />{index + 1}/{total}</span>
            </section>
            {photo ? <PhotoCredit photo={photo} className="ka-credit" /> : (
              <div className="ka-thumbs">
                {VIEWS.map((v, i) => (
                  <button key={v} type="button" className={i === index ? 'on' : ''} onClick={() => setIndex(i)} aria-label={t('mp.photo', { n: i + 1, total })} aria-current={i === index}>
                    <CarArt view={v} body={d.bodyColor} sky={sky} />
                  </button>
                ))}
              </div>
            )}

            <section className="ka-box ka-head">
              <h1>{title}</h1>
              <p className="ka-price">{price} <span>{t('ka.vb')}</span></p>
              <p className="ka-meta"><Icon name="pin" />{d.city}</p>
              <p className="ka-meta">
                <Icon name="calendar" />{longDate.format(new Date(l.createdAt))}
                <span className="ka-views"><Icon name="eye" /><span aria-hidden="true">{views}</span><span className="visually-hidden">{t('ka.views', { n: views })}</span></span>
              </p>
            </section>

            <section className="ka-box">
              <h2>{t('cl.details')}</h2>
              <dl className="ka-details">
                {details.map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
              <h3>{t('ka.features')}</h3>
              <ul className="ka-chips">
                {d.features.map((f) => <li key={f}>{t(f)}</li>)}
              </ul>
            </section>

            <section className="ka-box">
              <h2>{t('cl.description')}</h2>
              <p className="ka-desc">{describe(d, t)}</p>
            </section>

            <section className="ka-box">
              <h2>{t('ka.message')}</h2>
              <button type="button" className="ka-btn ka-btn-primary ka-btn-inline"><Icon name="message" />{t('ka.send')}</button>
            </section>
          </div>

          <aside className="ka-side">
            <button type="button" className="ka-btn ka-btn-primary"><Icon name="tag" />{t('ka.offer')}</button>
            <button type="button" className="ka-btn"><Icon name="message" />{t('ka.message')}</button>
            <button type="button" className="ka-btn"><Icon name="heart" />{t('ka.watch')}</button>
            <button type="button" className="ka-btn"><Icon name="share" />{t('ka.share')}</button>

            <section className="ka-box ka-seller">
              <div className="ka-seller-row">
                <span className="mp-avatar ka-avatar" aria-hidden="true">{d.seller.charAt(0)}</span>
                <div>
                  <a href="#" onClick={(e) => e.preventDefault()} className="ka-seller-name">{d.seller}</a>
                  <p className="ka-sub"><Icon name="person" />{t('ka.private')}</p>
                  <p className="ka-sub"><Icon name="bookmark" />{t('ka.activeSince', { date: activeSince })}</p>
                </div>
              </div>
              <button type="button" className="ka-btn ka-btn-small"><Icon name="follow" />{t('ka.follow')}</button>
            </section>

            <dl className="ka-box ka-id">
              <dt>{t('ka.adId')}</dt>
              <dd>{adId(l)}</dd>
            </dl>

            <button type="button" className="ka-btn ka-btn-primary"><Icon name="warning" />{t('ka.report')}</button>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="ka-related">
            <h2>{t('ka.related')}</h2>
            <ul>
              {related.map((r) => {
                const rd = mockDetails(r)
                return (
                  <li key={r.checkId} className="ka-box ka-item">
                    <a className="ka-item-photo" href={listingHref(r)} tabIndex={-1} aria-hidden="true">
                      <VehicleImage photo={photoFor(r)} alt="" body={rd.bodyColor} sky={r.plate.charCodeAt(0) % 4} />
                    </a>
                    <div>
                      <p className="ka-item-meta">
                        <span><Icon name="pin" />{rd.city}</span>
                        <span><Icon name="calendar" />{longDate.format(new Date(r.createdAt))}</span>
                      </p>
                      <h3><a href={listingHref(r)}>{r.make} {r.model}, {r.year}</a></h3>
                      <p className="ka-item-desc">{describe(rd, t)}</p>
                      <p className="ka-item-price">{new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(rd.price)} {t('ka.vb')}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
