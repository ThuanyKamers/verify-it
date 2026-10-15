import { useState } from 'react'
import { useI18n } from '../i18n'
import type { Role } from '../lib/session'

/** Login simulado: não há conta de verdade, só a escolha do perfil. */
export function LoginPage({ onLogin }: { onLogin: (role: Role) => void }) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <section className="login">
      <h1>{t('login.title')}</h1>
      <p className="lead">{t('login.lead')}</p>

      <form className="card form" onSubmit={(e) => e.preventDefault()}>
        <label>
          {t('login.email')}
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
        </label>
        <label>
          {t('login.password')}
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        <div className="role-buttons">
          <button type="button" className="role-button" onClick={() => onLogin('seller')}>
            <span className="role-emoji" aria-hidden="true">🔑</span>
            <strong>{t('login.seller')}</strong>
            <small>{t('login.sellerDesc')}</small>
          </button>
          <button type="button" className="role-button" onClick={() => onLogin('buyer')}>
            <span className="role-emoji" aria-hidden="true">🔍</span>
            <strong>{t('login.buyer')}</strong>
            <small>{t('login.buyerDesc')}</small>
          </button>
        </div>
        <p className="note">{t('login.simulated')}</p>
      </form>
    </section>
  )
}
