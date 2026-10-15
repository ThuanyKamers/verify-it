// Cidades conhecidas pelo filtro de localização do marketplace, com coordenadas
// aproximadas do centro. No protótipo não há serviço de mapas: uma cidade fora
// desta lista só aparece quando a busca é exatamente por ela.

export const CITIES: Record<string, [lat: number, lon: number]> = {
  Berlin: [52.52, 13.405], Potsdam: [52.391, 13.065],
  Hamburg: [53.551, 9.994], Bremen: [53.079, 8.802], Bremerhaven: [53.54, 8.581],
  Hannover: [52.375, 9.732], Braunschweig: [52.269, 10.521], Wolfsburg: [52.423, 10.787],
  München: [48.137, 11.575], Augsburg: [48.371, 10.898], Ingolstadt: [48.766, 11.426],
  Nürnberg: [49.452, 11.077], Fürth: [49.477, 10.989], Erlangen: [49.598, 11.004],
  Stuttgart: [48.776, 9.183], Ludwigsburg: [48.894, 9.192], Esslingen: [48.74, 9.31],
  Karlsruhe: [49.007, 8.404], Heidelberg: [49.399, 8.672], Mannheim: [49.487, 8.466],
  Frankfurt: [50.11, 8.682], Offenbach: [50.096, 8.766], Darmstadt: [49.873, 8.651],
  Wiesbaden: [50.078, 8.24], Mainz: [49.993, 8.247],
  Köln: [50.938, 6.96], Bonn: [50.737, 7.098], Düsseldorf: [51.227, 6.774],
  Duisburg: [51.434, 6.762], Essen: [51.456, 7.012], Dortmund: [51.514, 7.468],
  Leipzig: [51.34, 12.375], Halle: [51.482, 11.97], Dresden: [51.05, 13.737],
  Chemnitz: [50.828, 12.921], Erfurt: [50.978, 11.029],
}

const fold = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Nome oficial da cidade digitada (ignora maiúsculas e acentos), se ela for conhecida. */
export function findCity(name: string): string | undefined {
  const wanted = fold(name)
  return Object.keys(CITIES).find((c) => fold(c) === wanted)
}

/** Distância em linha reta, em km, entre duas cidades conhecidas. */
export function distanceKm(from: string, to: string): number | undefined {
  const a = CITIES[findCity(from) ?? '']
  const b = CITIES[findCity(to) ?? '']
  if (!a || !b) return fold(from) === fold(to) ? 0 : undefined
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b[0] - a[0])
  const dLon = rad(b[1] - a[1])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}
