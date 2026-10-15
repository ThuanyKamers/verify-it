// Dados de demonstração carregados no primeiro acesso.
// Todos os anúncios, placas e documentos são fictícios.

import { marketUrl } from './mockListing'
import { parseListingUrl } from './url'
import { renavamCheckDigit } from './validation'
import type { AppState, DocumentFiles, Listing, ListingAd } from './verify'

function renavam(base: string): string {
  return base + renavamCheckDigit(base)
}

const civic = { plate: 'B KM 4821', vin: 'JHMFC2650KS100001', renavam: renavam('0123456789'), make: 'Honda', model: 'Civic EXL', year: 2019 }
const corolla = { plate: 'M TC 2021', vin: 'SB1ZS3HE0M0123456', renavam: renavam('1122334455'), make: 'Toyota', model: 'Corolla Touring Sports 2.0 Hybrid', year: 2021 }
const golf = { plate: 'HH GR 515', vin: 'WVWZZZAUZFP012345', renavam: renavam('0987654321'), make: 'Volkswagen', model: 'Golf 1.6 TDI', year: 2015 }

const mini = { plate: 'DD MC 2020', vin: 'WMWXR32030TC12345', renavam: renavam('2233445566'), make: 'Mini', model: 'Cooper S', year: 2021 }
const golf8 = { plate: 'K LN 2020', vin: 'WVWZZZCDZLW123456', renavam: renavam('3344556677'), make: 'Volkswagen', model: 'Golf 8 2.0 TDI', year: 2020 }
const bmw = { plate: 'F BM 3200', vin: 'WBA8E11030K123456', renavam: renavam('4455667788'), make: 'BMW', model: '320d Touring', year: 2018 }
const tesla = { plate: 'S TE 3021', vin: '5YJ3E1EA7MF123456', renavam: renavam('5566778899'), make: 'Tesla', model: 'Model 3 Long Range', year: 2021 }
const mt07 = { plate: 'N MT 707', vin: 'JYARM0610EA012345', renavam: renavam('7788990011'), make: 'Yamaha', model: 'MT-07', year: 2014 }
const gs = { plate: 'HB GS 1250', vin: 'WB10J1307K6A12345', renavam: renavam('8899001122'), make: 'BMW', model: 'R 1250 GS', year: 2019 }
const cb650 = { plate: 'D CB 650', vin: 'JH2RH0710MK012345', renavam: renavam('9900112233'), make: 'Honda', model: 'CB650R', year: 2021 }
const skoda = { plate: 'L SK 1717', vin: 'TMBJJ7NE9H0123456', renavam: renavam('6677889900'), make: 'Skoda', model: 'Octavia Combi 1.5 TSI', year: 2017 }

/** Dados de anúncio (preço, km, cidade, vendedor) dos veículos extras do marketplace do Verify It. */
const ads: Record<string, ListingAd> = {
  mini: { price: 19750, km: 31200, city: 'Dresden', seller: 'Matteo R.', memberSince: 2019, owners: 1, bodyColor: '#1f2230', exterior: 'color.black', interior: 'color.black', transmission: 'mp.trans.auto', fuel: 'mp.fuel.petrol', descriptionText: 'Mini Cooper S 5-door, first registered 2021. One owner, garage kept, full service history at Mini. Panoramic roof, sport seats and Harman Kardon sound. Two sets of wheels included.' },
  golf8: { price: 18900, km: 54300, city: 'Köln', seller: 'Autohaus Rhein', memberSince: 2012, owners: 1, bodyColor: '#8d9196', exterior: 'color.gray', interior: 'color.black', transmission: 'mp.trans.auto', fuel: 'mp.fuel.diesel', descriptionText: 'Golf 8 2.0 TDI DSG from our own fleet. New TÜV, service book complete, adaptive cruise control and LED headlights. Financing and delivery available.' },
  bmw: { price: 22400, km: 91000, city: 'Frankfurt', seller: 'Jonas W.', memberSince: 2018, owners: 2, bodyColor: '#23262b', exterior: 'color.black', interior: 'color.beige', transmission: 'mp.trans.auto', fuel: 'mp.fuel.diesel', descriptionText: '320d Touring, automatic, leather interior, navigation and heated seats. Mostly motorway miles, no accidents. Timing chain and brakes recently serviced.' },
  tesla: { price: 27800, km: 47500, city: 'Stuttgart', seller: 'Elena K.', memberSince: 2020, owners: 1, bodyColor: '#4a4d52', exterior: 'color.gray', interior: 'color.black', transmission: 'mp.trans.auto', fuel: 'mp.fuel.electric', descriptionText: 'Model 3 Long Range, dual motor. Battery health 93 percent, Autopilot, heat pump and fresh software. Type 2 charging cable and home wallbox adapter included.' },
  skoda: { price: 11950, km: 128000, city: 'Leipzig', seller: 'Familie Brandt', memberSince: 2015, owners: 2, bodyColor: '#b7bcc4', exterior: 'color.silver', interior: 'color.gray', transmission: 'mp.trans.manual', fuel: 'mp.fuel.petrol', descriptionText: 'Octavia Combi 1.5 TSI, a spacious family estate. Tow bar, parking sensors, winter tyres on rims. Regular services, non-smoking household.' },
  mt07: { price: 4990, km: 23800, city: 'Nürnberg', seller: 'Lukas F.', memberSince: 2017, owners: 2, bodyColor: '#1d2433', exterior: 'color.black', interior: 'color.black', transmission: 'mp.trans.manual', fuel: 'mp.fuel.petrol', features: ['mp.feat.abs', 'mp.feat.led'], descriptionText: 'Yamaha MT-07 with ABS, 75 hp twin. New chain and sprockets, tyres at 80 percent. Tail tidy and short levers fitted, original parts included. Ideal first big bike, A2 restrictor kit available.' },
  gs: { price: 15900, km: 34500, city: 'Bremen', seller: 'Motorrad Nord', memberSince: 2011, owners: 1, bodyColor: '#1f5fae', exterior: 'color.blue', interior: 'color.black', transmission: 'mp.trans.manual', fuel: 'mp.fuel.petrol', features: ['mp.feat.abs', 'mp.feat.led', 'mp.feat.heatedGrips', 'mp.feat.topcase', 'mp.feat.quickshifter'], descriptionText: 'BMW R 1250 GS in Rallye style, dealer serviced. Riding modes Pro, heated grips, cruise control and the original top case. New TÜV and 12 months warranty from our workshop.' },
  cb650: { price: 7450, km: 9800, city: 'Düsseldorf', seller: 'Sarah P.', memberSince: 2021, owners: 1, bodyColor: '#1b1c1f', exterior: 'color.black', interior: 'color.black', transmission: 'mp.trans.manual', fuel: 'mp.fuel.petrol', features: ['mp.feat.abs', 'mp.feat.led'], descriptionText: 'Honda CB650R Neo Sports Café, one owner and low mileage. Four-cylinder sound, slipper clutch and LED lights. Always serviced at Honda, winter stored indoors.' },
}

/** Os mesmos arquivos fictícios para todos os anúncios de exemplo. */
export const DEMO_DOCUMENTS: DocumentFiles = {
  idFront: 'id-front.jpg',
  idBack: 'id-back.jpg',
  selfie: 'selfie-with-id.jpg',
  registration: 'registration-part-1.pdf',
  title: 'registration-part-2.pdf',
}

function listing(checkId: string, url: string, key: string, site: string, vehicle: typeof civic, createdAt: string, status: Listing['status'] = 'active', ad?: ListingAd): Listing {
  return { checkId, url, key, site, ...vehicle, documents: DEMO_DOCUMENTS, createdAt, status, ...(ad ? { ad } : {}) }
}

/** Anúncio publicado direto no marketplace do Verify It. */
function marketListing(checkId: string, vehicle: typeof civic, createdAt: string, ad: ListingAd): Listing {
  const url = marketUrl(checkId)
  const parsed = parseListingUrl(url)!
  return listing(checkId, url, parsed.key, parsed.site, vehicle, createdAt, 'active', ad)
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
      listing('VI-Y7M2TQ', 'https://www.kleinanzeigen.de/s-anzeige/yamaha-mt-07-abs/2853344556-305-6104', 'kleinanzeigen.de/s-anzeige/yamaha-mt-07-abs/2853344556-305-6104', 'kleinanzeigen.de', mt07, '2026-10-12T15:40:00.000Z', 'active', ads.mt07),
      listing('VI-W4G8RS', 'https://www.mobile.de/motorrad-inserat/bmw-r-1250-gs/372233445.html', 'mobile.de/motorrad-inserat/bmw-r-1250-gs/372233445.html', 'mobile.de', gs, '2026-10-13T10:05:00.000Z', 'active', ads.gs),
      listing('VI-C5H3RV', 'https://www.leboncoin.fr/ad/motos/2745678901', 'leboncoin.fr/ad/motos/2745678901', 'leboncoin.fr', cb650, '2026-10-13T17:25:00.000Z', 'active', ads.cb650),
      listing('VI-L1S5KD', 'https://www.mobile.de/auto-inserat/skoda-octavia-combi-1-5-tsi/371122334.html', 'mobile.de/auto-inserat/skoda-octavia-combi-1-5-tsi/371122334.html', 'mobile.de', skoda, '2026-10-12T09:20:00.000Z', 'active', ads.skoda),
      // O mesmo veículo em outros sites: o dono pode anunciar em vários, um link por site.
      listing('VI-Q9C4ML', 'https://carro.mercadolivre.com.br/MLB-3456789012-honda-civic-exl-2019-_JM', 'carro.mercadolivre.com.br/MLB-3456789012-honda-civic-exl-2019-_JM', 'carro.mercadolivre.com.br', civic, '2026-10-03T13:30:00.000Z'),
      listing('VI-A7R2CT', 'https://www.autoscout24.de/angebote/toyota-corolla-touring-sports-2-0-hybrid-silber-61234567', 'autoscout24.de/angebote/toyota-corolla-touring-sports-2-0-hybrid-silber-61234567', 'autoscout24.de', corolla, '2026-10-07T09:50:00.000Z'),
      listing('VI-M3F6DW', 'https://www.facebook.com/marketplace/item/1093847562', 'facebook.com/marketplace/item/1093847562', 'facebook.com', mini, '2026-10-09T11:15:00.000Z', 'active', ads.mini),
      listing('VI-K5G9AS', 'https://www.autoscout24.de/angebote/vw-golf-8-2-0-tdi-dsg-grau-61345678', 'autoscout24.de/angebote/vw-golf-8-2-0-tdi-dsg-grau-61345678', 'autoscout24.de', golf8, '2026-10-09T08:40:00.000Z', 'active', ads.golf8),
      listing('VI-K8W1KZ', 'https://www.kleinanzeigen.de/s-anzeige/vw-golf-8-2-0-tdi-dsg/2854455667-216-1404', 'kleinanzeigen.de/s-anzeige/vw-golf-8-2-0-tdi-dsg/2854455667-216-1404', 'kleinanzeigen.de', golf8, '2026-10-10T07:55:00.000Z', 'active', ads.golf8),
      listing('VI-F6M2BD', 'https://www.mobile.de/auto-inserat/bmw-320d-touring/362233445.html', 'mobile.de/auto-inserat/bmw-320d-touring/362233445.html', 'mobile.de', bmw, '2026-10-10T10:20:00.000Z', 'active', ads.bmw),
      listing('VI-T2E8FB', 'https://www.facebook.com/marketplace/item/1102938475', 'facebook.com/marketplace/item/1102938475', 'facebook.com', tesla, '2026-10-11T14:35:00.000Z', 'active', ads.tesla),
      listing('VI-T6E3ML', 'https://carro.mercadolivre.com.br/MLB-3567890123-tesla-model-3-long-range-_JM', 'carro.mercadolivre.com.br/MLB-3567890123-tesla-model-3-long-range-_JM', 'carro.mercadolivre.com.br', tesla, '2026-10-12T09:10:00.000Z', 'active', ads.tesla),
      listing('VI-Y4M9FB', 'https://www.facebook.com/marketplace/item/1110293847', 'facebook.com/marketplace/item/1110293847', 'facebook.com', mt07, '2026-10-12T18:05:00.000Z', 'active', ads.mt07),
      listing('VI-W7G2WM', 'https://www.webmotors.com.br/comprar/bmw/r-1250-gs/52345678', 'webmotors.com.br/comprar/bmw/r-1250-gs/52345678', 'webmotors.com.br', gs, '2026-10-13T12:30:00.000Z', 'active', ads.gs),
      listing('VI-W9G5OX', 'https://www.olx.pt/d/anuncio/bmw-r-1250-gs-rallye-IDHz4kLm.html', 'olx.pt/d/anuncio/bmw-r-1250-gs-rallye-IDHz4kLm.html', 'olx.pt', gs, '2026-10-13T16:45:00.000Z', 'active', ads.gs),
      listing('VI-C8H1ML', 'https://moto.mercadolivre.com.br/MLB-3678901234-honda-cb650r-2021-_JM', 'moto.mercadolivre.com.br/MLB-3678901234-honda-cb650r-2021-_JM', 'moto.mercadolivre.com.br', cb650, '2026-10-14T08:15:00.000Z', 'active', ads.cb650),
      listing('VI-L4S8SV', 'https://www.standvirtual.com/carros/anuncio/skoda-octavia-combi-1-5-tsi-ID8zAb34.html', 'standvirtual.com/carros/anuncio/skoda-octavia-combi-1-5-tsi-ID8zAb34.html', 'standvirtual.com', skoda, '2026-10-12T13:00:00.000Z', 'active', ads.skoda),
      listing('VI-L9S2KA', 'https://www.kleinanzeigen.de/s-anzeige/skoda-octavia-combi-1-5-tsi/2855566778-216-7301', 'kleinanzeigen.de/s-anzeige/skoda-octavia-combi-1-5-tsi/2855566778-216-7301', 'kleinanzeigen.de', skoda, '2026-10-13T08:25:00.000Z', 'active', ads.skoda),
      // Anunciados direto no marketplace do Verify It.
      marketListing('VI-M2B7QX', bmw, '2026-10-11T08:30:00.000Z', ads.bmw),
      marketListing('VI-M5T3KD', tesla, '2026-10-11T19:20:00.000Z', ads.tesla),
      marketListing('VI-M8G4PR', gs, '2026-10-13T09:40:00.000Z', ads.gs),
      marketListing('VI-M3C9HN', cb650, '2026-10-14T10:05:00.000Z', ads.cb650),
      marketListing('VI-M6S1LV', skoda, '2026-10-13T14:50:00.000Z', ads.skoda),
      marketListing('VI-M4K8MC', mini, '2026-10-09T15:10:00.000Z', ads.mini),
    ],
    reports: [
      { key: 'olx.pt/d/anuncio/honda-civic-2019-impecavel-IDHx9pQz.html', site: 'olx.pt', url: DEMO_URLS.cloned, createdAt: '2026-10-10T20:15:00.000Z' },
      { key: 'olx.pt/d/anuncio/honda-civic-2019-impecavel-IDHx9pQz.html', site: 'olx.pt', url: DEMO_URLS.cloned, createdAt: '2026-10-12T08:30:00.000Z' },
    ],
    log: [],
  }
}
