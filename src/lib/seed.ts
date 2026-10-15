// Dados de demonstração carregados no primeiro acesso.
// Todos os anúncios, placas e documentos são fictícios.

import { renavamCheckDigit } from './validation'
import type { AppState, Listing } from './verify'

function renavam(base: string): string {
  return base + renavamCheckDigit(base)
}

const civic = { plate: 'B KM 4821', vin: 'JHMFC2650KS100001', renavam: renavam('0123456789'), make: 'Honda', model: 'Civic EXL', year: 2019 }
const corolla = { plate: 'M TC 2021', vin: 'SB1ZS3HE0M0123456', renavam: renavam('1122334455'), make: 'Toyota', model: 'Corolla XEi', year: 2021 }
const golf = { plate: 'HH GR 515', vin: 'WVWZZZAUZFP012345', renavam: renavam('0987654321'), make: 'Volkswagen', model: 'Golf 1.6 TDI', year: 2015 }

function listing(checkId: string, url: string, key: string, site: string, vehicle: typeof civic, createdAt: string, status: Listing['status'] = 'active'): Listing {
  return { checkId, url, key, site, ...vehicle, proofFileName: 'crlv-e.pdf', createdAt, status }
}

export const DEMO_URLS = {
  verified: 'https://www.olx.pt/d/anuncio/honda-civic-exl-2019-IDHk3sRt.html',
  cloned: 'https://www.olx.pt/d/anuncio/honda-civic-2019-impecavel-IDHx9pQz.html',
  clonedPlate: 'B KM 4821',
  unknown: 'https://www.autoscout24.de/angebote/fiat-500-1-0-hybrid-benzin-weiss-55512345',
}

export function seedState(): AppState {
  return {
    listings: [
      listing('VI-7K3P9Q', DEMO_URLS.verified, 'olx.pt/d/anuncio/honda-civic-exl-2019-IDHk3sRt.html', 'olx.pt', civic, '2026-10-01T14:20:00.000Z'),
      listing('VI-H4M2XA', 'https://www.facebook.com/marketplace/item/1029384756', 'facebook.com/marketplace/item/1029384756', 'facebook.com', civic, '2026-10-02T09:05:00.000Z'),
      listing('VI-R8TW3E', 'https://www.mobile.de/auto-inserat/toyota-corolla-2-0-hybrid/348812345.html', 'mobile.de/auto-inserat/toyota-corolla-2-0-hybrid/348812345.html', 'mobile.de', corolla, '2026-10-05T18:40:00.000Z'),
      listing('VI-B5QD8F', 'https://www.standvirtual.com/carros/anuncio/toyota-corolla-2-0-hybrid-ID8xYz12.html', 'standvirtual.com/carros/anuncio/toyota-corolla-2-0-hybrid-ID8xYz12.html', 'standvirtual.com', corolla, '2026-10-06T10:15:00.000Z'),
      listing('VI-N6CZ5B', 'https://www.leboncoin.fr/ad/voitures/2734567890', 'leboncoin.fr/ad/voitures/2734567890', 'leboncoin.fr', golf, '2026-09-20T11:00:00.000Z', 'sold'),
    ],
    reports: [
      { key: 'olx.pt/d/anuncio/honda-civic-2019-impecavel-IDHx9pQz.html', site: 'olx.pt', url: DEMO_URLS.cloned, createdAt: '2026-10-10T20:15:00.000Z' },
      { key: 'olx.pt/d/anuncio/honda-civic-2019-impecavel-IDHx9pQz.html', site: 'olx.pt', url: DEMO_URLS.cloned, createdAt: '2026-10-12T08:30:00.000Z' },
    ],
    log: [],
  }
}
