// Contas de usuário: cadastro, login e segundo fator (2FA). Aqui ficam só os
// contratos (tipos e interface). A implementação padrão é um mock local (para o
// protótipo); a real depende de um back-end e é ligada depois.
// Ver docs/cadastro-login-banco.md.

import type { DocumentFiles } from '../documents'
import type { Role } from '../session'

/** Conta de usuário. NUNCA carrega senha nem dado sensível. */
export interface Account {
  id: string
  name: string
  email: string
  /** Perfil escolhido: vendedor ou comprador. */
  role: Role
  /** Se o segundo fator (2FA) está ativado para a conta. */
  twoFactor: boolean
  /**
   * Documentos pessoais do vendedor enviados no cadastro (no protótipo, só os
   * nomes dos arquivos). Só o vendedor tem; o comprador não precisa.
   */
  documents?: DocumentFiles
}

export interface SignUpInput {
  name: string
  email: string
  password: string
  role: Role
  /** Ativar o segundo fator já no cadastro. */
  enableTwoFactor?: boolean
  /** Documentos pessoais do vendedor (identidade frente/verso e selfie). */
  documents?: DocumentFiles
}

export interface SignInInput {
  email: string
  password: string
}

/** Forma de entregar o código do segundo fator. */
export type TwoFactorMethod = 'totp' | 'sms' | 'email'

/** Desafio de 2FA: o login só termina depois de confirmar o código. */
export interface TwoFactorChallenge {
  id: string
  method: TwoFactorMethod
}

export interface TwoFactorInput {
  challengeId: string
  code: string
}

export type AuthErrorCode =
  | 'invalidEmail'
  | 'weakPassword'
  | 'emailInUse'
  | 'missingDocuments'
  | 'invalidCredentials'
  | 'invalidCode'
  | 'unavailable'
  | 'error'

/**
 * Resultado de uma operação de auth:
 *  - 'ok': autenticado.
 *  - 'two_factor': falta confirmar o segundo fator (chamar verifyTwoFactor).
 *  - 'error': falhou (ver `error`).
 */
export type AuthResult =
  | { status: 'ok'; account: Account }
  | { status: 'two_factor'; challenge: TwoFactorChallenge }
  | { status: 'error'; error: AuthErrorCode }

/**
 * Provedor de autenticação. Implementações:
 *  - mockAuth: contas locais, só para o protótipo (sem back-end).
 *  - remoteAuth: fala com o back-end do Verify It (ligado por configuração).
 */
export interface AuthProvider {
  readonly id: string
  /** true quando há um back-end real por trás (não é o mock). */
  readonly remote: boolean
  signUp(input: SignUpInput): Promise<AuthResult>
  signIn(input: SignInInput): Promise<AuthResult>
  /** Confirma o código do segundo fator para concluir o login. */
  verifyTwoFactor(input: TwoFactorInput): Promise<AuthResult>
  signOut(): Promise<void>
  /** Conta da sessão atual, ou null se ninguém está logado. */
  currentAccount(): Promise<Account | null>
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

/** Exigência mínima de senha. O back-end real deve reforçar isso no servidor. */
export function isStrongEnough(password: string): boolean {
  return password.trim().length >= 8
}

/** Código de 2FA: 6 dígitos. */
export function isValidTwoFactorCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim())
}
