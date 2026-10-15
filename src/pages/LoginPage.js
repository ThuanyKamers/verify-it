import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useI18n } from '../i18n';
/** Login simulado: não há conta de verdade, só a escolha do perfil. */
export function LoginPage({ onLogin }) {
    const { t } = useI18n();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    return (_jsxs("section", { className: "welcome", children: [_jsxs("div", { className: "welcome-copy", children: [_jsx("h1", { className: "display", children: t('hero.title') }), _jsx("p", { className: "lead", children: t('hero.lede') })] }), _jsxs("form", { className: "form sheet", onSubmit: (e) => e.preventDefault(), children: [_jsx("h2", { children: t('login.title') }), _jsx("p", { className: "muted", children: t('login.lead') }), _jsxs("div", { className: "role-buttons", children: [_jsxs("button", { type: "button", className: "role", onClick: () => onLogin('buyer'), children: [_jsx("strong", { children: t('login.buyer') }), _jsx("span", { children: t('login.buyerDesc') })] }), _jsxs("button", { type: "button", className: "role", onClick: () => onLogin('seller'), children: [_jsx("strong", { children: t('login.seller') }), _jsx("span", { children: t('login.sellerDesc') })] })] }), _jsxs("label", { className: "field", children: [t('login.email'), _jsx("input", { type: "email", autoComplete: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com" })] }), _jsxs("label", { className: "field", children: [t('login.password'), _jsx("input", { type: "password", autoComplete: "current-password", value: password, onChange: (e) => setPassword(e.target.value) })] }), _jsx("p", { className: "muted small", children: t('login.simulated') })] })] }));
}
