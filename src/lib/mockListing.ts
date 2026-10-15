// Conteúdo da página-cópia do marketplace. Os dados do veículo vêm do cadastro
// do Verify It; o que o cadastro não tem (preço, quilometragem, cores,
// descrição) é inventado aqui, por modelo, e é todo fictício.

import type { MessageKey } from '../i18n'
import type { Listing } from './verify'

export interface MockDetails {
  price: number
  km: number
  city: string
  transmission: MessageKey
  fuel: MessageKey
  exterior: MessageKey
  interior: MessageKey
  bodyColor: string
  description: MessageKey
  /** Descrição escrita pelo vendedor; tem prioridade sobre `description`. */
  descriptionText?: string
  features: MessageKey[]
  seller: string
  memberSince: number
  owners: number
}

const COMMON: MessageKey[] = ['mp.feat.ac', 'mp.feat.power', 'mp.feat.abs', 'mp.feat.airbag', 'mp.feat.multimedia']

const BY_PLATE: Record<string, MockDetails> = {
  'B KM 4821': {
    price: 21900, km: 62400, city: 'Berlin', transmission: 'mp.trans.auto', fuel: 'mp.fuel.flex',
    exterior: 'color.red', interior: 'color.black', bodyColor: '#c8242b', description: 'mp.desc.civic',
    features: [...COMMON, 'mp.feat.camera', 'mp.feat.leather'], seller: 'Marcos A.', memberSince: 2016, owners: 1,
  },
  'M TC 2021': {
    price: 26500, km: 38100, city: 'München', transmission: 'mp.trans.auto', fuel: 'mp.fuel.hybrid',
    exterior: 'color.silver', interior: 'color.beige', bodyColor: '#b7bcc4', description: 'mp.desc.corolla',
    features: [...COMMON, 'mp.feat.camera', 'mp.feat.sunroof'], seller: 'Helena R.', memberSince: 2013, owners: 2,
  },
  'HH GR 515': {
    price: 9490, km: 112800, city: 'Hamburg', transmission: 'mp.trans.manual', fuel: 'mp.fuel.flex',
    exterior: 'color.red', interior: 'color.gray', bodyColor: '#b4262c', description: 'mp.desc.gol',
    features: ['mp.feat.ac', 'mp.feat.power', 'mp.feat.abs'], seller: 'Paulo S.', memberSince: 2018, owners: 3,
  },
}

const FALLBACK: MockDetails = {
  price: 15900, km: 71000, city: 'Berlin', transmission: 'mp.trans.auto', fuel: 'mp.fuel.flex',
  exterior: 'color.gray', interior: 'color.black', bodyColor: '#6f7680', description: 'mp.desc.generic',
  features: COMMON, seller: 'Carlos M.', memberSince: 2017, owners: 1,
}

export function mockDetails(l: Listing): MockDetails {
  const base = BY_PLATE[l.plate] ?? FALLBACK
  const ad = Object.fromEntries(Object.entries(l.ad ?? {}).filter(([, v]) => v !== undefined))
  return { ...base, ...ad }
}

export function describe(d: MockDetails, t: (key: MessageKey) => string): string {
  return d.descriptionText ?? t(d.description)
}

export type SiteTheme = 'verifyit' | 'facebook' | 'kleinanzeigen' | 'mobilede' | 'autoscout24' | 'standvirtual' | 'leboncoin' | 'olx' | 'webmotors' | 'mercadolivre' | 'generic'

/** Domínio do marketplace do próprio Verify It (GitHub Pages). */
export const MARKET_SITE = 'thuanykamers.github.io'

/** Link público de um anúncio no marketplace do Verify It. */
export function marketUrl(checkId: string): string {
  return `https://${MARKET_SITE}/verify-it/#/market/${checkId}`
}

export const SITE_NAMES: Record<SiteTheme, string> = {
  verifyit: 'Verify It Marketplace',
  facebook: 'Marketplace',
  kleinanzeigen: 'Kleinanzeigen',
  mobilede: 'mobile.de',
  autoscout24: 'AutoScout24',
  standvirtual: 'STANDVIRTUAL',
  leboncoin: 'leboncoin',
  olx: 'OLX',
  webmotors: 'webmotors',
  mercadolivre: 'mercado livre',
  generic: 'Classifieds',
}

export function siteTheme(site: string): SiteTheme {
  if (site === MARKET_SITE) return 'verifyit'
  if (site.includes('facebook')) return 'facebook'
  if (site.includes('kleinanzeigen')) return 'kleinanzeigen'
  if (site.includes('mobile.de')) return 'mobilede'
  if (site.includes('autoscout24')) return 'autoscout24'
  if (site.includes('standvirtual')) return 'standvirtual'
  if (site.includes('leboncoin')) return 'leboncoin'
  if (site.includes('olx')) return 'olx'
  if (site.includes('webmotors')) return 'webmotors'
  if (site.includes('mercadolivre')) return 'mercadolivre'
  return 'generic'
}

/** Domínio como aparece nos resultados; o marketplace do Verify It aparece pelo nome. */
export function displaySite(site: string): string {
  return siteTheme(site) === 'verifyit' ? SITE_NAMES.verifyit : site
}

/** Nome do site como o comprador conhece (ex.: "Mercado Livre" para carro.mercadolivre.com.br). */
export function siteLabel(site: string): string {
  const theme = siteTheme(site)
  if (theme === 'facebook') return 'Facebook Marketplace'
  if (theme === 'mercadolivre') return 'Mercado Livre'
  if (theme === 'webmotors') return 'Webmotors'
  if (theme === 'standvirtual') return 'Standvirtual'
  return theme === 'generic' ? site : SITE_NAMES[theme]
}

/**
 * Endereço do anúncio dentro do protótipo: os do marketplace do Verify It abrem a página do próprio marketplace;
 * os dos outros sites abrem a cópia daquele site.
 */
export function listingHref(l: Pick<Listing, 'checkId' | 'site'>): string {
  const route = siteTheme(l.site) === 'verifyit' ? 'market' : 'listing'
  return `${import.meta.env.BASE_URL}#/${route}/${l.checkId}`
}
