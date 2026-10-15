import { useEffect, useState } from 'react'
import { LANGUAGES, useI18n, type MessageKey } from './i18n'
import { loadRole, saveRole, type Role } from './lib/session'
import { useAppState } from './lib/store'
import { ActivityPage } from './pages/ActivityPage'
import { CheckPage } from './pages/CheckPage'
import { HowPage } from './pages/HowPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

type Route = 'check' | 'register' | 'how' | 'activity'

/** Telas de cada perfil; a primeira é a inicial. */
const ROUTES_BY_ROLE: Record<Role, Route[]> = {
  buyer: ['check', 'how'],
  seller: ['register', 'activity', 'how'],
}

const NAV: Record<Route, MessageKey> = {
  check: 'nav.check',
  register: 'nav.register',
  how: 'nav.how',
  activity: 'nav.activity',
}

function readRoute(role: Role | null): Route {
  if (!role) return 'check'
  const routes = ROUTES_BY_ROLE[role]
  const hash = window.location.hash.replace(/^#\/?/, '')
  return (routes as string[]).includes(hash) ? (hash as Route) : routes[0]
}

export function App() {
  const { t, lang, setLang } = useI18n()
  const [role, setRole] = useState<Role | null>(loadRole)
  const [route, setRoute] = useState<Route>(() => readRoute(role))
  const app = useAppState()

  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute(role))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [role])

  function login(next: Role) {
    saveRole(next)
    setRole(next)
    const first = ROUTES_BY_ROLE[next][0]
    window.location.hash = `#/${first}`
    setRoute(first)
  }

  function logout() {
    saveRole(null)
    setRole(null)
    window.location.hash = ''
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a className="brand" href={role ? `#/${ROUTES_BY_ROLE[role][0]}` : '#'}>
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M16 2 4 7v8c0 7.5 5.1 13.4 12 15 6.9-1.6 12-7.5 12-15V7z" />
              <path d="m10 16 4 4 8-9" className="check" />
            </svg>
            Verify It
          </a>
          <div className="header-actions">
            {role && (
              <div className="session">
                <span className="role-badge">{t(`header.role.${role}`)}</span>
                <button type="button" className="link" onClick={logout}>{t('header.logout')}</button>
              </div>
            )}
            <div className="lang-switch" role="group" aria-label={t('lang.label')}>
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={l.code === lang ? 'active' : ''}
                  aria-pressed={l.code === lang}
                  title={l.label}
                  onClick={() => setLang(l.code)}
                >
                  {l.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        {role && (
          <nav className="nav">
            {ROUTES_BY_ROLE[role].map((r) => (
              <a key={r} href={`#/${r}`} className={r === route ? 'active' : ''} aria-current={r === route ? 'page' : undefined}>
                {t(NAV[r])}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main className="main">
        {!role && <LoginPage onLogin={login} />}
        {role && route === 'check' && <CheckPage {...app} />}
        {role && route === 'register' && <RegisterPage {...app} />}
        {role && route === 'how' && <HowPage />}
        {role && route === 'activity' && <ActivityPage {...app} />}
      </main>

      <footer className="footer">{t('footer.prototype')}</footer>
    </div>
  )
}
