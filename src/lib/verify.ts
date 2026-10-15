// Regras de negócio do Verify It, sem dependência de interface ou de
// armazenamento, para poderem ser testadas e reaproveitadas num back-end.
//
// Fluxo (ver docs/fluxo.png):
//   Vendedor: cadastra o link + dados do veículo + comprovante -> verificação -> ID único
//   Comprador: cola o link que está vendo -> verificado / possível golpe / não verificado

import { parseListingUrl } from './url'
import { clean, isValidPlate, isValidRenavam, isValidVin, normalizeRenavam } from './validation'

export interface Listing {
  checkId: string
  url: string
  key: string
  site: string
  plate: string
  vin: string
  renavam: string
  make: string
  model: string
  year: number
  proofFileName: string
  createdAt: string
  status: 'active' | 'sold'
}

export interface Report {
  key: string
  site: string
  url: string
  createdAt: string
}

export type LogType = 'register' | 'rejected' | 'check' | 'report' | 'sold'

export interface LogEntry {
  id: string
  at: string
  type: LogType
  site: string
  /** Código do resultado (status da verificação ou motivo da recusa). */
  result: string
}

export interface AppState {
  listings: Listing[]
  reports: Report[]
  log: LogEntry[]
}

export interface RegisterInput {
  url: string
  plate: string
  vin: string
  renavam: string
  make: string
  model: string
  year: string
  proofFileName: string
}

export type RegisterError =
  | 'invalidUrl'
  | 'invalidPlate'
  | 'invalidVin'
  | 'invalidRenavam'
  | 'missingVehicle'
  | 'invalidYear'
  | 'missingProof'
  | 'urlAlreadyRegistered'
  | 'duplicateOnSite'
  | 'dataMismatch'

export type RegisterResult =
  | { ok: true; listing: Listing; otherSites: Listing[] }
  | { ok: false; errors: RegisterError[]; conflict?: Listing }

export type CheckStatus = 'verified' | 'scam' | 'unverified' | 'invalid'

export type CheckReason =
  /** O link está cadastrado e verificado. */
  | 'registered'
  /** O veículo informado já tem anúncio verificado em outro link do mesmo site. */
  | 'plateOnOtherUrl'
  /** O dono marcou o veículo como vendido. */
  | 'sold'
  /** Outros compradores denunciaram este link. */
  | 'reported'
  /** O veículo tem anúncio verificado, mas em outros sites. */
  | 'knownOnOtherSites'
  /** Nada encontrado. */
  | 'notFound'

export interface CheckResult {
  status: CheckStatus
  reasons: CheckReason[]
  listing?: Listing
  /** Anúncios verificados do mesmo veículo (links oficiais). */
  related: Listing[]
  reportCount: number
}

const ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function newCheckId(random: () => number = Math.random): string {
  let id = ''
  for (let i = 0; i < 6; i++) id += ID_ALPHABET[Math.floor(random() * ID_ALPHABET.length)]
  return `VI-${id}`
}

function sameVehicle(a: Pick<Listing, 'plate' | 'vin' | 'renavam'>, b: Pick<Listing, 'plate' | 'vin' | 'renavam'>) {
  return a.plate === b.plate || a.vin === b.vin || a.renavam === b.renavam
}

export function register(
  state: AppState,
  input: RegisterInput,
  now: Date = new Date(),
  makeId: () => string = newCheckId,
): RegisterResult {
  const errors: RegisterError[] = []
  const parsed = parseListingUrl(input.url)
  if (!parsed) errors.push('invalidUrl')
  if (!isValidPlate(input.plate)) errors.push('invalidPlate')
  if (!isValidVin(input.vin)) errors.push('invalidVin')
  if (!isValidRenavam(input.renavam)) errors.push('invalidRenavam')
  if (!input.make.trim() || !input.model.trim()) errors.push('missingVehicle')
  const year = Number(input.year)
  if (!Number.isInteger(year) || year < 1950 || year > now.getFullYear() + 1) errors.push('invalidYear')
  if (!input.proofFileName.trim()) errors.push('missingProof')
  if (errors.length || !parsed) return { ok: false, errors }

  const vehicle = { plate: clean(input.plate), vin: clean(input.vin), renavam: normalizeRenavam(input.renavam) }
  const active = state.listings.filter((l) => l.status === 'active')

  const sameUrl = active.find((l) => l.key === parsed.key)
  if (sameUrl) return { ok: false, errors: ['urlAlreadyRegistered'], conflict: sameUrl }

  // Mesmo veículo em outro link do MESMO site: é o padrão do golpe de anúncio clonado.
  // Em sites diferentes (OLX, Facebook, Webmotors...) é normal o dono anunciar em vários.
  const duplicate = active.find((l) => l.site === parsed.site && sameVehicle(l, vehicle))
  if (duplicate) return { ok: false, errors: ['duplicateOnSite'], conflict: duplicate }

  // Placa, chassi e RENAVAM precisam bater com o que já foi verificado para esse veículo.
  const mismatch = active.find(
    (l) => sameVehicle(l, vehicle) && (l.plate !== vehicle.plate || l.vin !== vehicle.vin || l.renavam !== vehicle.renavam),
  )
  if (mismatch) return { ok: false, errors: ['dataMismatch'], conflict: mismatch }

  const listing: Listing = {
    checkId: makeId(),
    url: input.url.trim(),
    key: parsed.key,
    site: parsed.site,
    ...vehicle,
    make: input.make.trim(),
    model: input.model.trim(),
    year,
    proofFileName: input.proofFileName.trim(),
    createdAt: now.toISOString(),
    status: 'active',
  }
  const otherSites = active.filter((l) => sameVehicle(l, vehicle))
  return { ok: true, listing, otherSites }
}

export function check(state: AppState, input: { url: string; plate?: string }): CheckResult {
  const parsed = parseListingUrl(input.url)
  if (!parsed) return { status: 'invalid', reasons: [], related: [], reportCount: 0 }

  const reportCount = state.reports.filter((r) => r.key === parsed.key).length
  const active = state.listings.filter((l) => l.status === 'active')
  const listing = state.listings.find((l) => l.key === parsed.key)

  if (listing?.status === 'active') {
    const related = active.filter((l) => l.checkId !== listing.checkId && sameVehicle(l, listing))
    return { status: 'verified', reasons: ['registered'], listing, related, reportCount }
  }

  const reasons: CheckReason[] = []
  let related: Listing[] = []

  if (listing?.status === 'sold') reasons.push('sold')

  const plate = input.plate && isValidPlate(input.plate) ? clean(input.plate) : undefined
  if (plate) {
    related = active.filter((l) => l.plate === plate)
    if (related.some((l) => l.site === parsed.site)) reasons.push('plateOnOtherUrl')
    else if (related.length) reasons.push('knownOnOtherSites')
  }

  if (reportCount > 0) reasons.push('reported')

  const isScam = reasons.some((r) => r === 'sold' || r === 'plateOnOtherUrl' || r === 'reported')
  if (!reasons.length) reasons.push('notFound')
  return { status: isScam ? 'scam' : 'unverified', reasons, listing, related, reportCount }
}

export function addReport(state: AppState, url: string, now: Date = new Date()): AppState | null {
  const parsed = parseListingUrl(url)
  if (!parsed) return null
  const report: Report = { key: parsed.key, site: parsed.site, url: url.trim(), createdAt: now.toISOString() }
  return { ...state, reports: [...state.reports, report] }
}

export function markSold(state: AppState, checkId: string): AppState {
  return {
    ...state,
    listings: state.listings.map((l) => (l.checkId === checkId ? { ...l, status: 'sold' } : l)),
  }
}

export function appendLog(state: AppState, entry: Omit<LogEntry, 'id' | 'at'>, now: Date = new Date()): AppState {
  const log: LogEntry = { id: `${now.getTime()}-${state.log.length}`, at: now.toISOString(), ...entry }
  return { ...state, log: [log, ...state.log].slice(0, 200) }
}
