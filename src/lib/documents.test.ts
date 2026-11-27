import { describe, expect, it } from 'vitest'
import { SELLER_DOCUMENTS, VEHICLE_DOCUMENTS, missingDocuments, pickDocuments } from './documents'

describe('missingDocuments', () => {
  it('lists every required document when nothing was sent', () => {
    expect(missingDocuments({})).toEqual(['idFront', 'idBack', 'selfie', 'registration', 'title'])
  })

  it('never asks for the optional inspection report', () => {
    expect(missingDocuments({}, VEHICLE_DOCUMENTS)).not.toContain('inspection')
  })

  it('treats blank file names as missing', () => {
    expect(missingDocuments({ idFront: 'front.jpg', idBack: '   ', selfie: '' }, SELLER_DOCUMENTS)).toEqual(['idBack', 'selfie'])
  })

  it('is empty when the requested group is complete', () => {
    expect(missingDocuments({ registration: 'reg.pdf', title: 'title.pdf' }, VEHICLE_DOCUMENTS)).toEqual([])
  })
})

describe('pickDocuments', () => {
  it('keeps only the requested kinds that have a file', () => {
    const files = { idFront: 'front.jpg', idBack: ' ', registration: 'reg.pdf', inspection: 'tuv.pdf' }
    expect(pickDocuments(files, VEHICLE_DOCUMENTS)).toEqual({ registration: 'reg.pdf', inspection: 'tuv.pdf' })
    expect(pickDocuments(files, SELLER_DOCUMENTS)).toEqual({ idFront: 'front.jpg' })
  })
})
