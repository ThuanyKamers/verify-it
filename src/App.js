import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { LANGUAGES, useI18n } from './i18n';
import { loadRole, saveRole } from './lib/session';
import { useAppState } from './lib/store';
import { ActivityPage } from './pages/ActivityPage';
import { CheckPage } from './pages/CheckPage';
import { HowPage } from './pages/HowPage';
import { LoginPage } from './pages/LoginPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { RegisterPage } from './pages/RegisterPage';
/** Telas de cada perfil; a primeira é a inicial. */
const ROUTES_BY_ROLE = {
    buyer: ['check', 'how'],
    seller: ['register', 'activity', 'how'],
};
const NAV = {
    check: 'nav.check',
    register: 'nav.register',
    how: 'nav.how',
    activity: 'nav.activity',
};
function readRoute(role) {
    if (!role)
        return 'check';
    const routes = ROUTES_BY_ROLE[role];
    const hash = window.location.hash.replace(/^#\/?/, '');
    return routes.includes(hash) ? hash : routes[0];
}
/** Página-cópia do marketplace: `#/listing/{checkId}`, aberta sem login. */
function readListingId() {
    const m = window.location.hash.match(/^#\/listing\/([\w-]+)$/);
    return m ? m[1] : null;
}
export function App() {
    const { t, lang, setLang } = useI18n();
    const [role, setRole] = useState(loadRole);
    const [route, setRoute] = useState(() => readRoute(role));
    const [listingId, setListingId] = useState(readListingId);
    const app = useAppState();
    useEffect(() => {
        const onHash = () => {
            setListingId(readListingId());
            setRoute(readRoute(role));
            window.scrollTo(0, 0);
        };
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, [role]);
    function login(next) {
        saveRole(next);
        setRole(next);
        const first = ROUTES_BY_ROLE[next][0];
        window.location.hash = `#/${first}`;
        setRoute(first);
    }
    function logout() {
        saveRole(null);
        setRole(null);
        window.location.hash = '';
    }
    if (listingId)
        return _jsx(MarketplacePage, { state: app.state, checkId: listingId });
    return (_jsxs("div", { className: "app", children: [_jsx("header", { className: "masthead", children: _jsxs("div", { className: "masthead-inner", children: [_jsxs("a", { className: "brand", href: role ? `#/${ROUTES_BY_ROLE[role][0]}` : '#', children: [_jsx("span", { className: "brand-mark", "aria-hidden": "true", children: _jsx("svg", { viewBox: "0 0 24 24", children: _jsx("path", { d: "m5 12.5 4.5 4.5L19 7" }) }) }), "Verify It"] }), role && (_jsx("nav", { className: "nav", "aria-label": "Main", children: ROUTES_BY_ROLE[role].map((r) => (_jsx("a", { href: `#/${r}`, "aria-current": r === route ? 'page' : undefined, children: t(NAV[r]) }, r))) })), _jsxs("div", { className: "tools", children: [_jsx("div", { className: "lang-switch", role: "group", "aria-label": t('lang.label'), children: LANGUAGES.map((l) => (_jsx("button", { type: "button", "aria-pressed": l.code === lang, lang: l.htmlLang, title: l.label, onClick: () => setLang(l.code), children: l.code.toUpperCase() }, l.code))) }), role && (_jsxs("div", { className: "session", children: [_jsx("span", { children: t(`header.role.${role}`) }), _jsx("button", { type: "button", className: "text-button", onClick: logout, children: t('header.logout') })] }))] })] }) }), _jsxs("main", { className: "main", children: [!role && _jsx(LoginPage, { onLogin: login }), role && route === 'check' && _jsx(CheckPage, { ...app }), role && route === 'register' && _jsx(RegisterPage, { ...app }), role && route === 'how' && _jsx(HowPage, {}), role && route === 'activity' && _jsx(ActivityPage, { ...app })] }), _jsx("footer", { className: "footer", children: t('footer.prototype') })] }));
}
