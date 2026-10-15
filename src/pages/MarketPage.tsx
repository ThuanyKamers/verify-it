import { useMemo, useState } from 'react'
import { CarArt } from '../components/CarArt'
import { useI18n } from '../i18n'
import { describe, listingHref, mockDetails, type MockDetails } from '../lib/mockListing'
import type { AppState, Listing } from '../lib/verify'
import '../market.css'

interface Vehicle {
  listing: Listing
  details: MockDetails
  sites: string[]
}

type Sort = 'new' | 'priceAsc' | 'priceDesc'

/** Um veículo por placa: o mesmo carro anunciado em vários sites aparece uma vez só. */
function vehicles(state: AppState): Vehicle[] {
  const byPlate = new Map<string, Listing[]>()
  for (const l of state.listings) {
    if (l.status !== 'active') continue
    byPlate.set(l.plate, [...(byPlate.get(l.plate) ?? []), l])
  }
  return [...byPlate.values()].map((group) => {
    const listing = group.reduce((a, b) => (a.createdAt <= b.createdAt ? a : b))
    return { listing, details: mockDetails(listing), sites: [...new Set(group.map((l) => l.site))] }
  })
}

function skyOf(plate: string): number {
  return [...plate].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 4
}

export function MarketPage({ state }: { state: AppState }) {
  const { t, locale } = useI18n()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [kmMin, setKmMin] = useState('')
  const [kmMax, setKmMax] = useState('')
  const [sort, setSort] = useState<Sort>('new')

  const all = useMemo(() => vehicles(state), [state])
  const cities = useMemo(() => [...new Set(all.map((v) => v.details.city))].sort((a, b) => a.localeCompare(b, locale)), [all, locale])
  const euro = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
  const number = new Intl.NumberFormat(locale)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const min = Number(kmMin) || 0
    const max = Number(kmMax) || Infinity
    const list = all.filter(({ listing: l, details: d }) => {
      if (q && !`${l.make} ${l.model} ${l.year}`.toLowerCase().includes(q)) return false
      if (city && d.city !== city) return false
      return d.km >= min && d.km <= max
    })
    const order: Record<Sort, (a: Vehicle, b: Vehicle) => number> = {
      new: (a, b) => b.listing.createdAt.localeCompare(a.listing.createdAt),
      priceAsc: (a, b) => a.details.price - b.details.price,
      priceDesc: (a, b) => b.details.price - a.details.price,
    }
    return list.sort(order[sort])
  }, [all, query, city, kmMin, kmMax, sort])

  const filtered = query !== '' || city !== '' || kmMin !== '' || kmMax !== ''
  function reset() {
    setQuery('')
    setCity('')
    setKmMin('')
    setKmMax('')
  }

  return (
    <section className="page market">
      <h1>{t('mk.title')}</h1>
      <p className="lead">{t('mk.lead')}</p>

      <form className="market-filters" onSubmit={(e) => e.preventDefault()} role="search">
        <label className="field market-search">
          {t('mk.search')}
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('mk.searchPh')} />
        </label>
        <label className="field">
          {t('mk.location')}
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">{t('mk.allLocations')}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="field">
          {t('mk.kmMin')}
          <input inputMode="numeric" value={kmMin} onChange={(e) => setKmMin(e.target.value.replace(/\D/g, ''))} placeholder="0" />
        </label>
        <label className="field">
          {t('mk.kmMax')}
          <input inputMode="numeric" value={kmMax} onChange={(e) => setKmMax(e.target.value.replace(/\D/g, ''))} placeholder="150000" />
        </label>
        <label className="field">
          {t('mk.sort')}
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="new">{t('mk.sort.new')}</option>
            <option value="priceAsc">{t('mk.sort.priceAsc')}</option>
            <option value="priceDesc">{t('mk.sort.priceDesc')}</option>
          </select>
        </label>
      </form>

      <div className="market-bar">
        <p role="status">{shown.length === 1 ? t('mk.results.one') : t('mk.results', { n: shown.length })}</p>
        {filtered && <button type="button" className="text-button" onClick={reset}>{t('mk.reset')}</button>}
      </div>

      {shown.length === 0 ? (
        <p className="market-empty">{t('mk.empty')}</p>
      ) : (
        <ul className="market-grid">
          {shown.map(({ listing: l, details: d, sites }) => (
            <li key={l.plate} className="car-card">
              <a className="car-photo" href={listingHref(l)} target="_blank" rel="noopener noreferrer" aria-label={`${t('mk.view')}: ${l.make} ${l.model}`}>
                <CarArt view="side" body={d.bodyColor} sky={skyOf(l.plate)} />
                <span className="car-badge">{t('mk.verified')}</span>
              </a>
              <div className="car-body">
                <h2>{l.make} {l.model}</h2>
                <p className="car-meta">{l.year} · {t('mk.km', { km: number.format(d.km) })} · {d.city}</p>
                <p className="car-desc">{describe(d, t)}</p>
                <p className="car-price">{euro.format(d.price)}</p>
                <p className="car-seller">{t('mk.seller', { name: d.seller })}</p>
                {sites.length > 1 && <p className="car-sites">{t('mk.alsoOn', { sites: sites.join(', ') })}</p>}
                <a className="button button-primary" href={listingHref(l)} target="_blank" rel="noopener noreferrer">{t('mk.view')}</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
