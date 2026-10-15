import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Leaders } from '../components/Leaders';
import { PlateInput } from '../components/PlateInput';
import { useI18n } from '../i18n';
import { renavamCheckDigit } from '../lib/validation';
import { appendLog, register } from '../lib/verify';
const EMPTY = { url: '', plate: '', vin: '', renavam: '', make: '', model: '', year: '', proofFileName: '' };
/** Dados de exemplo: o mesmo Civic da demonstração, agora anunciado na Webmotors. */
const DEMO = {
    url: 'https://www.webmotors.com.br/comprar/honda/civic/2-0-exl/4-portas/2019/47712345',
    plate: 'RIO2A18',
    vin: '93HFC2650KZ100001',
    renavam: '0123456789' + renavamCheckDigit('0123456789'),
    make: 'Honda',
    model: 'Civic EXL',
    year: '2019',
    proofFileName: 'crlv-e-exemplo.pdf',
};
export function RegisterPage({ state, update }) {
    const { t, locale } = useI18n();
    const [form, setForm] = useState(EMPTY);
    const [result, setResult] = useState(null);
    const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
    function onSubmit(e) {
        e.preventDefault();
        const res = register(state, form);
        setResult(res);
        if (res.ok) {
            update((s) => appendLog({ ...s, listings: [...s.listings, res.listing] }, { type: 'register', site: res.listing.site, result: res.listing.checkId }));
        }
        else {
            update((s) => appendLog(s, { type: 'rejected', site: res.conflict?.site ?? '-', result: res.errors.join(', ') }));
        }
    }
    function restart() {
        setForm(EMPTY);
        setResult(null);
    }
    if (result?.ok) {
        return (_jsx("section", { className: "page", children: _jsxs("article", { className: "report report-verified", children: [_jsx("h2", { className: "stamp", children: t('status.verified') }), _jsx("p", { className: "report-body", children: t('register.success.body') }), _jsx(Leaders, { rows: [
                            { label: t('result.checkId'), value: _jsx("code", { children: result.listing.checkId }) },
                            { label: t('result.vehicle'), value: `${result.listing.make} ${result.listing.model} ${result.listing.year}` },
                            { label: t('result.site'), value: result.listing.site },
                            { label: t('result.verifiedOn'), value: new Date(result.listing.createdAt).toLocaleString(locale) },
                        ] }), result.otherSites.length > 0 && (_jsx("p", { children: t('register.success.otherSites', { sites: result.otherSites.map((l) => l.site).join(', ') }) })), _jsx("button", { type: "button", className: "button button-primary", onClick: restart, children: t('register.success.another') })] }) }));
    }
    return (_jsxs("section", { className: "page", children: [_jsx("h1", { children: t('register.title') }), _jsx("p", { className: "lead", children: t('register.lead') }), result && !result.ok && (_jsxs("div", { className: "alert", role: "alert", children: [_jsx("h2", { children: t('register.rejected.title') }), _jsx("ul", { className: "reasons", children: result.errors.map((err) => (_jsx("li", { children: errorText(t, err, result.conflict) }, err))) })] })), _jsxs("form", { className: "form", onSubmit: onSubmit, noValidate: true, children: [_jsxs("label", { className: "field", children: [t('register.url'), _jsx("input", { type: "url", inputMode: "url", value: form.url, onChange: (e) => set('url')(e.target.value), placeholder: "https://www.olx.com.br/..." })] }), _jsxs("div", { className: "grid-3", children: [_jsxs("label", { className: "field", children: [t('register.make'), _jsx("input", { value: form.make, onChange: (e) => set('make')(e.target.value) })] }), _jsxs("label", { className: "field", children: [t('register.model'), _jsx("input", { value: form.model, onChange: (e) => set('model')(e.target.value) })] }), _jsxs("label", { className: "field", children: [t('register.year'), _jsx("input", { inputMode: "numeric", maxLength: 4, value: form.year, onChange: (e) => set('year')(e.target.value) })] })] }), _jsxs("div", { className: "grid-3", children: [_jsx(PlateInput, { value: form.plate, onChange: set('plate'), label: t('register.plate') }), _jsxs("label", { className: "field", children: [t('register.vin'), _jsx("input", { value: form.vin, maxLength: 17, onChange: (e) => set('vin')(e.target.value.toUpperCase()) })] }), _jsxs("label", { className: "field", children: [t('register.renavam'), _jsx("input", { inputMode: "numeric", maxLength: 11, value: form.renavam, onChange: (e) => set('renavam')(e.target.value) })] })] }), _jsxs("label", { className: "field", children: [t('register.proof'), _jsx("input", { type: "file", accept: "application/pdf,image/*", onChange: (e) => set('proofFileName')(e.target.files?.[0]?.name ?? '') }), _jsx("small", { children: form.proofFileName || t('register.proofHint') })] }), _jsx("p", { className: "muted small", children: t('register.simulated') }), _jsxs("div", { className: "actions", children: [_jsx("button", { className: "button button-primary", type: "submit", children: t('register.submit') }), _jsx("button", { type: "button", className: "button button-quiet", onClick: () => setForm(DEMO), children: t('register.demoFill') })] })] })] }));
}
function errorText(t, err, conflict) {
    return t(`error.${err}`, { id: conflict?.checkId ?? '', site: conflict?.site ?? '' });
}
