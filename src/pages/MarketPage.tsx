import { useMemo, useState } from 'react'
import { VehicleImage } from '../components/VehicleImage'
import { useI18n } from '../i18n'
import { describe, mockDetails, siteTheme, type MockDetails } from '../lib/mockListing'
import { CITIES, distanceKm, findCity } from '../lib/places'
import { photoFor, vehicleKind, type VehicleKind, type VehiclePhoto } from '../lib/photos'
import type { AppState, Listing } from '../lib/verify'
import '../market.css'

interface Vehicle {
  listing: Listing
  details: MockDetails
  kind: VehicleKind
  photo?: VehiclePhoto
}

const RADII = [10, 25, 50, 100, 200]

type Sort = 'new' | 'priceAsc' | 'priceDesc'

/** Um veículo por placa: o mesmo carro anunciado em vários sites aparece uma vez só. */
function vehicles(state: AppState): Vehicle[] {
  const byPlate = new Map<string, Listing[]>()
  for (const l of state.listings) {
    if (l.status !== 'active') continue
    byPlate.set(l.plate, [...(byPlate.get(l.plate) ?? []), l])
  }
  return [...byPlate.values()].map((group) => {
    // O card abre o anúncio publicado no próprio marketplace, quando existe; senão o mais antigo.
    const own = group.find((l) => siteTheme(l.site) === 'verifyit')
    const listing = own ?? group.reduce((a, b) => (a.createdAt <= b.createdAt ? a : b))
    return { listing, details: mockDetails(listing), kind: vehicleKind(listing), photo: photoFor(listing) }
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
  const [radius, setRadius] = useState(50)
  const [sort, setSort] = useState<Sort>('new')

  const all = useMemo(() => vehicles(state), [state])
  const cities = useMemo(() => [...new Set([...Object.keys(CITIES), ...all.map((v) => v.details.city)])].sort((a, b) => a.localeCompare(b, locale)), [all, locale])
  const place = city.trim()
  const unknownPlace = place !== '' && !findCity(place) && !all.some((v) => distanceKm(place, v.details.city) === 0)
  const euro = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
  const number = new Intl.NumberFormat(locale)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = all.filter(({ listing: l, details: d, kind: k }) => {
      if (kind && k !== kind) return false
      if (q && !`${l.make} ${l.model} ${l.year}`.toLowerCase().includes(q)) return false
      if (!place) return true
      const away = distanceKm(place, d.city)
      return away !== undefined && away <= radius
    })
    const order: Record<Sort, (a: Vehicle, b: Vehicle) => number> = {
      new: (a, b) => b.listing.createdAt.localeCompare(a.listing.createdAt),
      priceAsc: (a, b) => a.details.price - b.details.price,
      priceDesc: (a, b) => b.details.price - a.details.price,
    }
    return list.sort(order[sort])
  }, [all, query, kind, place, radius, sort])

  const credits = useMemo(() => [...new Map(all.flatMap((v) => (v.photo ? [[v.photo.file, v.photo] as const] : []))).values()], [all])
  const filtered = query !== '' || kind !== '' || city !== ''
  function reset() {
    setQuery('')
    setKind('')
    setCity('')
    setRadius(50)
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
          <input list="market-cities" value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('mk.locationPh')} autoComplete="address-level2" aria-describedby={unknownPlace ? 'market-place-error' : undefined} aria-invalid={unknownPlace || undefined} />
          <datalist id="market-cities">
            {cities.map((c) => <option key={c} value={c} />)}
          </datalist>
        </label>
        <label className="field">
          {t('mk.radius')}
          <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} disabled={!place}>
            {RADII.map((r) => <option key={r} value={r}>{t('mk.radiusKm', { km: r })}</option>)}
          </select>
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

      {unknownPlace && <p id="market-place-error" className="market-note">{t('mk.unknownPlace', { city: place })}</p>}

      <div className="market-bar">
        <p role="status">{shown.length === 1 ? t('mk.results.one') : t('mk.results', { n: shown.length })}</p>
        {filtered && <button type="button" className="text-button" onClick={reset}>{t('mk.reset')}</button>}
      </div>

      {shown.length === 0 ? (
        <p className="market-empty">{t('mk.empty')}</p>
      ) : (
        <ul className="market-grid">
          {shown.map(({ listing: l, details: d, photo }) => (
            <li key={l.plate} className="car-card">
              <a className="car-photo" href={`#/market/${l.checkId}`} tabIndex={-1} aria-hidden="true">
                <VehicleImage photo={photo} alt={`${l.make} ${l.model}`} body={d.bodyColor} sky={skyOf(l.plate)} />
              </a>
              <div className="car-body">
                <h2><a className="car-link" href={`#/market/${l.checkId}`}>{l.make} {l.model}</a></h2>
                <p className="car-meta">{l.year} · {t('mk.km', { km: number.format(d.km) })} · {d.city}{place && !unknownPlace ? ` (${t('mk.away', { km: Math.round(distanceKm(place, d.city) ?? 0) })})` : ''}</p>
                <p className="car-desc">{describe(d, t)}</p>
                <p className="car-price">{euro.format(d.price)}</p>
                <p className="car-seller">{t('mk.seller', { name: d.seller })}</p>
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
