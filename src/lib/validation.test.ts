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
    expect(isValidPlate('ABC1D23', 'DE')).toBe(false)
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

describe('placas de outros países', () => {
  it('aceita o formato de cada país e escreve no formato oficial', () => {
    expect(normalizePlate('aa 12 bc', 'PT')).toBe('AA-12-BC')
    expect(normalizePlate('12-AB-34', 'PT')).toBe('12-AB-34')
    expect(normalizePlate('ab123cd', 'FR')).toBe('AB-123-CD')
    expect(normalizePlate('abc1d23', 'BR')).toBe('ABC1D23')
    expect(normalizePlate('ABC-1234', 'BR')).toBe('ABC1234')
  })

  it('recusa o formato de outro país', () => {
    expect(isValidPlate('B AB 1234', 'BR')).toBe(false)
    expect(isValidPlate('AB-123-CD', 'PT')).toBe(false)
    expect(isValidPlate('A1-23-BC', 'PT')).toBe(false)
  })

  it('sem país, reconhece qualquer formato', () => {
    expect(normalizePlate('ABC1D23')).toBe('ABC1D23')
    expect(normalizePlate('b ab 1234')).toBe('B AB 1234')
  })

  it('esconde o fim da placa', () => {
    expect(maskPlate('AB-123-CD')).toBe('AB-123-**')
    expect(maskPlate('ABC1D23')).toBe('ABC1D**')
  })
})
