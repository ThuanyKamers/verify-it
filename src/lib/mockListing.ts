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
  features: MessageKey[]
  seller: string
  memberSince: number
}

const COMMON: MessageKey[] = ['mp.feat.ac', 'mp.feat.power', 'mp.feat.abs', 'mp.feat.airbag', 'mp.feat.multimedia']

const BY_PLATE: Record<string, MockDetails> = {
  RIO2A18: {
    price: 119900, km: 62400, city: 'Florianópolis, SC', transmission: 'mp.trans.auto', fuel: 'mp.fuel.flex',
    exterior: 'color.white', interior: 'color.black', bodyColor: '#e9ebee', description: 'mp.desc.civic',
    features: [...COMMON, 'mp.feat.camera', 'mp.feat.leather'], seller: 'Marcos A.', memberSince: 2016,
  },
  BRA2E19: {
    price: 142500, km: 38100, city: 'Curitiba, PR', transmission: 'mp.trans.auto', fuel: 'mp.fuel.flex',
    exterior: 'color.silver', interior: 'color.beige', bodyColor: '#b7bcc4', description: 'mp.desc.corolla',
    features: [...COMMON, 'mp.feat.camera', 'mp.feat.sunroof'], seller: 'Helena R.', memberSince: 2013,
  },
  ABC1234: {
    price: 34900, km: 112800, city: 'Porto Alegre, RS', transmission: 'mp.trans.manual', fuel: 'mp.fuel.flex',
    exterior: 'color.red', interior: 'color.gray', bodyColor: '#b4262c', description: 'mp.desc.gol',
    features: ['mp.feat.ac', 'mp.feat.power', 'mp.feat.abs'], seller: 'Paulo S.', memberSince: 2018,
  },
}

const FALLBACK: MockDetails = {
  price: 89900, km: 71000, city: 'São Paulo, SP', transmission: 'mp.trans.auto', fuel: 'mp.fuel.flex',
  exterior: 'color.gray', interior: 'color.black', bodyColor: '#6f7680', description: 'mp.desc.generic',
  features: COMMON, seller: 'Carlos M.', memberSince: 2017,
}

export function mockDetails(l: Listing): MockDetails {
  return BY_PLATE[l.plate] ?? FALLBACK
}

export type SiteTheme = 'facebook' | 'olx' | 'webmotors' | 'mercadolivre' | 'generic'

export const SITE_NAMES: Record<SiteTheme, string> = {
  facebook: 'Marketplace',
  olx: 'OLX',
  webmotors: 'webmotors',
  mercadolivre: 'mercado livre',
  generic: 'Classifieds',
}

export function siteTheme(site: string): SiteTheme {
  if (site.includes('facebook')) return 'facebook'
  if (site.includes('olx')) return 'olx'
  if (site.includes('webmotors')) return 'webmotors'
  if (site.includes('mercadolivre')) return 'mercadolivre'
  return 'generic'
}

/** Endereço da página-cópia do anúncio: todo site tem uma cópia própria dentro do protótipo. */
export function listingHref(l: Pick<Listing, 'checkId'>): string {
  return `${import.meta.env.BASE_URL}#/listing/${l.checkId}`
}
