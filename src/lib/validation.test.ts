import { describe, expect, it } from 'vitest'
import { isValidPlate, isValidRenavam, isValidVin, maskPlate, normalizePlate, renavamCheckDigit } from './validation'

describe('placa', () => {
  it('aceita placas alemãs e padroniza o formato', () => {
    expect(isValidPlate('B AB 1234')).toBe(true)
    expect(normalizePlate('b-ab1234')).toBe('B AB 1234')
    expect(normalizePlate('M TC 2021E')).toBe('M TC 2021E')
    expect(normalizePlate('HH GR 515')).toBe('HH GR 515')
  })
  it('recusa formatos inválidos', () => {
    expect(isValidPlate('ABC1D23')).toBe(false)
    expect(isValidPlate('B AB')).toBe(false)
    expect(isValidPlate('B AB 12345')).toBe(false)
    expect(isValidPlate('B AB 0123')).toBe(false)
  })
  it('mascara a placa', () => {
    expect(maskPlate('B KM 4821')).toBe('B KM 48**')
    expect(maskPlate('HH GR 515')).toBe('HH GR 5**')
    expect(maskPlate('B AB 12')).toBe('B AB **')
  })
})

describe('chassi', () => {
  it('aceita 17 caracteres válidos', () => {
    expect(isValidVin('93HFC2650KZ100001')).toBe(true)
  })
  it('recusa I, O, Q e tamanho errado', () => {
    expect(isValidVin('93HFC2650KZ10000I')).toBe(false)
    expect(isValidVin('93HFC2650KZ1000')).toBe(false)
  })
})

describe('RENAVAM', () => {
  it('confere o dígito verificador', () => {
    const base = '0123456789'
    const valid = base + renavamCheckDigit(base)
    expect(isValidRenavam(valid)).toBe(true)
    const wrong = base + ((renavamCheckDigit(base) + 1) % 10)
    expect(isValidRenavam(wrong)).toBe(false)
  })
  it('recusa dígitos repetidos e tamanho errado', () => {
    expect(isValidRenavam('00000000000')).toBe(false)
    expect(isValidRenavam('1234')).toBe(false)
  })
})
