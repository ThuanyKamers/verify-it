// Autenticação SIMULADA, só para o protótipo rodar sem back-end.
//
// ATENÇÃO: isto NÃO é login de verdade. Guarda apenas nome, e-mail, perfil e se o
// 2FA está ligado, no localStorage do navegador; NUNCA guarda senha. No 2FA, aceita
// qualquer código de 6 dígitos. Não serve para produção — use o remoteAuth, com o
// back-end validando senha e código no servidor.

import {
  isStrongEnough,
  isValidEmail,
  isValidTwoFactorCode,
  type Account,
  type AuthProvider,
  type AuthResult,
  type SignInInput,
  type SignUpInput,
  type TwoFactorInput,
} from './types'

const ACCOUNTS_KEY = 'verify-it:accounts'
const CURRENT_KEY = 'verify-it:account'

// Desafios de 2FA pendentes (só em memória, nesta aba).
const pendingTwoFactor = new Map<string, string>()

function readAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? (parsed as Account[]) : []
  } catch {
    return []
  }
}

function writeAccounts(accounts: Account[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    // Sem armazenamento (ex.: janela privada): a conta vale só nesta visita.
  }
}

function setCurrent(id: string | null): void {
  try {
    if (id) localStorage.setItem(CURRENT_KEY, id)
    else localStorage.removeItem(CURRENT_KEY)
  } catch {
    // ignora: sessão só em memória
  }
}

function newId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }
}

export const mockAuth: AuthProvider = {
  id: 'mock',
  remote: false,

  async signUp(input: SignUpInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase()
    if (!isValidEmail(email)) return { status: 'error', error: 'invalidEmail' }
    if (!isStrongEnough(input.password)) return { status: 'error', error: 'weakPassword' }

    const accounts = readAccounts()
    if (accounts.some((a) => a.email === email)) return { status: 'error', error: 'emailInUse' }

    const account: Account = {
      id: newId(),
      name: input.name.trim(),
      email,
      role: input.role,
      twoFactor: Boolean(input.enableTwoFactor),
    }
    writeAccounts([...accounts, account])
    setCurrent(account.id)
    return { status: 'ok', account }
  },

  async signIn(input: SignInInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase()
    // Mock: a conta precisa existir, mas a senha não é verificada (não é guardada).
    const account = readAccounts().find((a) => a.email === email)
    if (!account) return { status: 'error', error: 'invalidCredentials' }

    if (account.twoFactor) {
      const challengeId = newId()
      pendingTwoFactor.set(challengeId, account.id)
      return { status: 'two_factor', challenge: { id: challengeId, method: 'totp' } }
    }

    setCurrent(account.id)
    return { status: 'ok', account }
  },

  async verifyTwoFactor(input: TwoFactorInput): Promise<AuthResult> {
    const accountId = pendingTwoFactor.get(input.challengeId)
    if (!accountId) return { status: 'error', error: 'invalidCode' }
    // Mock: aceita qualquer código de 6 dígitos (o back-end real validaria de verdade).
    if (!isValidTwoFactorCode(input.code)) return { status: 'error', error: 'invalidCode' }

    const account = readAccounts().find((a) => a.id === accountId)
    if (!account) return { status: 'error', error: 'error' }
    pendingTwoFactor.delete(input.challengeId)
    setCurrent(account.id)
    return { status: 'ok', account }
  },

  async signOut(): Promise<void> {
    setCurrent(null)
  },

  async currentAccount(): Promise<Account | null> {
    try {
      const id = localStorage.getItem(CURRENT_KEY)
      if (!id) return null
      return readAccounts().find((a) => a.id === id) ?? null
    } catch {
      return null
    }
  },
}
