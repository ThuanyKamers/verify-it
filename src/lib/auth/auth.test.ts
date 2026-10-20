import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAuthProvider, isRealAuthEnabled, mockAuth } from './index'
import type { SignUpInput } from './types'

/** localStorage em memória, já que o ambiente de teste é Node (sem navegador). */
function memoryStorage(): Storage {
  const m = new Map<string, string>()
  return {
    getItem: (k: string) => (m.has(k) ? (m.get(k) as string) : null),
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    key: (i: number) => Array.from(m.keys())[i] ?? null,
    get length() {
      return m.size
    },
  } as Storage
}

const signUp = (over: Partial<SignUpInput> = {}): SignUpInput => ({
  name: 'Fulana',
  email: 'fulana@example.com',
  password: 'senhaforte1',
  role: 'seller',
  ...over,
})

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage())
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('mockAuth: cadastro e login locais', () => {
  it('cadastra, mantém a sessão e nunca guarda senha', async () => {
    const result = await mockAuth.signUp(signUp())
    expect(result.status).toBe('ok')
    const current = await mockAuth.currentAccount()
    expect(current?.email).toBe('fulana@example.com')
    // Nada no armazenamento pode conter a senha.
    const dump = JSON.stringify(localStorage.getItem('verify-it:accounts'))
    expect(dump).not.toContain('senhaforte1')
  })

  it('valida e-mail, senha fraca e e-mail repetido', async () => {
    expect((await mockAuth.signUp(signUp({ email: 'nope' }))).status).toBe('error')
    expect((await mockAuth.signUp(signUp({ password: '123' }))).status).toBe('error')
    await mockAuth.signUp(signUp())
    const dup = await mockAuth.signUp(signUp())
    expect(dup).toEqual({ status: 'error', error: 'emailInUse' })
  })

  it('login com e-mail desconhecido falha', async () => {
    const result = await mockAuth.signIn({ email: 'ninguem@example.com', password: 'x' })
    expect(result).toEqual({ status: 'error', error: 'invalidCredentials' })
  })

  it('signOut encerra a sessão', async () => {
    await mockAuth.signUp(signUp())
    await mockAuth.signOut()
    expect(await mockAuth.currentAccount()).toBeNull()
  })
})

describe('mockAuth: segundo fator (2FA)', () => {
  it('login de conta com 2FA pede o código e só entra depois de confirmar', async () => {
    await mockAuth.signUp(signUp({ enableTwoFactor: true }))
    await mockAuth.signOut()

    const challenge = await mockAuth.signIn({ email: 'fulana@example.com', password: 'senhaforte1' })
    expect(challenge.status).toBe('two_factor')
    // Ainda não está logada enquanto o 2FA não é confirmado.
    expect(await mockAuth.currentAccount()).toBeNull()

    if (challenge.status !== 'two_factor') throw new Error('esperava desafio de 2FA')
    const bad = await mockAuth.verifyTwoFactor({ challengeId: challenge.challenge.id, code: 'abc' })
    expect(bad).toEqual({ status: 'error', error: 'invalidCode' })

    const ok = await mockAuth.verifyTwoFactor({ challengeId: challenge.challenge.id, code: '123456' })
    expect(ok.status).toBe('ok')
    expect((await mockAuth.currentAccount())?.email).toBe('fulana@example.com')
  })
})

describe('gatilho getAuthProvider', () => {
  it('sem endpoint usa o mock (não-remoto)', () => {
    expect(getAuthProvider('').remote).toBe(false)
    expect(isRealAuthEnabled('')).toBe(false)
  })

  it('com endpoint usa o provedor remoto', () => {
    expect(getAuthProvider('/api/auth').remote).toBe(true)
    expect(isRealAuthEnabled('/api/auth')).toBe(true)
  })
})

describe('remoteAuth (quando o back-end está configurado)', () => {
  it('login bem-sucedido devolve a conta e não manda token do cliente', async () => {
    const account = { id: 'a1', name: 'Fulana', email: 'fulana@example.com', role: 'seller', twoFactor: false }
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ account }), { status: 200 }))
    vi.stubGlobal('fetch', fetchSpy)

    const result = await getAuthProvider('/api/auth').signIn({ email: 'fulana@example.com', password: 'x' })
    expect(result).toEqual({ status: 'ok', account })

    const [, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit]
    expect(init.credentials).toBe('same-origin')
    const headers = init.headers as Record<string, string>
    expect(Object.keys(headers).map((h) => h.toLowerCase())).not.toContain('authorization')
  })

  it('credencial inválida (401) vira invalidCredentials', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('no', { status: 401 })),
    )
    const result = await getAuthProvider('/api/auth').signIn({ email: 'x@y.com', password: 'x' })
    expect(result).toEqual({ status: 'error', error: 'invalidCredentials' })
  })

  it('back-end pode exigir 2FA respondendo um desafio', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ twoFactor: { challengeId: 'c1', method: 'sms' } }), { status: 200 })),
    )
    const result = await getAuthProvider('/api/auth').signIn({ email: 'x@y.com', password: 'x' })
    expect(result).toEqual({ status: 'two_factor', challenge: { id: 'c1', method: 'sms' } })
  })
})
