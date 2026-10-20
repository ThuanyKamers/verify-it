// Autenticação real contra o back-end do Verify It.
//
// SEGURANÇA: o navegador fala só com o PRÓPRIO back-end (mesma origem). O back-end
// valida senha e código de 2FA, cria a sessão (cookie HttpOnly) e guarda qualquer
// segredo. O cliente nunca recebe nem guarda senha, código ou token.
// Ligado por VITE_AUTH_ENDPOINT.

import type {
  Account,
  AuthProvider,
  AuthResult,
  SignInInput,
  SignUpInput,
  TwoFactorInput,
  TwoFactorMethod,
} from './types'

export interface RemoteAuthConfig {
  /** Base das rotas de auth do back-end (mesma origem), ex.: '/api/auth'. */
  endpoint: string
  timeoutMs?: number
}

function isAccount(value: unknown): value is Account {
  const a = value as Partial<Account> | null
  return !!a && typeof a.id === 'string' && typeof a.email === 'string' && (a.role === 'buyer' || a.role === 'seller')
}

const METHODS: readonly TwoFactorMethod[] = ['totp', 'sms', 'email']

/** Traduz o corpo da resposta do back-end num AuthResult conhecido. */
function toResult(data: unknown): AuthResult {
  const body = (data ?? {}) as Record<string, unknown>
  const tf = body.twoFactor as { challengeId?: unknown; method?: unknown } | undefined
  if (tf && typeof tf.challengeId === 'string') {
    const method = METHODS.includes(tf.method as TwoFactorMethod) ? (tf.method as TwoFactorMethod) : 'totp'
    return { status: 'two_factor', challenge: { id: tf.challengeId, method } }
  }
  return isAccount(body.account) ? { status: 'ok', account: body.account } : { status: 'error', error: 'error' }
}

export function remoteAuth(config: RemoteAuthConfig): AuthProvider {
  const base = config.endpoint.replace(/\/+$/, '')
  const timeoutMs = config.timeoutMs ?? 8000

  async function call(path: string, body?: unknown): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        // Cookie de sessão (HttpOnly) autentica; nenhum token no cliente.
        credentials: 'same-origin',
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }
  }

  async function authCall(path: string, body: unknown): Promise<AuthResult> {
    try {
      const res = await call(path, body)
      if (res.status === 409) return { status: 'error', error: 'emailInUse' }
      if (res.status === 401) return { status: 'error', error: 'invalidCredentials' }
      if (res.status === 422) return { status: 'error', error: 'invalidCode' }
      if (!res.ok) return { status: 'error', error: 'error' }
      return toResult(await res.json())
    } catch {
      return { status: 'error', error: 'error' }
    }
  }

  return {
    id: 'remote',
    remote: true,
    signUp: (input: SignUpInput) => authCall('/signup', input),
    signIn: (input: SignInInput) => authCall('/signin', input),
    verifyTwoFactor: (input: TwoFactorInput) => authCall('/2fa/verify', input),
    async signOut(): Promise<void> {
      try {
        await call('/signout')
      } catch {
        // ignora erro de rede no logout
      }
    },
    async currentAccount(): Promise<Account | null> {
      try {
        const res = await call('/me')
        if (!res.ok) return null
        const data = (await res.json()) as { account?: unknown }
        return isAccount(data?.account) ? data.account : null
      } catch {
        return null
      }
    },
  }
}
