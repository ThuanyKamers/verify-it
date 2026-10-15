import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useI18n } from '../i18n';
const STEPS = ['seller', 'check', 'buyer'];
export function HowPage() {
    const { t, locale } = useI18n();
    const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(2.7e9);
    const victims = new Intl.NumberFormat(locale).format(91000);
    return (_jsxs("section", { className: "page", children: [_jsx("h1", { children: t('how.title') }), _jsx("ol", { className: "steps", children: STEPS.map((step) => (_jsxs("li", { children: [_jsx("h2", { children: t(`how.${step}.title`).replace(/^\d+\.\s*/, '') }), _jsx("p", { children: t(`how.${step}.body`) })] }, step))) }), _jsx("h2", { className: "section-title", children: t('how.stats.title') }), _jsxs("dl", { className: "figures", children: [_jsxs("div", { children: [_jsx("dt", { children: t('how.stats.loss') }), _jsx("dd", { children: money })] }), _jsxs("div", { children: [_jsx("dt", { children: t('how.stats.victims') }), _jsx("dd", { children: victims })] }), _jsxs("div", { children: [_jsx("dt", { children: t('how.stats.attempts') }), _jsx("dd", { children: "80%" })] }), _jsxs("div", { children: [_jsx("dt", { children: t('how.stats.would') }), _jsx("dd", { children: "100%" })] })] }), _jsx("p", { className: "muted small", children: t('how.stats.source') })] }));
}
