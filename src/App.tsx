import { useEffect, useState } from 'react'
import { LANGUAGES, useI18n, type MessageKey } from './i18n'
import { loadRole, saveRole, type Role } from './lib/session'
import { useAppState } from './lib/store'
import { ActivityPage } from './pages/ActivityPage'
import { CheckPage } from './pages/CheckPage'
import { HowPage } from './pages/HowPage'
import { LoginPage } from './pages/LoginPage'
import { ListingCopyPage } from './pages/ListingCopyPage'
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

/** Página-cópia do marketplace: `#/listing/{checkId}`, aberta sem login. */
function readListingId(): string | null {
  const m = window.location.hash.match(/^#\/listing\/([\w-]+)$/)
  return m ? m[1] : null
}

export function App() {
  const { t, lang, setLang } = useI18n()
  const [role, setRole] = useState<Role | null>(loadRole)
  const [route, setRoute] = useState<Route>(() => readRoute(role))
  const [listingId, setListingId] = useState<string | null>(readListingId)
  const app = useAppState()

  useEffect(() => {
    const onHash = () => {
      setListingId(readListingId())
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

  if (listingId) return <ListingCopyPage state={app.state} checkId={listingId} />

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead-inner">
          <a className="brand" href={role ? `#/${ROUTES_BY_ROLE[role][0]}` : '#'}>
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7" /></svg>
            </span>
            Verify It
          </a>
          {role && (
            <nav className="nav" aria-label="Main">
              {ROUTES_BY_ROLE[role].map((r) => (
                <a key={r} href={`#/${r}`} aria-current={r === route ? 'page' : undefined}>
                  {t(NAV[r])}
                </a>
              ))}
            </nav>
          )}
          <div className="tools">
            <div className="lang-switch" role="group" aria-label={t('lang.label')}>
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  aria-pressed={l.code === lang}
                  lang={l.htmlLang}
                  title={l.label}
                  onClick={() => setLang(l.code)}
                >
                  {l.code.toUpperCase()}
                </button>
              ))}
            </div>
            {role && (
              <div className="session">
                <span>{t(`header.role.${role}`)}</span>
                <button type="button" className="text-button" onClick={logout}>{t('header.logout')}</button>
              </div>
            )}
          </div>
        </div>
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
