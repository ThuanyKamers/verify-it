/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base das rotas de autenticação do back-end (mesma origem), ex.: '/api/auth'.
   * Vazia neste site de demonstração: o login/2FA roda no modo local (mock).
   */
  readonly VITE_AUTH_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
