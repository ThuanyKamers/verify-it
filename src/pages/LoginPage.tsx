import { useState } from 'react'
import { useI18n } from '../i18n'
import type { Role } from '../lib/session'

/** Login simulado: não há conta de verdade, só a escolha do perfil. */
export function LoginPage({ onLogin }: { onLogin: (role: Role) => void }) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <section className="welcome">
      <div className="welcome-copy">
        <h1 className="display">{t('hero.title')}</h1>
        <p className="lead">{t('hero.lede')}</p>
      </div>

      <form className="form sheet" onSubmit={(e) => e.preventDefault()}>
        <h2>{t('login.title')}</h2>
        <p className="muted">{t('login.lead')}</p>
        <div className="role-buttons">
          <button type="button" className="role" onClick={() => onLogin('buyer')}>
            <strong>{t('login.buyer')}</strong>
            <span>{t('login.buyerDesc')}</span>
          </button>
          <button type="button" className="role" onClick={() => onLogin('seller')}>
            <strong>{t('login.seller')}</strong>
            <span>{t('login.sellerDesc')}</span>
          </button>
        </div>
        <label className="field">
          {t('login.email')}
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="field">
          {t('login.password')}
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <p className="muted small">{t('login.simulated')}</p>
      </form>
    </section>
  )
}
