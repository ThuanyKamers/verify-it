import { useEffect, useState } from 'react'
import { LANGUAGES, useI18n, type MessageKey } from './i18n'
import { useAppState } from './lib/store'
import { ActivityPage } from './pages/ActivityPage'
import { CheckPage } from './pages/CheckPage'
import { HowPage } from './pages/HowPage'
import { RegisterPage } from './pages/RegisterPage'

const ROUTES = ['check', 'register', 'how', 'activity'] as const
type Route = (typeof ROUTES)[number]

const NAV: Record<Route, MessageKey> = {
  check: 'nav.check',
  register: 'nav.register',
  how: 'nav.how',
  activity: 'nav.activity',
}

function readRoute(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return (ROUTES as readonly string[]).includes(hash) ? (hash as Route) : 'check'
}

export function App() {
  const { t, lang, setLang } = useI18n()
  const [route, setRoute] = useState<Route>(readRoute)
  const app = useAppState()

  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a className="brand" href="#/check">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M16 2 4 7v8c0 7.5 5.1 13.4 12 15 6.9-1.6 12-7.5 12-15V7z" />
              <path d="m10 16 4 4 8-9" className="check" />
            </svg>
            Verify It
          </a>
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
        <nav className="nav">
          {ROUTES.map((r) => (
            <a key={r} href={`#/${r}`} className={r === route ? 'active' : ''} aria-current={r === route ? 'page' : undefined}>
              {t(NAV[r])}
            </a>
          ))}
        </nav>
      </header>

      <main className="main">
        {route === 'check' && <CheckPage {...app} />}
        {route === 'register' && <RegisterPage {...app} />}
        {route === 'how' && <HowPage />}
        {route === 'activity' && <ActivityPage {...app} />}
      </main>

      <footer className="footer">{t('footer.prototype')}</footer>
    </div>
  )
}
