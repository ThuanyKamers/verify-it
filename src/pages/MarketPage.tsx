import { useMemo, useState } from 'react'
import { VehicleImage } from '../components/VehicleImage'
import { useI18n } from '../i18n'
import { describe, listingHref, mockDetails, type MockDetails } from '../lib/mockListing'
import { photoFor, vehicleKind, type VehicleKind, type VehiclePhoto } from '../lib/photos'
import type { AppState, Listing } from '../lib/verify'
import '../market.css'

interface Vehicle {
  listing: Listing
  details: MockDetails
  sites: string[]
  kind: VehicleKind
  photo?: VehiclePhoto
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
    return { listing, details: mockDetails(listing), sites: [...new Set(group.map((l) => l.site))], kind: vehicleKind(listing), photo: photoFor(listing) }
  })
}

function skyOf(plate: string): number {
  return [...plate].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 4
}

export function MarketPage({ state }: { state: AppState }) {
  const { t, locale } = useI18n()
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<VehicleKind | ''>('')
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
    const list = all.filter(({ listing: l, details: d, kind: k }) => {
      if (kind && k !== kind) return false
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
  }, [all, query, kind, city, kmMin, kmMax, sort])

  const credits = useMemo(() => [...new Map(all.flatMap((v) => (v.photo ? [[v.photo.file, v.photo] as const] : []))).values()], [all])
  const filtered = query !== '' || kind !== '' || city !== '' || kmMin !== '' || kmMax !== ''
  function reset() {
    setQuery('')
    setKind('')
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
          {t('mk.type')}
          <select value={kind} onChange={(e) => setKind(e.target.value as VehicleKind | '')}>
            <option value="">{t('mk.type.all')}</option>
            <option value="car">{t('mk.type.car')}</option>
            <option value="motorcycle">{t('mk.type.motorcycle')}</option>
          </select>
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
          {shown.map(({ listing: l, details: d, sites, photo }) => (
            <li key={l.plate} className="car-card">
              <a className="car-photo" href={listingHref(l)} target="_blank" rel="noopener noreferrer" aria-label={`${t('mk.view')}: ${l.make} ${l.model}`}>
                <VehicleImage photo={photo} alt={`${l.make} ${l.model}`} body={d.bodyColor} sky={skyOf(l.plate)} />
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

      {credits.length > 0 && (
        <footer className="market-credits">
          <h2>{t('mk.credits')}</h2>
          <ul>
            {credits.map((p) => (
              <li key={p.file}>
                {p.subject}: <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">{p.author}</a>
                {', '}
                <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer license">{p.license}</a>
              </li>
            ))}
          </ul>
          <p>{t('mk.creditsNote')}</p>
        </footer>
      )}
    </section>
  )
}
