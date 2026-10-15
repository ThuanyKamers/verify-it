import { describe, expect, it } from 'vitest'
import { parseListingUrl } from './url'

describe('parseListingUrl', () => {
  it('trata variações do mesmo link como iguais', () => {
    const a = parseListingUrl('https://www.olx.com.br/autos/civic-123/?utm_source=whatsapp')
    const b = parseListingUrl('olx.com.br/autos/civic-123')
    const c = parseListingUrl('https://m.olx.com.br/autos/civic-123')
    expect(a).toEqual(b)
    expect(c).toEqual(b)
    expect(b?.site).toBe('olx.com.br')
  })
  it('mantém parâmetros que identificam o anúncio', () => {
    expect(parseListingUrl('https://site.com/anuncio?id=42&fbclid=x')?.key).toBe('site.com/anuncio?id=42')
  })
  it('recusa textos que não são links', () => {
    expect(parseListingUrl('')).toBeNull()
    expect(parseListingUrl('não é um link')).toBeNull()
  })
  it('keeps the route of single-page sites such as the Verify It marketplace', () => {
    const a = parseListingUrl('https://thuanykamers.github.io/verify-it/#/market/VI-M2B7QX')
    const b = parseListingUrl('https://thuanykamers.github.io/verify-it/#/market/VI-M5T3KD')
    expect(a?.key).toBe('thuanykamers.github.io/verify-it#/market/VI-M2B7QX')
    expect(a?.key).not.toBe(b?.key)
  })
})
