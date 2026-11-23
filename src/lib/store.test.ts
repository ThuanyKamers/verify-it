import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { seedState } from './seed'
import { localStore } from './store'
import type { AppState } from './verify'

/** localStorage em memória, só para os testes (o Vitest roda em Node). */
function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  }
}

/** localStorage que falha em tudo, como numa janela privada sem armazenamento. */
function brokenStorage(): Storage {
  const fail = () => {
    throw new Error('storage unavailable')
  }
  return { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail }
}

const empty: AppState = { listings: [], reports: [], log: [] }

describe('localStore', () => {
  let storage: Storage

  beforeEach(() => {
    storage = memoryStorage()
    vi.stubGlobal('localStorage', storage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts with the sample data when nothing is saved', () => {
    expect(localStore.load()).toEqual(seedState())
  })

  it('loads back what was saved', () => {
    const state: AppState = { ...empty, listings: seedState().listings.slice(0, 1) }
    localStore.save(state)
    expect(localStore.load()).toEqual(state)
  })

  it('falls back to the sample data when the saved value is corrupted', () => {
    localStore.save(empty)
    const key = storage.key(0)!
    storage.setItem(key, '{not json')
    expect(localStore.load()).toEqual(seedState())
  })

  it('reset replaces the saved state with the sample data', () => {
    localStore.save(empty)
    const state = localStore.reset()
    expect(state).toEqual(seedState())
    expect(localStore.load()).toEqual(seedState())
  })

  it('keeps working when storage is unavailable', () => {
    vi.stubGlobal('localStorage', brokenStorage())
    expect(() => localStore.save(empty)).not.toThrow()
    expect(localStore.load()).toEqual(seedState())
    expect(localStore.reset()).toEqual(seedState())
  })
})
