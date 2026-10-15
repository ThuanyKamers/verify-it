import { CarGallery } from '../components/CarGallery'
import { useI18n } from '../i18n'
import { mockDetails, SITE_NAMES, siteTheme } from '../lib/mockListing'
import { maskPlate } from '../lib/validation'
import type { Listing } from '../lib/verify'
import { listedWhen } from './MarketplacePage'
import '../marketplace.css'
import '../classified.css'

/** Cópia fictícia de um anúncio de site de classificados (OLX, Standvirtual, Leboncoin, Kleinanzeigen...). */
export function ClassifiedPage({ listing: l }: { listing: Listing }) {
  const { t, locale } = useI18n()
  const theme = siteTheme(l.site)
  const d = mockDetails(l)
  const car = `${l.make} ${l.model}`
  const title = `${car} ${l.year}`
  const price = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(d.price)
  const km = new Intl.NumberFormat(locale).format(d.km)
  const when = listedWhen(l.createdAt, locale, new Date().toISOString()) || t('mp.now')
  const sky = l.plate.charCodeAt(0) % 4

  const specs: [string, string][] = [
    [t('cl.make'), l.make],
    [t('cl.model'), l.model],
    [t('cl.year'), String(l.year)],
    [t('cl.mileage'), `${km} km`],
    [t('cl.transmission'), t(d.transmission)],
    [t('cl.fuel'), t(d.fuel)],
    [t('cl.color'), t(d.exterior)],
    [t('cl.plate'), maskPlate(l.plate)],
  ]

  return (
    <div className="mp cl" data-site={theme}>
      <div className="mp-demo">
        <span>{t('mp.demo')}</span>
        <a href="#">{t('mp.back')}</a>
      </div>
      <header className="cl-top">
        <div className="cl-top-inner">
          <strong className="cl-brand">{theme === 'generic' ? l.site : SITE_NAMES[theme]}</strong>
          <span className="cl-search" aria-hidden="true">{t('cl.search')}</span>
        </div>
      </header>

      <main className="cl-main">
        <p className="cl-crumb">{t('cl.home')} › {t('cl.category')} › {l.make} › {car}</p>
        {l.status === 'sold' && <p className="cl-sold" role="status">{t('cl.soldBanner')}</p>}

        <div className="cl-grid">
          <CarGallery label={title} body={d.bodyColor} sky={sky} />

          <aside className="cl-box">
            <h1>{title}</h1>
            <p className="cl-sub">{km} km · {t(d.transmission)} · {d.city}</p>
            <p className="cl-price">{price}</p>
            <button type="button" className="cl-btn cl-btn-primary">{t('cl.contact')}</button>
            <button type="button" className="cl-btn">{t('cl.phone')}</button>
            <div className="cl-seller">
              <span className="mp-avatar" aria-hidden="true">{d.seller.charAt(0)}</span>
              <div>
                <strong>{d.seller}</strong>
                <span>{t('cl.sellerType')} · {t('mp.memberSince', { year: d.memberSince })}</span>
              </div>
            </div>
            <p className="cl-meta">{t('cl.published', { when })} · {t('cl.code', { code: l.checkId })}</p>
          </aside>
        </div>

        <section className="cl-section">
          <h2>{t('cl.details')}</h2>
          <dl className="cl-specs">
            {specs.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </section>

        <section className="cl-section">
          <h2>{t('cl.description')}</h2>
          <p>{t(d.description)}</p>
          <ul className="mp-features">
            {d.features.map((f) => <li key={f}>{t(f)}</li>)}
          </ul>
        </section>

      </main>
    </div>
  )
}
