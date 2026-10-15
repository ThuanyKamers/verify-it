import { CarGallery } from '../components/CarGallery'
import { useI18n, type MessageKey } from '../i18n'
import { mockDetails } from '../lib/mockListing'
import { maskPlate } from '../lib/validation'
import type { AppState } from '../lib/verify'
import '../marketplace.css'

export function listedWhen(iso: string, locale: string, now: string): string {
  const minutes = Math.round((new Date(iso).getTime() - new Date(now).getTime()) / 60000)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (Math.abs(minutes) < 2) return ''
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')
  if (Math.abs(minutes) < 1440) return rtf.format(Math.round(minutes / 60), 'hour')
  return rtf.format(Math.round(minutes / 1440), 'day')
}

/** Cópia fictícia de um anúncio de marketplace, montada com os dados cadastrados no Verify It. */
export function MarketplacePage({ state, checkId }: { state: AppState; checkId: string }) {
  const { t, locale } = useI18n()
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
  const price = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(d.price)
  const km = new Intl.NumberFormat(locale).format(d.km)
  const when = listedWhen(l.createdAt, locale, new Date().toISOString()) || t('mp.now')
  const sky = l.plate.charCodeAt(0) % 4
  const val = (key: MessageKey) => t(key)

  return (
    <div className="mp">
      <div className="mp-demo">
        <span>{t('mp.demo')}</span>
        <a href="#">{t('mp.back')}</a>
      </div>
      <header className="mp-top">
        <span className="mp-logo" aria-hidden="true" />
        <strong>{t('mp.brand')}</strong>
        <span className="mp-crumb">{car}</span>
      </header>

      <div className="mp-layout">
        <CarGallery label={car} body={d.bodyColor} sky={sky} />

        <aside className="mp-info">
          <h1>{car}</h1>
          <p className="mp-price">{price}</p>
          <p className="mp-meta">{t('mp.listed', { when, city: d.city })}</p>

          <div className="mp-actions">
            <button type="button" className="mp-btn mp-btn-primary">{t('mp.message')}</button>
            <button type="button" className="mp-btn">{t('mp.save')}</button>
            <button type="button" className="mp-btn">{t('mp.share')}</button>
          </div>

          <h2>{t('mp.about')}</h2>
          <ul className="mp-facts">
            <li>{t('mp.driven', { km })}</li>
            <li>{t('mp.transmission', { value: val(d.transmission) })}</li>
            <li>{t('mp.exteriorColor', { value: val(d.exterior) })}</li>
            <li>{t('mp.interiorColor', { value: val(d.interior) })}</li>
            <li>{t('mp.fuelType', { value: val(d.fuel) })}</li>
            <li>{t('mp.plateLine', { plate: maskPlate(l.plate) })}</li>
          </ul>

          <h3>{t('mp.commonFeatures')}</h3>
          <ul className="mp-features">
            {d.features.map((f) => <li key={f}>{val(f)}</li>)}
          </ul>

          <h2>{t('mp.sellerDescription')}</h2>
          <p className="mp-desc">{val(d.description)}</p>

          <div className="mp-map" aria-hidden="true">
            <svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice">
              <rect width="400" height="150" fill="#e8ecdf" />
              <path d="M0 110 Q120 70 220 100 T400 60 V150 H0Z" fill="#bcd7e6" />
              <g stroke="#fff" strokeWidth="7" fill="none"><path d="M-10 40 L160 70 L420 20" /><path d="M120 -10 L170 160" /><path d="M260 -10 L300 160" /></g>
              <g stroke="#d6dac9" strokeWidth="2" fill="none"><path d="M0 90 H400 M60 0 V150 M340 0 V150" /></g>
              <path d="M200 38a14 14 0 0 1 14 14c0 11-14 28-14 28s-14-17-14-28a14 14 0 0 1 14-14z" fill="#d93a2f" />
              <circle cx="200" cy="52" r="5" fill="#fff" />
            </svg>
          </div>
          <p className="mp-meta">{d.city} · {t('mp.mapNote')}</p>

          <h2>{t('mp.sellerInfo')}</h2>
          <div className="mp-seller">
            <span className="mp-avatar" aria-hidden="true">{d.seller.charAt(0)}</span>
            <div>
              <strong>{d.seller}</strong>
              <span>{t('mp.memberSince', { year: d.memberSince })}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
