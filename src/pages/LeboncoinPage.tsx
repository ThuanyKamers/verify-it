import { useEffect, useState } from 'react'
import { CarArt } from '../components/CarArt'
import { PhotoCredit, VehicleImage } from '../components/VehicleImage'
import { useI18n, type MessageKey } from '../i18n'
import { describe, mockDetails } from '../lib/mockListing'
import { photoFor, vehicleKind } from '../lib/photos'
import { maskPlate } from '../lib/validation'
import type { Listing } from '../lib/verify'
import '../marketplace.css'
import '../leboncoin.css'

/** Juros fictícios do simulador de financiamento (ao ano). */
const RATE = 0.0599

/** Ícones de traço, no estilo dos ícones do leboncoin. */
const ICONS = {
  plus: 'M12 8v8m-4-4h8M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16zm4 4h4',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  chat: 'M12 20a8 8 0 1 0-7-4.1L4 20l4.1-1A8 8 0 0 0 12 20zM8.5 12h.01M12 12h.01M15.5 12h.01',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8c0-3.3 3.1-5 7-5s7 1.7 7 5',
  share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  similar: 'M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-1 3 3',
  trend: 'M3 7l6 6 4-4 8 8m0-5v5h-5',
  calc: 'M6 3h12v18H6V3zm2 3h8v3H8V6zm0 6h2m2 0h2m-6 3h2m2 0h2m-6 3h2m2 0h2',
  shield: 'M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6l7-3zm-3 9 2 2 4-4',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5V11z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13v4l3 2',
  next: 'M9 5l7 7-7 7',
  list: 'M8 7h11M8 12h11M8 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01',
  calendar: 'M5 6h14v14H5V6zm0 4h14M9 4v4m6-4v4',
  gauge: 'M4 17a8 8 0 1 1 16 0M12 17l4-6',
  fuel: 'M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M3 20h13M5 10h9m0 1h2a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0V8l-3-3',
  gear: 'M6 4v16M12 4v16M18 4v8M6 12h12',
  palette: 'M12 21a9 9 0 1 1 0-18v18z',
  owners: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-6 9c0-3 2.7-5 6-5s6 2 6 5m1-9a3 3 0 1 0 0-6m2 15c0-2-1-3.5-2.5-4.3',
  car: 'M4 16v-4l2-5h12l2 5v4H4zm0 0v2h3v-2m10 0v2h3v-2M4 12h16',
  plate: 'M3 7h18v10H3V7zm4 5h10',
}
type IconName = keyof typeof ICONS

function Icon({ name }: { name: IconName }) {
  return (
    <svg className="lbc-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

const CATEGORIES: MessageKey[] = ['lbc.cat.realEstate', 'lbc.cat.vehicles', 'lbc.cat.pro', 'lbc.cat.jobs', 'lbc.cat.fashion', 'lbc.cat.home', 'lbc.cat.family', 'lbc.cat.electronics', 'lbc.cat.hobbies', 'lbc.cat.other']

/** Parcela mensal (tabela Price) para o valor financiado em `months` meses. */
function monthlyRate(amount: number, months: number): number {
  if (amount <= 0) return 0
  const r = RATE / 12
  return (amount * r) / (1 - (1 + r) ** -months)
}

/** Cópia fictícia de um anúncio do leboncoin, no layout atual do site. */
export function LeboncoinPage({ listing: l }: { listing: Listing }) {
  const { t, locale } = useI18n()
  const d = mockDetails(l)
  const photo = photoFor(l)
  const moto = vehicleKind(l) === 'motorcycle'
  const sky = l.plate.charCodeAt(0) % 4
  const [sticky, setSticky] = useState(false)
  const [fullText, setFullText] = useState(false)
  const [amount, setAmount] = useState(String(d.price))
  const [months, setMonths] = useState(24)

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 560)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const euro = (v: number, digits = 0) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v)
  const km = `${new Intl.NumberFormat(locale).format(d.km)} km`
  const title = `${l.make} ${l.model}`
  const created = new Date(l.createdAt)
  const posted = t('lbc.posted', {
    date: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(created),
    time: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(created),
  })
  const likes = 3 + (l.plate.charCodeAt(1) % 9)
  const adsCount = 2 + (l.plate.length % 3)
  const text = describe(d, t)
  const rate = monthlyRate(Number(amount) || 0, months)

  const info: [IconName, string, string][] = [
    ['list', t('cl.make'), l.make],
    ['list', t('cl.model'), l.model],
    ['calendar', t('lbc.modelYear'), String(l.year)],
    ['gauge', t('cl.mileage'), km],
    ['fuel', t('lbc.energy'), t(d.fuel)],
    ['gear', t('lbc.gearbox'), t(d.transmission)],
    ['palette', t('cl.color'), t(d.exterior)],
    ['plate', t('cl.plate'), maskPlate(l.plate)],
  ]

  const history: [IconName, string, string][] = [
    ['owners', t('lbc.owners'), String(d.owners)],
    ['car', t('lbc.use'), t('lbc.useValue')],
    ['calendar', t('ka.firstReg'), String(l.year)],
  ]

  return (
    <div className="mp lbc">
      <div className="mp-demo">
        <span>{t('mp.demo')}</span>
        <a href="#">{t('mp.back')}</a>
      </div>

      <header className="lbc-top">
        <div className="lbc-wrap lbc-top-row">
          <strong className="lbc-logo">leboncoin</strong>
          <button type="button" className="lbc-publish"><Icon name="plus" />{t('lbc.publish')}</button>
          <label className="lbc-search">
            <span className="visually-hidden">{t('lbc.search')}</span>
            <input type="search" placeholder={t('lbc.search')} />
            <span className="lbc-search-btn" aria-hidden="true"><Icon name="search" /></span>
          </label>
          <nav className="lbc-tools" aria-label="leboncoin">
            {([['bell', 'lbc.mySearch'], ['heart', 'lbc.favorites'], ['chat', 'lbc.messages'], ['user', 'lbc.login']] as const).map(([icon, key]) => (
              <a key={key} href="#" onClick={(e) => e.preventDefault()}><Icon name={icon} /><span>{t(key)}</span></a>
            ))}
          </nav>
        </div>
        <nav className="lbc-wrap lbc-cats" aria-label={t('lbc.categories')}>
          {CATEGORIES.map((c) => <a key={c} href="#" onClick={(e) => e.preventDefault()}>{t(c)}</a>)}
          <a href="#" className="lbc-deals" onClick={(e) => e.preventDefault()}>{t('lbc.cat.deals')}</a>
        </nav>
      </header>

      <div className={`lbc-sticky${sticky ? ' on' : ''}`} aria-hidden={!sticky}>
        <div className="lbc-wrap lbc-sticky-row">
          <span className="lbc-sticky-thumb"><VehicleImage photo={photo} alt="" view="side" body={d.bodyColor} sky={sky} /></span>
          <span className="lbc-sticky-text"><strong>{title}</strong><span>{euro(d.price)}</span></span>
          <button type="button" className="lbc-btn lbc-btn-orange" tabIndex={sticky ? 0 : -1}><Icon name="shield" />{t('lbc.reserve')}</button>
          <button type="button" className="lbc-heart" aria-label={t('lbc.favorites')} tabIndex={sticky ? 0 : -1}><Icon name="heart" /></button>
        </div>
      </div>

      <main className="lbc-wrap">
        <nav className="lbc-crumb" aria-label="Breadcrumb">
          <a href="#" onClick={(e) => e.preventDefault()}>{t('lbc.home')}</a><Icon name="next" />
          <a href="#" onClick={(e) => e.preventDefault()}>{t(moto ? 'cl.category.moto' : 'cl.category')}</a><Icon name="next" />
          <a href="#" onClick={(e) => e.preventDefault()}>{d.city}</a><Icon name="next" />
          <span>{title}</span>
        </nav>
        {l.status === 'sold' && <p className="cl-sold" role="status">{t('cl.soldBanner')}</p>}

        <div className="lbc-grid">
          <div className="lbc-main">
            <section className={`lbc-gallery${photo ? ' lbc-gallery-one' : ''}`} aria-label={title}>
              {photo ? (
                <div className="lbc-tile lbc-tile-big"><VehicleImage photo={photo} alt={title} body={d.bodyColor} sky={sky} /></div>
              ) : (
                (['front', 'rear', 'cabin'] as const).map((v, i) => (
                  <div key={v} className={`lbc-tile${i === 0 ? ' lbc-tile-big' : ''}`}><CarArt view={v} body={d.bodyColor} sky={sky} /></div>
                ))
              )}
              <button type="button" className="lbc-pill lbc-similar"><Icon name="similar" />{t('lbc.similar')}</button>
              <div className="lbc-gallery-actions">
                <button type="button" className="lbc-round" aria-label={t('as.share')}><Icon name="share" /></button>
                <button type="button" className="lbc-round lbc-likes" aria-label={t('lbc.favorites')}>{likes}<Icon name="heart" /></button>
              </div>
              <button type="button" className="lbc-pill lbc-see">{t('lbc.seePhotos')}</button>
            </section>
            {photo && <PhotoCredit photo={photo} className="lbc-credit" />}

            <section className="lbc-head">
              <h1>{title}</h1>
              <p className="lbc-line">{d.city} · {l.year} · {km} · {t(d.fuel)}</p>
              <p className="lbc-price">{euro(d.price)}<Icon name="trend" /></p>
              <a className="lbc-under" href="#lbc-financing"><Icon name="calc" />{t('lbc.simulate')}</a>
              <p className="lbc-date">{posted}</p>
              <p className="lbc-secure-tag"><Icon name="shield" />{t('lbc.secureFee', { fee: euro(19.99, 2) })}</p>
            </section>

            <section className="lbc-section">
              <h2>{t('lbc.secureTitle')}</h2>
              <p>{t('lbc.secureBody')}</p>
              <ul className="lbc-bullets">
                <li><Icon name="lock" /><span><strong>{t('lbc.secureReserve')}</strong> {t('lbc.secureReserveBody')}</span></li>
                <li><Icon name="shield" /><span><strong>{t('lbc.securePay')}</strong> {t('lbc.securePayBody')}</span></li>
              </ul>
              <a className="lbc-under lbc-strong" href="#" onClick={(e) => e.preventDefault()}>{t('lbc.learnMore')}</a>
            </section>

            <section className="lbc-section">
              <h2>{t('lbc.important')}</h2>
              <dl className="lbc-info">
                {info.map(([icon, k, v]) => (
                  <div key={k}><dt><span className="lbc-info-icon"><Icon name={icon} /></span>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            </section>

            <section className="lbc-section">
              <h2>{t('as.history')}</h2>
              <ul className="lbc-cards">
                {history.map(([icon, k, v]) => (
                  <li key={k}><Icon name={icon} /><span><strong>{k}</strong>{v}</span></li>
                ))}
              </ul>
            </section>

            <section className="lbc-section">
              <h2>{t('cl.description')}</h2>
              <p className={`lbc-desc${fullText ? '' : ' clamp'}`}>{text}</p>
              {text.length > 160 && (
                <button type="button" className="lbc-under lbc-strong lbc-link-btn" onClick={() => setFullText((v) => !v)} aria-expanded={fullText}>
                  {t(fullText ? 'as.showLess' : 'lbc.seeMore')}
                </button>
              )}
            </section>

            <section className="lbc-section" id="lbc-financing">
              <h2>{t('as.financing')}</h2>
              <p className="lbc-small">{t('lbc.loanWarning')}</p>
              <label className="lbc-field">
                <span>{t('lbc.amount')}</span>
                <span className="lbc-input"><input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} />€</span>
              </label>
              <label className="lbc-field">
                <span className="lbc-field-row">{t('lbc.duration')}<strong>{t('as.months', { n: months })}</strong></span>
                <input type="range" min={6} max={84} step={6} value={months} onChange={(e) => setMonths(Number(e.target.value))} />
              </label>
              <p className="lbc-rate">{t('as.rate')}: <strong>{t('as.monthly', { amount: euro(rate, 2) })}</strong></p>
              <p className="lbc-small">{t('as.rateNote')}</p>
            </section>
          </div>

          <aside className="lbc-side">
            <div className="lbc-seller">
              <div className="lbc-seller-row">
                <span className="lbc-avatar" aria-hidden="true">{d.seller.charAt(0)}</span>
                <span><strong>{d.seller}</strong><span>{t('lbc.ads', { n: adsCount })}</span></span>
                <Icon name="next" />
              </div>
              <p className="lbc-reactive"><Icon name="chat" />{t('lbc.reactive')}</p>
              <p className="lbc-activity"><Icon name="clock" />{t('lbc.lastActivity')}</p>
              <button type="button" className="lbc-btn lbc-btn-orange"><Icon name="shield" />{t('lbc.reserve')}</button>
              <button type="button" className="lbc-btn lbc-btn-navy">{t('ka.send')}</button>
              <p className="lbc-secure"><Icon name="lock" />{t('lbc.secureTitle')}</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
