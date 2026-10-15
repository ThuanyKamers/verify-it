// Armazenamento do protótipo: os dados ficam no navegador (localStorage).
// Para vendedores e compradores em aparelhos diferentes, troque esta
// implementação por um banco online (ex.: Supabase) mantendo a mesma interface.

import { useCallback, useState } from 'react'
import { seedState } from './seed'
import type { AppState } from './verify'

const STORAGE_KEY = 'verify-it:v6'

export interface StateStore {
  load(): AppState
  save(state: AppState): void
  reset(): AppState
}

export const localStore: StateStore = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as AppState
    } catch {
      // Armazenamento indisponível ou corrompido: volta para os dados de demonstração.
    }
    return seedState()
  },
  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Sem armazenamento (ex.: janela privada): o app segue funcionando em memória.
    }
  },
  reset() {
    const state = seedState()
    this.save(state)
    return state
  },
}

export function useAppState(store: StateStore = localStore) {
  const [state, setState] = useState<AppState>(() => store.load())

  const update = useCallback(
    (change: (current: AppState) => AppState) => {
      setState((current) => {
        const next = change(current)
        store.save(next)
        return next
      })
    },
    [store],
  )

  const reset = useCallback(() => setState(store.reset()), [store])

  return { state, update, reset }
}
