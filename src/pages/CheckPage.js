import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Leaders } from '../components/Leaders';
import { PlateInput } from '../components/PlateInput';
import { listingHref } from '../lib/mockListing';
import { useI18n } from '../i18n';
import { DEMO_URLS } from '../lib/seed';
import { parseListingUrl } from '../lib/url';
import { maskPlate } from '../lib/validation';
import { addReport, appendLog, check } from '../lib/verify';
export function CheckPage({ state, update }) {
    const { t, locale } = useI18n();
    const [url, setUrl] = useState('');
    const [plate, setPlate] = useState('');
    const [result, setResult] = useState(null);
    const [reported, setReported] = useState(false);
    // Muda a cada consulta para que o carimbo "bata" de novo, mesmo com o mesmo resultado.
    const [run, setRun] = useState(0);
    function runCheck(nextUrl, nextPlate) {
        const res = check(state, { url: nextUrl, plate: nextPlate });
        setResult(res);
        setReported(false);
        setRun((n) => n + 1);
        if (res.status !== 'invalid') {
            update((s) => appendLog(s, { type: 'check', site: res.listing?.site ?? siteOf(nextUrl), result: res.status }));
        }
    }
    function onSubmit(e) {
        e.preventDefault();
        runCheck(url, plate);
    }
    function tryExample(exampleUrl, examplePlate = '') {
        setUrl(exampleUrl);
        setPlate(examplePlate);
        runCheck(exampleUrl, examplePlate);
    }
    function report() {
        update((s) => {
            const next = addReport(s, url);
            return next ? appendLog(next, { type: 'report', site: siteOf(url), result: 'reported' }) : s;
        });
        setReported(true);
        setResult((r) => (r ? { ...r, reportCount: r.reportCount + 1 } : r));
    }
    const date = (iso) => new Date(iso).toLocaleDateString(locale);
    const risky = result && result.status !== 'verified' && result.status !== 'invalid';
    return (_jsxs("section", { className: "page", children: [_jsx("h1", { children: t('check.title') }), _jsx("p", { className: "lead", children: t('check.lead') }), _jsxs("form", { className: "form check-form", onSubmit: onSubmit, children: [_jsxs("label", { className: "field", children: [t('check.url'), _jsx("input", { type: "url", inputMode: "url", required: true, value: url, onChange: (e) => setUrl(e.target.value), placeholder: t('check.urlPlaceholder') })] }), _jsxs("div", { className: "check-row", children: [_jsx(PlateInput, { value: plate, onChange: setPlate, label: t('check.plate') }), _jsx("button", { className: "button button-primary", type: "submit", children: t('check.submit') })] }), _jsx("p", { className: "muted small", children: t('check.plateHint') })] }), _jsxs("div", { className: "examples", children: [_jsx("span", { children: t('check.examples') }), _jsx("button", { type: "button", className: "text-button", onClick: () => tryExample(DEMO_URLS.verified), children: t('check.example.verified') }), _jsx("button", { type: "button", className: "text-button", onClick: () => tryExample(DEMO_URLS.cloned, DEMO_URLS.clonedPlate), children: t('check.example.cloned') }), _jsx("button", { type: "button", className: "text-button", onClick: () => tryExample(DEMO_URLS.unknown), children: t('check.example.unknown') })] }), result && (_jsxs("article", { className: `report report-${result.status}`, role: "status", "aria-live": "polite", children: [_jsx("h2", { className: "stamp", children: t(`status.${result.status}`) }, run), _jsx("p", { className: "report-body", children: t(`result.${result.status}.body`) }), risky && (_jsx("ul", { className: "reasons", children: result.reasons.map((r) => (_jsx("li", { children: t(`reason.${r}`, { n: result.reportCount }) }, r))) })), result.status === 'verified' && result.listing && (_jsxs(_Fragment, { children: [_jsx(Leaders, { rows: [
                                    { label: t('result.vehicle'), value: `${result.listing.make} ${result.listing.model} ${result.listing.year}` },
                                    { label: t('result.plate'), value: maskPlate(result.listing.plate) },
                                    { label: t('result.site'), value: result.listing.site },
                                    { label: t('result.verifiedOn'), value: date(result.listing.createdAt) },
                                    { label: t('result.checkId'), value: _jsx("code", { children: result.listing.checkId }) },
                                ] }), result.reportCount > 0 && _jsx("p", { className: "warning", children: t('result.reportsWarning', { n: result.reportCount }) }), _jsx("a", { className: "button button-primary", href: listingHref(result.listing), target: "_blank", rel: "noopener noreferrer", children: t('result.openListing') })] })), result.related.length > 0 && (_jsxs("div", { className: "report-part", children: [_jsx("h3", { children: t('result.related') }), _jsx("ul", { className: "plain-list", children: result.related.map((l) => (_jsxs("li", { children: [_jsx("a", { href: listingHref(l), target: "_blank", rel: "noopener noreferrer", children: l.site }), ", ", l.make, " ", l.model, " ", l.year] }, l.checkId))) })] })), risky && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "report-part", children: [_jsx("h3", { children: t('result.tips.title') }), _jsxs("ul", { className: "plain-list", children: [_jsx("li", { children: t('result.tips.1') }), _jsx("li", { children: t('result.tips.2') }), _jsx("li", { children: t('result.tips.3') })] })] }), reported ? (_jsx("p", { className: "confirmation", children: t('result.reported') })) : (_jsx("button", { type: "button", className: "button button-danger", onClick: report, children: t('result.report') }))] }))] }))] }));
}
function siteOf(url) {
    return parseListingUrl(url)?.site ?? '-';
}
