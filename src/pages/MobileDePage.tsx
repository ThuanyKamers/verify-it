import { useState } from 'react'
import { CarArt, type CarView } from '../components/CarArt'
import { PhotoCredit, VehicleImage } from '../components/VehicleImage'
import { useI18n } from '../i18n'
import { describe, mockDetails } from '../lib/mockListing'
import { photoFor, vehicleKind } from '../lib/photos'
import { maskPlate } from '../lib/validation'
import type { Listing } from '../lib/verify'
import '../marketplace.css'
import '../mobilede.css'

const VIEWS: CarView[] = ['side', 'front', 'rear', 'cabin']

/** Ícones de traço, no estilo dos ícones laranja do mobile.de. */
const ICONS = {
  back: 'M19 12H5m6-6-6 6 6 6',
  images: 'M4 6h12v12H4V6zm4-2h12v12M7 15l3-4 3 3 2-2 1 3',
  grid: 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z',
  zoom: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8M10.5 8v5M8 10.5h5',
  prev: 'M15 5 8 12l7 7',
  next: 'M9 5l7 7-7 7',
  speed: 'M4 17a8 8 0 1 1 16 0M12 17l4-6',
  fuel: 'M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M3 20h13M5 10h9m0 1h2a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0V8l-3-3',
  gear: 'M6 4v16M12 4v16M18 4v8M6 12h12',
  calendar: 'M5 6h14v14H5V6zm0 4h14M9 4v4m6-4v4',
  check: 'M5 12.5 10 17l9-10',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  follow: 'M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-6 8c0-3 2.7-5 6-5m8-1v6m-3-3h6',
  flag: 'M5 21V4h11l-2 4 2 4H5',
}

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg className="mo-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

/** Cópia fictícia de um anúncio do mobile.de, no tema escuro atual do site. */
export function MobileDePage({ listing: l }: { listing: Listing }) {
  const { t, locale } = useI18n()
  const [index, setIndex] = useState(0)
  const [allFeatures, setAllFeatures] = useState(false)
  const d = mockDetails(l)
  const photo = photoFor(l)
  const moto = vehicleKind(l) === 'motorcycle'
  const total = photo ? 1 : VIEWS.length
  const sky = l.plate.charCodeAt(0) % 4
  const go = (step: number) => setIndex((i) => (i + step + total) % total)

  const price = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(d.price)
  const km = `${new Intl.NumberFormat(locale).format(d.km)} km`
  const longDate = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' })
  const since = longDate.format(new Date(d.memberSince, l.plate.length % 12, 1 + (l.plate.charCodeAt(0) % 27)))
  const german = new Intl.DisplayNames([locale], { type: 'language' }).of('de') ?? 'Deutsch'

  const facts: [keyof typeof ICONS, string, string][] = [
    ['speed', t('cl.mileage'), km],
    ['calendar', t('ka.firstReg'), String(l.year)],
    ['fuel', t('cl.fuel'), t(d.fuel)],
    ['gear', t('cl.transmission'), t(d.transmission)],
  ]

  const tech: [string, string][] = [
    [t('mo.condition'), t('mo.conditionValue')],
    [t('mo.category'), t(moto ? 'mo.cat.moto' : 'mo.cat.car')],
    [t('cl.make'), l.make],
    [t('cl.model'), l.model],
    [t('cl.mileage'), km],
    [t('ka.firstReg'), String(l.year)],
    [t('cl.color'), t(d.exterior)],
    [t('mo.owners'), String(d.owners)],
    [t('cl.plate'), maskPlate(l.plate)],
  ]
  const features = allFeatures ? d.features : d.features.slice(0, 6)

  return (
    <div className="mp mo">
      <div className="mp-demo">
        <span>{t('mp.demo')}</span>
        <a href="#">{t('mp.back')}</a>
      </div>
      <header className="mo-top">
        <div className="mo-wrap"><strong className="mo-logo">mobile.de</strong></div>
      </header>

      <main className="mo-wrap">
        <a className="mo-back" href="#"><Icon name="back" />{t('mo.back')}</a>
        {l.status === 'sold' && <p className="cl-sold" role="status">{t('cl.soldBanner')}</p>}

        <div className="mo-grid">
          <div className="mo-main">
            <section className="mo-card mo-gallery" aria-label={`${l.make} ${l.model}`}>
              <div className="mo-stage">
                <VehicleImage photo={photo} alt={`${l.make} ${l.model}`} view={VIEWS[index]} body={d.bodyColor} sky={sky} />
                <span className="mo-count"><Icon name="images" />{index + 1}/{total}</span>
                <button type="button" className="mo-arrow mo-prev" onClick={() => go(-1)} aria-label={t('mp.prev')} disabled={total === 1}><Icon name="prev" /></button>
                <button type="button" className="mo-arrow mo-next" onClick={() => go(1)} aria-label={t('mp.next')} disabled={total === 1}><Icon name="next" /></button>
                <div className="mo-stage-actions">
                  <button type="button" className="mo-chip"><Icon name="grid" />{t('mo.allImages')}</button>
                  <button type="button" className="mo-chip"><Icon name="zoom" />{t('mo.maximize')}</button>
                </div>
              </div>
              {photo ? <PhotoCredit photo={photo} className="mo-credit" /> : (
                <div className="mo-thumbs">
                  {VIEWS.map((v, i) => (
                    <button key={v} type="button" className={i === index ? 'on' : ''} onClick={() => setIndex(i)} aria-label={t('mp.photo', { n: i + 1, total })} aria-current={i === index}>
                      <CarArt view={v} body={d.bodyColor} sky={sky} />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="mo-card">
              <ul className="mo-facts">
                {facts.map(([icon, label, value]) => (
                  <li key={label}><Icon name={icon} /><span><small>{label}</small><strong>{value}</strong></span></li>
                ))}
              </ul>
            </section>

            <section className="mo-card">
              <h2>{t('mo.techData')}</h2>
              <dl className="mo-table">
                {tech.map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            </section>

            <section className="mo-card">
              <h2>{t('ka.features')}</h2>
              <ul className="mo-features">
                {features.map((f) => <li key={f}><span>{t(f)}</span><Icon name="check" /></li>)}
              </ul>
              {d.features.length > 6 && !allFeatures && (
                <button type="button" className="mo-more" onClick={() => setAllFeatures(true)}>{t('mo.showMore')}</button>
              )}
            </section>

            <section className="mo-card">
              <h2>{t('cl.description')}</h2>
              <p className="mo-desc">{describe(d, t)}</p>
            </section>

            <section className="mo-card">
              <h2>{t('mo.seller')}</h2>
              <p className="mo-seller-name">{d.seller}</p>
              <p>{t('mo.private')}<br />{d.city}</p>
              <div className="mo-seller-meta">
                <p>{t('mo.since', { date: since })}</p>
                <p>{t('mo.speak')}<br />{german}</p>
              </div>
              <div className="mo-follow">
                <p>{t('mo.followTitle')}</p>
                <button type="button" className="mo-btn mo-btn-purple"><Icon name="follow" />{t('mo.follow')}</button>
              </div>

              <h2 className="mo-sub-title">{t('mo.location')}</h2>
              <div className="mo-map" aria-hidden="true">
                <svg viewBox="0 0 600 240" preserveAspectRatio="xMidYMid slice">
                  <rect width="600" height="240" fill="#eef0ec" />
                  <path d="M0 40h600M0 170h600M140 0v240M420 0v240" stroke="#fff" strokeWidth="10" />
                  <path d="M0 120c120-20 260 30 380 0s180-30 220-10" stroke="#9db3d6" strokeWidth="14" fill="none" />
                  <rect x="20" y="60" width="100" height="90" rx="6" fill="#cfe8c4" />
                  <rect x="450" y="190" width="120" height="40" rx="6" fill="#cfe8c4" />
                  <path d="M300 112c-11 0-20 9-20 20 0 15 20 36 20 36s20-21 20-36c0-11-9-20-20-20z" fill="#e53935" />
                  <circle cx="300" cy="132" r="7" fill="#fff" />
                  <rect x="215" y="40" width="170" height="58" rx="4" fill="#1c1b21" />
                  <text x="230" y="62" fontSize="13" fill="#d2d0da">{t('mo.vehicleLocation')}</text>
                  <text x="230" y="84" fontSize="15" fontWeight="700" fill="#fff">{d.city}</text>
                </svg>
              </div>
            </section>

            <section className="mo-card">
              <h2>{t('mo.price')}</h2>
              <p className="mo-price-big">{price}</p>
              <p className="mo-small">{t('mo.noVat')}</p>
            </section>
          </div>

          <aside className="mo-side">
            <section className="mo-card mo-summary">
              <h1>{l.make} {l.model}</h1>
              <p className="mo-variant">{l.year} · {t(d.fuel)} · {t(d.transmission)}</p>
              <p className="mo-price">{price}</p>
              <p className="mo-small">{km} · {d.city}</p>
              <p className="mo-rating"><span aria-hidden="true">●</span>{t('mo.rating')}</p>
              <button type="button" className="mo-btn mo-btn-orange">{t('mo.contact')}</button>
              <div className="mo-pair">
                <button type="button" className="mo-btn mo-btn-outline"><Icon name="heart" />{t('mo.park')}</button>
                <button type="button" className="mo-btn mo-btn-outline"><Icon name="share" />{t('mo.share')}</button>
              </div>
            </section>
            <a className="mo-report" href="#" onClick={(e) => e.preventDefault()}><Icon name="flag" />{t('ka.report')}</a>
          </aside>
        </div>
      </main>
    </div>
  )
}
