import { describe, expect, it } from 'vitest'
import { MARKET_SITE, marketUrl } from './market'
import { DEMO_DOCUMENTS, DEMO_URLS, seedState } from './seed'
import { renavamCheckDigit } from './validation'
import { addReport, check, markSold, register, type AppState, type RegisterInput } from './verify'

const civic: RegisterInput = {
  url: 'https://www.webmotors.com.br/comprar/honda/civic/123',
  plate: 'B KM 4821',
  vin: 'JHMFC2650KS100001',
  renavam: '0123456789' + renavamCheckDigit('0123456789'),
  make: 'Honda',
  model: 'Civic EXL',
  year: '2019',
  documents: DEMO_DOCUMENTS,
}

const empty: AppState = { listings: [], reports: [], log: [] }
const fixedId = () => 'VI-TEST01'

function registered(state: AppState, input: RegisterInput): AppState {
  const res = register(state, input, new Date('2026-10-15T00:00:00Z'), fixedId)
  if (!res.ok) throw new Error(res.errors.join(','))
  return { ...state, listings: [...state.listings, res.listing] }
}

describe('cadastro do vendedor', () => {
  it('aceita dados válidos e gera um código', () => {
    const res = register(empty, civic, new Date(), fixedId)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.listing.checkId).toBe('VI-TEST01')
      expect(res.listing.site).toBe('webmotors.com.br')
    }
  })

  it('guarda preço, km, cidade e descrição quando informados', () => {
    const res = register(empty, { ...civic, price: '21.900', km: '62400', city: ' Berlin ', description: 'Single owner' }, new Date(), fixedId)
    expect(res.ok && res.listing.ad).toEqual({ price: 21900, km: 62400, city: 'Berlin', descriptionText: 'Single owner' })
    const bare = register(empty, civic, new Date(), fixedId)
    expect(bare.ok && bare.listing.ad).toBeUndefined()
  })

  it('lista todos os erros de formato de uma vez', () => {
    const res = register(empty, { ...civic, plate: 'X', vin: 'Y', renavam: '1', documents: {} })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.errors).toEqual(['invalidPlate', 'invalidVin', 'invalidRenavam', 'missingDocuments'])
  })

  it('exige os documentos do veículo (a identidade do vendedor fica na conta)', () => {
    const res = register(empty, { ...civic, documents: { registration: 'reg.pdf' } })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.missing).toEqual(['title'])
    const ok = register(empty, civic, new Date(), fixedId)
    expect(ok.ok && ok.listing.documents).toEqual(DEMO_DOCUMENTS)
  })

  it('publica no marketplace do Verify It sem link externo', () => {
    const res = register(empty, { ...civic, market: true, url: '' }, new Date('2026-10-15T00:00:00Z'), fixedId)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.listing.site).toBe(MARKET_SITE)
      expect(res.listing.url).toBe(marketUrl('VI-TEST01'))
      expect(res.listing.checkId).toBe('VI-TEST01')
    }
  })

  it('bloqueia o mesmo veículo publicado duas vezes no marketplace', () => {
    const state = registered(empty, { ...civic, market: true, url: '' })
    const res = register(state, { ...civic, market: true, url: '' })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.errors).toEqual(['duplicateOnSite'])
  })

  it('guarda o nome do vendedor no anúncio', () => {
    const res = register(empty, { ...civic, market: true, url: '', seller: 'Marcos A.' }, new Date(), fixedId)
    expect(res.ok && res.listing.ad?.seller).toBe('Marcos A.')
  })

  it('permite o mesmo veículo em sites diferentes', () => {
    const state = registered(empty, civic)
    const res = register(state, { ...civic, url: 'https://www.olx.com.br/autos/civic-999' })
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.otherSites.map((l) => l.site)).toEqual(['webmotors.com.br'])
  })

  it('bloqueia o mesmo veículo em outro link do mesmo site', () => {
    const state = registered(empty, civic)
    const res = register(state, { ...civic, url: 'https://webmotors.com.br/comprar/honda/civic/456' })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.errors).toEqual(['duplicateOnSite'])
  })

  it('libera novo anúncio no mesmo site depois que o anterior é marcado como vendido', () => {
    const state = markSold(registered(empty, civic), 'VI-TEST01')
    expect(register(state, { ...civic, url: 'https://webmotors.com.br/comprar/honda/civic/456' }).ok).toBe(true)
  })

  it('recusa link já cadastrado', () => {
    const state = registered(empty, civic)
    const res = register(state, { ...civic, url: civic.url + '?utm_source=x' })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.errors).toEqual(['urlAlreadyRegistered'])
  })

  it('recusa documentos que não batem com o veículo já verificado', () => {
    const state = registered(empty, civic)
    const res = register(state, { ...civic, url: 'https://olx.com.br/x', vin: 'SB1ZS3HE0M0123456' })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.errors).toEqual(['dataMismatch'])
  })
})

describe('consulta do comprador', () => {
  const seed = seedState()

  it('confirma o link cadastrado pelo dono', () => {
    const res = check(seed, { url: DEMO_URLS.verified })
    expect(res.status).toBe('verified')
    expect(res.related.map((l) => l.site)).toEqual(['facebook.com', 'carro.mercadolivre.com.br'])
  })

  it('aponta golpe quando a placa está verificada em outro link do mesmo site', () => {
    const res = check({ ...seed, reports: [] }, { url: DEMO_URLS.cloned, plate: DEMO_URLS.clonedPlate })
    expect(res.status).toBe('scam')
    expect(res.reasons).toEqual(['plateOnOtherUrl'])
    expect(res.related.length).toBe(3)
  })

  it('aponta golpe em link denunciado', () => {
    const res = check(seed, { url: DEMO_URLS.cloned })
    expect(res.status).toBe('scam')
    expect(res.reasons).toEqual(['reported'])
    expect(res.reportCount).toBe(2)
  })

  it('aponta golpe quando o veículo já foi vendido', () => {
    const res = check(seed, { url: 'https://www.leboncoin.fr/ad/voitures/2734567890' })
    expect(res.status).toBe('scam')
    expect(res.reasons).toEqual(['sold'])
  })

  it('indica os links oficiais quando o veículo só está verificado em outro site', () => {
    const res = check(seed, { url: 'https://www.webmotors.com.br/comprar/honda/civic/999', plate: 'B KM 4821' })
    expect(res.status).toBe('unverified')
    expect(res.reasons).toEqual(['knownOnOtherSites'])
  })

  it('diz que não encontrou quando não há registro', () => {
    const res = check(seed, { url: DEMO_URLS.unknown })
    expect(res.status).toBe('unverified')
    expect(res.reasons).toEqual(['notFound'])
  })

  it('recusa link inválido', () => {
    expect(check(seed, { url: 'abc' }).status).toBe('invalid')
  })

  it('conta denúncias novas', () => {
    const next = addReport(seed, DEMO_URLS.unknown)!
    expect(check(next, { url: DEMO_URLS.unknown }).status).toBe('scam')
  })
})
