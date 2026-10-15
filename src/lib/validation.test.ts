import { describe, expect, it } from 'vitest'
import { isValidPlate, isValidRenavam, isValidVin, maskPlate, renavamCheckDigit } from './validation'

describe('placa', () => {
  it('aceita formato antigo e Mercosul', () => {
    expect(isValidPlate('ABC1234')).toBe(true)
    expect(isValidPlate('abc-1d23')).toBe(true)
  })
  it('recusa formatos inválidos', () => {
    expect(isValidPlate('AB12345')).toBe(false)
    expect(isValidPlate('ABCD123')).toBe(false)
  })
  it('mascara a placa', () => {
    expect(maskPlate('RIO2A18')).toBe('RIO-2**8')
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
