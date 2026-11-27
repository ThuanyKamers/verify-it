import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadRole, saveRole } from './session'

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

describe('session role', () => {
  let storage: Storage

  beforeEach(() => {
    storage = memoryStorage()
    vi.stubGlobal('localStorage', storage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('has no role before login', () => {
    expect(loadRole()).toBeNull()
  })

  it('remembers the chosen role', () => {
    saveRole('seller')
    expect(loadRole()).toBe('seller')
    saveRole('buyer')
    expect(loadRole()).toBe('buyer')
  })

  it('forgets the role on logout', () => {
    saveRole('buyer')
    saveRole(null)
    expect(loadRole()).toBeNull()
    expect(storage.length).toBe(0)
  })

  it('ignores an unknown saved value', () => {
    storage.setItem('verify-it:role', 'admin')
    expect(loadRole()).toBeNull()
  })

  it('works without storage (private window)', () => {
    const fail = () => {
      throw new Error('storage unavailable')
    }
    vi.stubGlobal('localStorage', { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail })
    expect(() => saveRole('seller')).not.toThrow()
    expect(() => saveRole(null)).not.toThrow()
    expect(loadRole()).toBeNull()
  })
})
