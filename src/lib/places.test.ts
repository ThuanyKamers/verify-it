import { describe, expect, it } from 'vitest'
import { distanceKm, findCity } from './places'

describe('location radius', () => {
  it('finds cities ignoring case and accents', () => {
    expect(findCity('munchen')).toBe('München')
    expect(findCity(' KÖLN ')).toBe('Köln')
    expect(findCity('Palhoça')).toBeUndefined()
  })

  it('measures distances between known cities', () => {
    expect(distanceKm('Berlin', 'Potsdam')).toBeGreaterThan(20)
    expect(distanceKm('Berlin', 'Potsdam')).toBeLessThan(35)
    expect(distanceKm('Köln', 'Düsseldorf')).toBeLessThan(50)
    expect(distanceKm('Berlin', 'München')).toBeGreaterThan(450)
  })

  it('only matches unknown cities by exact name', () => {
    expect(distanceKm('Palhoça', 'palhoca')).toBe(0)
    expect(distanceKm('Palhoça', 'Berlin')).toBeUndefined()
  })
})
