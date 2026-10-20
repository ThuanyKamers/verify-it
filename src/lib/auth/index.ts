// Ponto único de ativação ("gatilho") da autenticação.
//
// Sem VITE_AUTH_ENDPOINT configurado, usa o mock local (protótipo). Com ele
// configurado, usa o back-end real. Ver docs/cadastro-login-banco.md.

import { mockAuth } from './mockAuth'
import { remoteAuth } from './remoteAuth'
import type { AuthProvider } from './types'

function readEndpoint(): string {
  try {
    return (import.meta.env?.VITE_AUTH_ENDPOINT ?? '').trim()
  } catch {
    return ''
  }
}

/**
 * Devolve o provedor de autenticação ativo. Sem endpoint, devolve o mock local.
 * O parâmetro existe para testes; em produção vem do ambiente.
 */
export function getAuthProvider(endpoint: string = readEndpoint()): AuthProvider {
  return endpoint ? remoteAuth({ endpoint }) : mockAuth
}

/** true quando a autenticação real (back-end) está ligada. */
export function isRealAuthEnabled(endpoint: string = readEndpoint()): boolean {
  return getAuthProvider(endpoint).remote
}

export { mockAuth } from './mockAuth'
export { remoteAuth } from './remoteAuth'
export type { RemoteAuthConfig } from './remoteAuth'
export { isStrongEnough, isValidEmail, isValidTwoFactorCode } from './types'
export type {
  Account,
  AuthErrorCode,
  AuthProvider,
  AuthResult,
  NotifyChannel,
  SignInInput,
  SignUpInput,
  TwoFactorChallenge,
  TwoFactorInput,
  TwoFactorMethod,
  VerificationStatus,
} from './types'
