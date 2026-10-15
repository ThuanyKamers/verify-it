import { useEffect, useState } from 'react'
import { CarArt, type CarView } from '../components/CarArt'
import { PhotoCredit, VehicleImage } from '../components/VehicleImage'
import { useI18n, type MessageKey } from '../i18n'
import { describe, mockDetails } from '../lib/mockListing'
import { photoFor, vehicleKind } from '../lib/photos'
import { maskPlate } from '../lib/validation'
import type { Listing } from '../lib/verify'
import '../marketplace.css'
import '../autoscout24.css'

const VIEWS: CarView[] = ['side', 'front', 'rear', 'cabin']
/** Juros fictícios do simulador de financiamento (ao ano). */
const RATE = 0.0599
const DURATIONS = [12, 24, 36, 48, 60, 72, 84, 96, 108, 120]

/** Ícones de traço, no estilo dos ícones verde-petróleo do AutoScout24. */
const ICONS = {
  back: 'M15 5 8 12l7 7',
  next: 'M9 5l7 7-7 7',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16zm4 4h4',
  share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  print: 'M7 9V4h10v5M7 17H4v-7h16v7h-3M7 14h10v6H7v-6z',
  pin: 'M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zm0-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  expand: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5',
  road: 'M8 4 5 20M16 4l3 16M12 5v2m0 4v2m0 4v2',
  calendar: 'M5 6h14v14H5V6zm0 4h14M9 4v4m6-4v4',
  fuel: 'M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M3 20h13M5 10h9m0 1h2a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0V8l-3-3',
  gear: 'M6 4v16M12 4v16M18 4v8M6 12h12',
  owner: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8c0-3.3 3.1-5 7-5s7 1.7 7 5',
  person: 'M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-4 9v-4a4 4 0 0 1 8 0v4',
  chart: 'M5 19h14M8 16v-5m4 5V8m4 8v-3',
  euro: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm3-12.5a4 4 0 1 0 0 7M8 11h5M8 13.5h5',
  mail: 'M4 6h16v12H4V6zm0 0 8 7 8-7',
  phone: 'M6 3h3l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z',
  warning: 'M12 4 2 20h20L12 4zm0 6v5m0 2v1',
  swap: 'M4 8h13l-3-3M20 16H7l3 3',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-10v6m0-9v.5',
  car: 'M4 16v-4l2-5h12l2 5v4H4zm0 0v2h3v-2m10 0v2h3v-2M4 12h16',
  history: 'M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4M12 8v4l3 2',
  wrench: 'M14.5 5.5a4 4 0 0 0 4.9 4.9L10 19.8a2 2 0 0 1-2.8-2.8L16.6 7.6M19 5l-2.5 2.5',
  palette: 'M12 21a9 9 0 1 1 0-18v18z',
  seat: 'M8 4v9h8l2 7M8 13l-1 7',
  book: 'M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4V5zm16 0h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6V5z',
  check: 'M5 12.5 10 17l9-10',
  chevron: 'M6 9l6 6 6-6',
}
type IconName = keyof typeof ICONS

function Icon({ name }: { name: IconName }) {
  return (
    <svg className="as-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

/** Número da oferta, tirado do link do AutoScout24 (ex.: ...-schwarz-61122334). */
function offerNumber(l: Listing): string {
  return /-(\d{6,})(?:$|[/?#])/.exec(l.url)?.[1] ?? l.checkId
}

/** Parcela mensal (tabela Price) para o valor financiado em `months` meses. */
function monthlyRate(amount: number, months: number): number {
  if (amount <= 0) return 0
  const r = RATE / 12
  return (amount * r) / (1 - (1 + r) ** -months)
}

/** Seção da parte de baixo: ícone e título à esquerda, conteúdo à direita. */
function Section({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) {
  return (
    <section className="as-section">
      <h2><span className="as-badge"><Icon name={icon} /></span>{title}</h2>
      <div className="as-section-body">{children}</div>
    </section>
  )
}

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="as-table">
      {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  )
}

/** Cópia fictícia de um anúncio do AutoScout24, no layout atual do site. */
export function AutoScout24Page({ listing: l }: { listing: Listing }) {
  const { t, locale } = useI18n()
  const [index, setIndex] = useState(0)
  const [allFeatures, setAllFeatures] = useState(false)
  const [sticky, setSticky] = useState(false)
  const d = mockDetails(l)
  const [down, setDown] = useState(0)
  const [months, setMonths] = useState(84)

  const photo = photoFor(l)
  const moto = vehicleKind(l) === 'motorcycle'
  const total = photo ? 1 : VIEWS.length
  const sky = l.plate.charCodeAt(0) % 4
  const go = (step: number) => setIndex((i) => (i + step + total) % total)

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 640)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const euro = (v: number, digits = 0) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v)
  const km = `${new Intl.NumberFormat(locale).format(d.km)} km`
  const title = `${l.make} ${l.model}`
  const subtitle = [t(d.transmission), ...d.features.slice(0, 4).map((f) => t(f))].join(', ')
  const rate = monthlyRate(Math.max(0, d.price - down), months)
  const fromRate = euro(Math.round(monthlyRate(d.price, 84)))
  const firstReg = `${String(1 + (l.plate.length % 12)).padStart(2, '0')}/${l.year}`

  const facts: [IconName, string, string][] = [
    ['road', t('cl.mileage'), km],
    ['calendar', t('ka.firstReg'), firstReg],
    ['owner', t('mo.owners'), String(d.owners)],
    ['fuel', t('cl.fuel'), t(d.fuel)],
    ['gear', t('cl.transmission'), t(d.transmission)],
    ['person', t('as.seller'), t('mo.private')],
  ]
  const features: MessageKey[] = allFeatures ? d.features : d.features.slice(0, 4)

  return (
    <div className="mp as">
      <div className="mp-demo">
        <span>{t('mp.demo')}</span>
        <a href="#">{t('mp.back')}</a>
      </div>

      <header className="as-top">
        <div className="as-wrap as-top-row">
          <strong className="as-logo"><span>Auto</span>Scout24</strong>
          <nav className="as-nav" aria-label="AutoScout24">
            {(['as.buy', 'as.sell', 'as.inform'] as const).map((k) => (
              <a key={k} href="#" onClick={(e) => e.preventDefault()}>{t(k)}<Icon name="chevron" /></a>
            ))}
          </nav>
          <div className="as-top-actions">
            <button type="button" className="as-top-icon" aria-label={t('as.remember')}><Icon name="star" /></button>
            <span className="as-top-icon" aria-hidden="true"><Icon name="bell" /></span>
            <a href="#" className="as-register" onClick={(e) => e.preventDefault()}>{t('as.register')}</a>
            <button type="button" className="as-sell">{t('as.sell')}</button>
          </div>
        </div>
      </header>

      <div className={`as-sticky${sticky ? ' on' : ''}`} aria-hidden={!sticky}>
        <div className="as-wrap as-sticky-row">
          <span className="as-sticky-thumb"><VehicleImage photo={photo} alt="" view="side" body={d.bodyColor} sky={sky} /></span>
          <span className="as-sticky-text"><strong>{title}</strong><span>{subtitle}</span></span>
          <button type="button" className="as-link-btn" tabIndex={sticky ? 0 : -1}><Icon name="star" />{t('as.remember')}</button>
          <button type="button" className="as-link-btn" tabIndex={sticky ? 0 : -1}><Icon name="share" />{t('as.share')}</button>
          <button type="button" className="as-btn" tabIndex={sticky ? 0 : -1}>{t('as.contact')}</button>
        </div>
      </div>

      <main className="as-wrap">
        <a className="as-back" href="#"><Icon name="back" />{t('as.back')}</a>
        {l.status === 'sold' && <p className="cl-sold" role="status">{t('cl.soldBanner')}</p>}

        <div className="as-sheet">
          <div className="as-hero">
            <div className="as-left">
              <section className="as-gallery" aria-label={title}>
                <VehicleImage photo={photo} alt={title} view={VIEWS[index]} body={d.bodyColor} sky={sky} />
                <span className="as-count">{index + 1} / {total}</span>
                <button type="button" className="as-arrow as-prev" onClick={() => go(-1)} aria-label={t('mp.prev')} disabled={total === 1}><Icon name="back" /></button>
                <button type="button" className="as-arrow as-next" onClick={() => go(1)} aria-label={t('mp.next')} disabled={total === 1}><Icon name="next" /></button>
                <button type="button" className="as-full" aria-label={t('as.fullscreen')}><Icon name="expand" /></button>
              </section>
              {photo ? <PhotoCredit photo={photo} className="as-credit" /> : (
                <div className="as-thumbs">
                  {VIEWS.map((v, i) => (
                    <button key={v} type="button" className={i === index ? 'on' : ''} onClick={() => setIndex(i)} aria-label={t('mp.photo', { n: i + 1, total })} aria-current={i === index}>
                      <CarArt view={v} body={d.bodyColor} sky={sky} />
                    </button>
                  ))}
                </div>
              )}

              <ul className="as-facts">
                {facts.map(([icon, label, value]) => (
                  <li key={label}><span className="as-badge"><Icon name={icon} /></span><span>{label}<strong>{value}</strong></span></li>
                ))}
              </ul>
            </div>

            <aside className="as-right">
              <div className="as-actions">
                <button type="button" className="as-link-btn"><Icon name="star" />{t('as.remember')}</button>
                <button type="button" className="as-link-btn"><Icon name="share" />{t('as.share')}</button>
                <button type="button" className="as-link-btn"><Icon name="print" />{t('as.print')}</button>
              </div>
              <h1>{title}</h1>
              <p className="as-subtitle">{subtitle}</p>
              <div className="as-place">
                <a href="#" onClick={(e) => e.preventDefault()}><Icon name="pin" />{d.city}</a>
                <label><input type="checkbox" />{t('as.compare')}</label>
              </div>

              <div className="as-price-row">
                <p className="as-price">{euro(d.price)}<sup>1</sup></p>
                <p className="as-rating"><span>{t('mo.rating')}</span><Icon name="info" /></p>
              </div>
              <p className="as-small">{t('mo.noVat')}</p>

              <ul className="as-rows">
                <li><span className="as-badge"><Icon name="chart" /></span><span>{t('as.belowMarket')}</span><a href="#" onClick={(e) => e.preventDefault()}>{t('as.priceHistory')}</a></li>
                <li><span className="as-badge"><Icon name="euro" /></span><span>{t('as.fromMonthly', { amount: fromRate })} <a href="#as-financing">{t('as.calc')}</a></span></li>
              </ul>

              <div className="as-cta">
                <button type="button" className="as-btn"><Icon name="mail" />{t('as.email')}</button>
                <button type="button" className="as-btn"><Icon name="phone" />{t('as.number')}</button>
              </div>

              <div className="as-seller">
                <span className="mp-avatar as-avatar" aria-hidden="true">{d.seller.charAt(0)}</span>
                <div>
                  <strong>{d.seller}</strong>
                  <p>{t('mo.private')} · {d.city}</p>
                </div>
              </div>
            </aside>
          </div>

          <p className="as-report"><a href="#" onClick={(e) => e.preventDefault()}><Icon name="warning" />{t('ka.report')}</a></p>

          <Section icon="swap" title={t('as.trade')}>
            <p className="as-strong">{t('as.tradeQ')}</p>
            <p>{t('as.tradeBody')}</p>
            <button type="button" className="as-btn as-btn-outline">{t('as.tradeBtn')}</button>
          </Section>

          <Section icon="euro" title={t('as.financing')}>
            <div className="as-calc" id="as-financing">
              <label className="as-field">
                <span>{t('as.down')}</span>
                <input type="range" min={0} max={d.price} step={500} value={down} onChange={(e) => setDown(Number(e.target.value))} />
                <small><span>{euro(0)}</span><output>{euro(down)}</output><span>{euro(d.price)}</span></small>
              </label>
              <label className="as-field">
                <span>{t('as.duration')}</span>
                <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
                  {DURATIONS.map((n) => <option key={n} value={n}>{t('as.months', { n })}</option>)}
                </select>
              </label>
            </div>
            <div className="as-rate">
              <span>{t('as.rate')}</span>
              <mark>{t('as.monthly', { amount: euro(rate, 2) })}</mark>
              <button type="button" className="as-btn">{t('as.calc')}</button>
            </div>
            <p className="as-small">{t('as.rateNote')}</p>
          </Section>

          <Section icon="car" title={t('as.basic')}>
            <Table rows={[
              [t('mo.category'), t(moto ? 'mo.cat.moto' : 'mo.cat.car')],
              [t('as.vehicleType'), t('as.used')],
              [t('cl.make'), l.make],
              [t('cl.model'), l.model],
              [t('as.offerNo'), offerNumber(l)],
              [t('as.availability'), t('as.now')],
            ]} />
          </Section>

          <Section icon="history" title={t('as.history')}>
            <Table rows={[
              [t('cl.mileage'), km],
              [t('ka.firstReg'), firstReg],
              [t('mo.owners'), String(d.owners)],
              [t('cl.plate'), maskPlate(l.plate)],
            ]} />
          </Section>

          <Section icon="wrench" title={t('mo.techData')}>
            <Table rows={[
              [t('cl.transmission'), t(d.transmission)],
              [t('cl.fuel'), t(d.fuel)],
              [t('mo.condition'), t('mo.conditionValue')],
            ]} />
          </Section>

          <Section icon="seat" title={t('ka.features')}>
            <ul className="as-features">
              {features.map((f) => <li key={f}><Icon name="check" />{t(f)}</li>)}
            </ul>
            {d.features.length > 4 && (
              <button type="button" className="as-more" onClick={() => setAllFeatures((v) => !v)} aria-expanded={allFeatures}>
                {t(allFeatures ? 'as.showLess' : 'mo.showMore')}<Icon name="chevron" />
              </button>
            )}
          </Section>

          <Section icon="palette" title={t('as.colors')}>
            <Table rows={[
              [t('as.exterior'), t(d.exterior)],
              [t('as.interior'), t(d.interior)],
            ]} />
          </Section>

          <Section icon="book" title={t('cl.description')}>
            <p className="as-desc">{describe(d, t)}</p>
          </Section>
        </div>
      </main>
    </div>
  )
}
