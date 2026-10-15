// Fotos reais dos veículos de exemplo, baixadas do Wikimedia Commons e
// guardadas em public/vehicles/ (o site não depende de links externos).
// Todas têm licença livre que exige crédito ao autor; os créditos aparecem
// junto da foto e no rodapé do marketplace. As fotos foram só redimensionadas.

export type VehicleKind = 'car' | 'motorcycle'

export interface VehiclePhoto {
  /** Arquivo dentro de public/vehicles/. */
  file: string
  kind: VehicleKind
  /** O que a foto mostra, para o texto alternativo e os créditos. */
  subject: string
  author: string
  license: string
  licenseUrl: string
  /** Página do arquivo original no Wikimedia Commons. */
  sourceUrl: string
}

const BY_SA_4 = { license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' }
const BY_SA_3 = { license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' }
const BY_2 = { license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/' }
const commons = (name: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(name.replace(/ /g, '_'))}`

/** A primeira regra que casar com "marca modelo" define a foto. */
const CATALOG: [RegExp, VehiclePhoto][] = [
  [/volkswagen golf (8|viii)\b/, { file: 'vw-golf-8.jpg', kind: 'car', subject: 'Volkswagen Golf 8', author: 'Alexander Migl', ...BY_SA_4, sourceUrl: commons('Volkswagen Golf VIII IMG 3472.jpg') }],
  [/honda civic/, { file: 'honda-civic.jpg', kind: 'car', subject: 'Honda Civic', author: 'Alexander Migl', ...BY_SA_4, sourceUrl: commons('Honda Civic (2015) sedan IMG 3748.jpg') }],
  [/toyota corolla/, { file: 'toyota-corolla-touring-sports.jpg', kind: 'car', subject: 'Toyota Corolla Touring Sports', author: 'Alexander Migl', ...BY_SA_4, sourceUrl: commons('Toyota Corolla Touring Sports Hybrid (E210) IMG 2661.jpg') }],
  [/mini cooper/, { file: 'mini-cooper-s.jpg', kind: 'car', subject: 'Mini Cooper S', author: 'Damian B Oh', ...BY_SA_4, sourceUrl: commons('Mini Hatch F56 LCI Cooper S Resolute Edition Enigmatic Black (2).jpg') }],
  [/bmw 3\d\d[di] touring/, { file: 'bmw-320d-touring.jpg', kind: 'car', subject: 'BMW 320d Touring', author: 'nakhon100', ...BY_2, sourceUrl: commons('BMW 320d Touring F31 (13856328124).jpg') }],
  [/tesla model 3/, { file: 'tesla-model-3.jpg', kind: 'car', subject: 'Tesla Model 3', author: 'Alexander Migl', ...BY_SA_4, sourceUrl: commons('Tesla Model 3 IMG 5264.jpg') }],
  [/s[kš]oda octavia/, { file: 'skoda-octavia-combi.jpg', kind: 'car', subject: 'Škoda Octavia Combi', author: 'Miloslav Rejha', ...BY_SA_3, sourceUrl: commons('Škoda Octavia III Combi.JPG') }],
  [/yamaha mt-?07/, { file: 'yamaha-mt-07.jpg', kind: 'motorcycle', subject: 'Yamaha MT-07', author: 'Na-Thur', ...BY_SA_3, sourceUrl: commons('Yamaha MT-07.jpg') }],
  [/bmw r ?1250 ?gs/, { file: 'bmw-r-1250-gs.jpg', kind: 'motorcycle', subject: 'BMW R 1250 GS', author: 'Cjp24', ...BY_SA_4, sourceUrl: commons('BMW R 1250 GS (1).jpg') }],
  [/honda cb ?650 ?r/, { file: 'honda-cb650r.jpg', kind: 'motorcycle', subject: 'Honda CB650R', author: 'Captainmorlypogi1959', ...BY_SA_4, sourceUrl: commons('Honda CB650R Motorcycle 2021.jpg') }],
]

/** Marcas e modelos de moto sem foto própria, para o filtro de tipo do marketplace. */
const MOTORCYCLE = /\b(ducati|ktm|harley|kawasaki|triumph|vespa|aprilia)\b|\byamaha (mt|r\d|xsr|tracer|tenere)|\bhonda (cb|cbr|africa twin|nc\d)|\bbmw (r|s|f|k) ?\d/

export function photoFor(v: { make: string; model: string }): VehiclePhoto | undefined {
  const name = `${v.make} ${v.model}`.toLowerCase()
  return CATALOG.find(([match]) => match.test(name))?.[1]
}

export function vehicleKind(v: { make: string; model: string }): VehicleKind {
  return photoFor(v)?.kind ?? (MOTORCYCLE.test(`${v.make} ${v.model}`.toLowerCase()) ? 'motorcycle' : 'car')
}

export function photoSrc(photo: VehiclePhoto): string {
  return `${import.meta.env.BASE_URL}vehicles/${photo.file}`
}
