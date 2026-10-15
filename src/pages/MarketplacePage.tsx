import { useState } from 'react'
import { CarArt, type CarView } from '../components/CarArt'
import { useI18n } from '../i18n'
import { describe, mockDetails } from '../lib/mockListing'
import { maskPlate } from '../lib/validation'
import type { AppState } from '../lib/verify'
import '../marketplace.css'

const VIEWS: CarView[] = ['side', 'front', 'rear', 'cabin']

export function listedWhen(iso: string, locale: string, now: string): string {
  const minutes = Math.round((new Date(iso).getTime() - new Date(now).getTime()) / 60000)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (Math.abs(minutes) < 2) return ''
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')
  if (Math.abs(minutes) < 1440) return rtf.format(Math.round(minutes / 60), 'hour')
  return rtf.format(Math.round(minutes / 1440), 'day')
}

/** Ícones simples desenhados à mão, no tamanho e peso dos ícones do marketplace. */
const ICONS = {
  message: 'M12 3C7 3 3 6.7 3 11.3c0 2.6 1.3 4.9 3.3 6.4V21l3-1.7c.9.3 1.8.4 2.7.4 5 0 9-3.7 9-8.4S17 3 12 3zm1 10.7-2.3-2.4-4.4 2.4 4.9-5.2 2.3 2.4 4.4-2.4-4.9 5.2z',
  save: 'M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z',
  share: 'M13 4l8 7-8 7v-4c-5 0-8 1.5-10 5 .5-5.5 3.5-10 10-11V4z',
  more: 'M5 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z',
  speed: 'M12 4a9 9 0 0 0-9 9c0 2 .6 3.8 1.7 5.3h14.6A9 9 0 0 0 12 4zm4.2 4.4-3 5.6a1.6 1.6 0 1 1-2.4-1.6l5.4-4z',
  gear: 'M4 7h3V5h2v2h6V5h2v2h3v4h-1v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6H4V7zm5 6v2h6v-2H9z',
  paint: 'M18 3l3 3-9 9-3-3 9-9zM8 13l3 3c0 2.8-2.2 5-5 5H3c1.1-.9 1.5-2 1.5-3.2C4.5 15.6 6.1 13.4 8 13z',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z',
  fuel: 'M5 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v7h1a2 2 0 0 1 2 2v4a1 1 0 0 0 2 0V9l-2-2 1.4-1.4L21 8.2V17a3 3 0 0 1-6 0v-4h-1v8H5V4zm2 1v5h5V5H7z',
  plate: 'M3 7h18a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zm2 3v4h2v-4H5zm4 0v4h2v-4H9zm4 0v4h2v-4h-2zm4 0v4h2v-4h-2z',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 17.9V14h2.5l.4-3H13V9.2c0-.9.3-1.4 1.5-1.4H16V5.2c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9V11H7.5v3H10v5.9a8 8 0 1 1 3 0z',
  close: 'M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6 10.6 12 5 6.4z',
  prev: 'M15.4 5 9.4 12l6 7-1.5 1.3L6.8 12l7.1-8.3z',
  next: 'M8.6 5l6 7-6 7 1.5 1.3 7.1-8.3-7.1-8.3z',
}

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg className="fb-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

/** Cópia fictícia de um anúncio do Facebook Marketplace, montada com os dados cadastrados no Verify It. */
export function MarketplacePage({ state, checkId }: { state: AppState; checkId: string }) {
  const { t, locale } = useI18n()
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const l = state.listings.find((x) => x.checkId === checkId)

  if (!l) {
    return (
      <div className="mp">
        <div className="mp-empty">
          <p>{t('mp.notFound')}</p>
          <a href="#">{t('mp.back')}</a>
        </div>
      </div>
    )
  }

  const d = mockDetails(l)
  const car = `${l.year} ${l.make} ${l.model}`
  const price = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(d.price)
  const km = new Intl.NumberFormat(locale).format(d.km)
  const when = listedWhen(l.createdAt, locale, new Date().toISOString()) || t('mp.now')
  const sky = l.plate.charCodeAt(0) % 4
  const go = (step: number) => setIndex((i) => (i + step + VIEWS.length) % VIEWS.length)
  const photo = (n: number) => t('mp.photo', { n, total: VIEWS.length })

  const about: [keyof typeof ICONS, string][] = [
    ['speed', t('mp.driven', { km })],
    ['gear', t(d.transmission === 'mp.trans.auto' ? 'mp.transLine.auto' : 'mp.transLine.manual')],
    ['paint', t('mp.colors', { ext: t(d.exterior), int: t(d.interior) })],
    ['person', d.owners === 1 ? t('mp.owner1') : t('mp.ownersN', { n: d.owners })],
    ['fuel', t(d.fuel)],
    ['plate', t('mp.plateLine', { plate: maskPlate(l.plate) })],
  ]

  return (
    <div className="mp fb">
      <section className="fb-viewer" aria-label={car}>
        <div className="fb-backdrop" aria-hidden="true">
          <CarArt view={VIEWS[index]} body={d.bodyColor} sky={sky} />
        </div>
        <div className="fb-photo">
          <CarArt view={VIEWS[index]} body={d.bodyColor} sky={sky} />
        </div>
        <a className="fb-round fb-close" href="#" aria-label={t('mp.close')} title={t('mp.close')}><Icon name="close" /></a>
        <button type="button" className="fb-round fb-arrow fb-prev" onClick={() => go(-1)} aria-label={t('mp.prev')}><Icon name="prev" /></button>
        <button type="button" className="fb-round fb-arrow fb-next" onClick={() => go(1)} aria-label={t('mp.next')}><Icon name="next" /></button>
        <div className="fb-thumbs">
          {VIEWS.map((v, i) => (
            <button key={v} type="button" className={i === index ? 'on' : ''} onClick={() => setIndex(i)} aria-label={photo(i + 1)} aria-current={i === index}>
              <CarArt view={v} body={d.bodyColor} sky={sky} />
            </button>
          ))}
        </div>
      </section>

      <aside className="fb-panel">
        <div className="fb-scroll">
          <h1>{car}</h1>
          <p className="fb-price">{price}</p>
          <p className="fb-meta">{t('mp.listed', { when, city: d.city })}</p>

          <div className="fb-actions">
            <button type="button" className="fb-btn fb-btn-wide"><Icon name="message" />{t('mp.message')}</button>
            <button type="button" className="fb-btn"><Icon name="save" />{t('mp.save')}</button>
            <button type="button" className="fb-btn"><Icon name="share" />{t('mp.share')}</button>
            <button type="button" className="fb-btn fb-btn-icon" aria-label={t('mp.more')}><Icon name="more" /></button>
          </div>

          <h2>{t('mp.about')}</h2>
          <ul className="fb-about">
            {about.map(([icon, text]) => (
              <li key={icon}><Icon name={icon} /><span>{text}</span></li>
            ))}
          </ul>

          <h2>{t('mp.sellerDescription')}</h2>
          <p className={expanded ? 'fb-desc' : 'fb-desc fb-clamp'}>{describe(d, t)}</p>
          {!expanded && <button type="button" className="fb-more" onClick={() => setExpanded(true)}>{t('mp.seeMore')}</button>}

          <div className="fb-map" aria-hidden="true">
            <svg viewBox="0 0 640 75" preserveAspectRatio="xMidYMid slice">
              <rect width="640" height="75" fill="#d9eccf" />
              <path d="M0 0h230c-20 20-10 40 10 75H0z" fill="#8cc4e8" />
              <path d="M410 0h60l-30 75h-50z" fill="#efe6d4" />
              <g stroke="#fff" strokeWidth="5" fill="none"><path d="M200 75 330 0" /><path d="M450 0 520 75" /><path d="M240 40H640" /></g>
              <circle cx="345" cy="38" r="34" fill="#1877f2" fillOpacity="0.12" stroke="#5a7d9a" strokeWidth="1.5" />
              <text x="290" y="64" textAnchor="middle" fontSize="14" fontWeight="600" fill="#4b4f56">{d.city.split(',')[0]}</text>
            </svg>
          </div>
          <p className="fb-meta"><strong>{d.city}</strong> · {t('mp.mapNote')}</p>

          <div className="fb-seller-head">
            <h2>{t('mp.sellerInfo')}</h2>
            <a href="#" onClick={(e) => e.preventDefault()}>{t('mp.sellerDetails')}</a>
          </div>
          <div className="fb-seller">
            <span className="fb-avatar" aria-hidden="true"><Icon name="person" /></span>
            <strong>{d.seller}</strong>
          </div>
          <p className="fb-joined"><Icon name="globe" />{t('mp.joined', { year: d.memberSince })}</p>

          <p className="fb-demo">{t('mp.demo')} <a href="#">{t('mp.back')}</a></p>
        </div>
        <div className="fb-footer">
          <button type="button" className="fb-send">{t('mp.message')}</button>
        </div>
      </aside>
    </div>
  )
}
