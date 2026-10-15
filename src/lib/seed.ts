// Dados de demonstração carregados no primeiro acesso.
// Todos os anúncios, placas e documentos são fictícios.

import { renavamCheckDigit } from './validation'
import type { AppState, Listing, ListingAd } from './verify'

function renavam(base: string): string {
  return base + renavamCheckDigit(base)
}

const civic = { plate: 'B KM 4821', vin: 'JHMFC2650KS100001', renavam: renavam('0123456789'), make: 'Honda', model: 'Civic EXL', year: 2019 }
const corolla = { plate: 'M TC 2021', vin: 'SB1ZS3HE0M0123456', renavam: renavam('1122334455'), make: 'Toyota', model: 'Corolla XEi', year: 2021 }
const golf = { plate: 'HH GR 515', vin: 'WVWZZZAUZFP012345', renavam: renavam('0987654321'), make: 'Volkswagen', model: 'Golf 1.6 TDI', year: 2015 }

const mini = { plate: 'DD MC 2020', vin: 'WMWXR32030TC12345', renavam: renavam('2233445566'), make: 'Mini', model: 'Cooper S', year: 2020 }
const golf8 = { plate: 'K LN 2020', vin: 'WVWZZZCDZLW123456', renavam: renavam('3344556677'), make: 'Volkswagen', model: 'Golf 8 2.0 TDI', year: 2020 }
const bmw = { plate: 'F BM 3200', vin: 'WBA8E11030K123456', renavam: renavam('4455667788'), make: 'BMW', model: '320d Touring', year: 2018 }
const tesla = { plate: 'S TE 3021', vin: '5YJ3E1EA7MF123456', renavam: renavam('5566778899'), make: 'Tesla', model: 'Model 3 Long Range', year: 2021 }
const skoda = { plate: 'L SK 1717', vin: 'TMBJJ7NE9H0123456', renavam: renavam('6677889900'), make: 'Skoda', model: 'Octavia Combi 1.5 TSI', year: 2017 }

/** Dados de anúncio (preço, km, cidade, vendedor) dos veículos extras do marketplace do Verify It. */
const ads: Record<string, ListingAd> = {
  mini: { price: 19750, km: 31200, city: 'Dresden', seller: 'Matteo R.', memberSince: 2019, owners: 1, bodyColor: '#b9c0c7', exterior: 'color.silver', interior: 'color.black', transmission: 'mp.trans.auto', fuel: 'mp.fuel.petrol', descriptionText: 'Mini Cooper S, first registered 2020. One owner, garage kept, full service history at Mini. Panoramic roof, sport seats and Harman Kardon sound. Two sets of wheels included.' },
  golf8: { price: 18900, km: 54300, city: 'Köln', seller: 'Autohaus Rhein', memberSince: 2012, owners: 1, bodyColor: '#2f4b7c', exterior: 'color.blue', interior: 'color.black', transmission: 'mp.trans.auto', fuel: 'mp.fuel.diesel', descriptionText: 'Golf 8 2.0 TDI DSG from our own fleet. New TÜV, service book complete, adaptive cruise control and LED headlights. Financing and delivery available.' },
  bmw: { price: 22400, km: 91000, city: 'Frankfurt', seller: 'Jonas W.', memberSince: 2018, owners: 2, bodyColor: '#23262b', exterior: 'color.black', interior: 'color.beige', transmission: 'mp.trans.auto', fuel: 'mp.fuel.diesel', descriptionText: '320d Touring, automatic, leather interior, navigation and heated seats. Mostly motorway miles, no accidents. Timing chain and brakes recently serviced.' },
  tesla: { price: 27800, km: 47500, city: 'Stuttgart', seller: 'Elena K.', memberSince: 2020, owners: 1, bodyColor: '#e9ebee', exterior: 'color.white', interior: 'color.black', transmission: 'mp.trans.auto', fuel: 'mp.fuel.electric', descriptionText: 'Model 3 Long Range, dual motor. Battery health 93 percent, Autopilot, heat pump and fresh software. Type 2 charging cable and home wallbox adapter included.' },
  skoda: { price: 11950, km: 128000, city: 'Leipzig', seller: 'Familie Brandt', memberSince: 2015, owners: 2, bodyColor: '#b7bcc4', exterior: 'color.silver', interior: 'color.gray', transmission: 'mp.trans.manual', fuel: 'mp.fuel.petrol', descriptionText: 'Octavia Combi 1.5 TSI, a spacious family estate. Tow bar, parking sensors, winter tyres on rims. Regular services, non-smoking household.' },
}

function listing(checkId: string, url: string, key: string, site: string, vehicle: typeof civic, createdAt: string, status: Listing['status'] = 'active', ad?: ListingAd): Listing {
  return { checkId, url, key, site, ...vehicle, proofFileName: 'crlv-e.pdf', createdAt, status, ...(ad ? { ad } : {}) }
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
      listing('VI-D2M7UC', 'https://www.kleinanzeigen.de/s-anzeige/mini-cooper-s-2020/2851122334-216-3912', 'kleinanzeigen.de/s-anzeige/mini-cooper-s-2020/2851122334-216-3912', 'kleinanzeigen.de', mini, '2026-10-08T16:30:00.000Z', 'active', ads.mini),
      listing('VI-G8K3LN', 'https://www.mobile.de/auto-inserat/vw-golf-8-2-0-tdi/361122334.html', 'mobile.de/auto-inserat/vw-golf-8-2-0-tdi/361122334.html', 'mobile.de', golf8, '2026-10-09T08:10:00.000Z', 'active', ads.golf8),
      listing('VI-F3B9WZ', 'https://www.autoscout24.de/angebote/bmw-320d-touring-diesel-schwarz-61122334', 'autoscout24.de/angebote/bmw-320d-touring-diesel-schwarz-61122334', 'autoscout24.de', bmw, '2026-10-09T19:45:00.000Z', 'active', ads.bmw),
      listing('VI-S6T4EM', 'https://www.kleinanzeigen.de/s-anzeige/tesla-model-3-long-range/2852233445-216-8401', 'kleinanzeigen.de/s-anzeige/tesla-model-3-long-range/2852233445-216-8401', 'kleinanzeigen.de', tesla, '2026-10-11T12:00:00.000Z', 'active', ads.tesla),
      listing('VI-L1S5KD', 'https://www.mobile.de/auto-inserat/skoda-octavia-combi-1-5-tsi/371122334.html', 'mobile.de/auto-inserat/skoda-octavia-combi-1-5-tsi/371122334.html', 'mobile.de', skoda, '2026-10-12T09:20:00.000Z', 'active', ads.skoda),
    ],
    reports: [
      { key: 'olx.pt/d/anuncio/honda-civic-2019-impecavel-IDHx9pQz.html', site: 'olx.pt', url: DEMO_URLS.cloned, createdAt: '2026-10-10T20:15:00.000Z' },
      { key: 'olx.pt/d/anuncio/honda-civic-2019-impecavel-IDHx9pQz.html', site: 'olx.pt', url: DEMO_URLS.cloned, createdAt: '2026-10-12T08:30:00.000Z' },
    ],
    log: [],
  }
}
