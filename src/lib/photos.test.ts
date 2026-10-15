import { describe, expect, it } from 'vitest'
import { photoFor, vehicleKind } from './photos'
import { seedState } from './seed'

describe('vehicle photos', () => {
  it('matches each active sample vehicle to a photo', () => {
    for (const l of seedState().listings.filter((x) => x.status === 'active')) {
      expect(photoFor(l), `${l.make} ${l.model}`).toBeDefined()
    }
  })

  it('keeps the drawing for vehicles without a photo', () => {
    expect(photoFor({ make: 'Volkswagen', model: 'Golf 1.6 TDI' })).toBeUndefined()
    expect(photoFor({ make: 'Fiat', model: '500' })).toBeUndefined()
  })

  it('tells cars and motorcycles apart', () => {
    expect(vehicleKind({ make: 'BMW', model: 'R 1250 GS' })).toBe('motorcycle')
    expect(vehicleKind({ make: 'BMW', model: '320d Touring' })).toBe('car')
    expect(vehicleKind({ make: 'Ducati', model: 'Monster' })).toBe('motorcycle')
    expect(vehicleKind({ make: 'Honda', model: 'Civic EXL' })).toBe('car')
  })
})
