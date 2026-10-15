import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { CarArt } from '../components/CarArt';
import { useI18n } from '../i18n';
import { mockDetails } from '../lib/mockListing';
import { maskPlate } from '../lib/validation';
import '../marketplace.css';
const VIEWS = ['side', 'front', 'rear', 'cabin'];
function listedWhen(iso, locale, now) {
    const minutes = Math.round((new Date(iso).getTime() - new Date(now).getTime()) / 60000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    if (Math.abs(minutes) < 2)
        return '';
    if (Math.abs(minutes) < 60)
        return rtf.format(minutes, 'minute');
    if (Math.abs(minutes) < 1440)
        return rtf.format(Math.round(minutes / 60), 'hour');
    return rtf.format(Math.round(minutes / 1440), 'day');
}
/** Cópia fictícia de um anúncio de marketplace, montada com os dados cadastrados no Verify It. */
export function MarketplacePage({ state, checkId }) {
    const { t, locale } = useI18n();
    const [index, setIndex] = useState(0);
    const l = state.listings.find((x) => x.checkId === checkId);
    if (!l) {
        return (_jsx("div", { className: "mp", children: _jsxs("div", { className: "mp-empty", children: [_jsx("p", { children: t('mp.notFound') }), _jsx("a", { href: "#", children: t('mp.back') })] }) }));
    }
    const d = mockDetails(l);
    const car = `${l.year} ${l.make} ${l.model}`;
    const price = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(d.price);
    const km = new Intl.NumberFormat(locale).format(d.km);
    const when = listedWhen(l.createdAt, locale, new Date().toISOString()) || t('mp.now');
    const sky = l.plate.charCodeAt(0) % 4;
    const val = (key) => t(key);
    const go = (step) => setIndex((i) => (i + step + VIEWS.length) % VIEWS.length);
    return (_jsxs("div", { className: "mp", children: [_jsxs("div", { className: "mp-demo", children: [_jsx("span", { children: t('mp.demo') }), _jsx("a", { href: "#", children: t('mp.back') })] }), _jsxs("header", { className: "mp-top", children: [_jsx("span", { className: "mp-logo", "aria-hidden": "true" }), _jsx("strong", { children: t('mp.brand') }), _jsx("span", { className: "mp-crumb", children: car })] }), _jsxs("div", { className: "mp-layout", children: [_jsxs("section", { className: "mp-gallery", "aria-label": car, children: [_jsxs("div", { className: "mp-stage", children: [_jsx(CarArt, { view: VIEWS[index], body: d.bodyColor, sky: sky }), _jsx("button", { type: "button", className: "mp-arrow mp-prev", onClick: () => go(-1), "aria-label": t('mp.prev'), children: "\u2039" }), _jsx("button", { type: "button", className: "mp-arrow mp-next", onClick: () => go(1), "aria-label": t('mp.next'), children: "\u203A" }), _jsx("span", { className: "mp-counter", children: t('mp.photo', { n: index + 1, total: VIEWS.length }) })] }), _jsx("div", { className: "mp-thumbs", children: VIEWS.map((v, i) => (_jsx("button", { type: "button", className: i === index ? 'on' : '', onClick: () => setIndex(i), "aria-label": t('mp.photo', { n: i + 1, total: VIEWS.length }), "aria-current": i === index, children: _jsx(CarArt, { view: v, body: d.bodyColor, sky: sky }) }, v))) }), _jsx("p", { className: "mp-note", children: t('mp.photoNote') })] }), _jsxs("aside", { className: "mp-info", children: [_jsx("h1", { children: car }), _jsx("p", { className: "mp-price", children: price }), _jsx("p", { className: "mp-meta", children: t('mp.listed', { when, city: d.city }) }), _jsxs("div", { className: "mp-actions", children: [_jsx("button", { type: "button", className: "mp-btn mp-btn-primary", children: t('mp.message') }), _jsx("button", { type: "button", className: "mp-btn", children: t('mp.save') }), _jsx("button", { type: "button", className: "mp-btn", children: t('mp.share') })] }), _jsx("h2", { children: t('mp.about') }), _jsxs("ul", { className: "mp-facts", children: [_jsx("li", { children: t('mp.driven', { km }) }), _jsx("li", { children: t('mp.transmission', { value: val(d.transmission) }) }), _jsx("li", { children: t('mp.exteriorColor', { value: val(d.exterior) }) }), _jsx("li", { children: t('mp.interiorColor', { value: val(d.interior) }) }), _jsx("li", { children: t('mp.fuelType', { value: val(d.fuel) }) }), _jsx("li", { children: t('mp.plateLine', { plate: maskPlate(l.plate) }) })] }), _jsx("h3", { children: t('mp.commonFeatures') }), _jsx("ul", { className: "mp-features", children: d.features.map((f) => _jsx("li", { children: val(f) }, f)) }), _jsx("h2", { children: t('mp.sellerDescription') }), _jsx("p", { className: "mp-desc", children: val(d.description) }), _jsx("div", { className: "mp-map", "aria-hidden": "true", children: _jsxs("svg", { viewBox: "0 0 400 150", preserveAspectRatio: "xMidYMid slice", children: [_jsx("rect", { width: "400", height: "150", fill: "#e8ecdf" }), _jsx("path", { d: "M0 110 Q120 70 220 100 T400 60 V150 H0Z", fill: "#bcd7e6" }), _jsxs("g", { stroke: "#fff", strokeWidth: "7", fill: "none", children: [_jsx("path", { d: "M-10 40 L160 70 L420 20" }), _jsx("path", { d: "M120 -10 L170 160" }), _jsx("path", { d: "M260 -10 L300 160" })] }), _jsx("g", { stroke: "#d6dac9", strokeWidth: "2", fill: "none", children: _jsx("path", { d: "M0 90 H400 M60 0 V150 M340 0 V150" }) }), _jsx("path", { d: "M200 38a14 14 0 0 1 14 14c0 11-14 28-14 28s-14-17-14-28a14 14 0 0 1 14-14z", fill: "#d93a2f" }), _jsx("circle", { cx: "200", cy: "52", r: "5", fill: "#fff" })] }) }), _jsxs("p", { className: "mp-meta", children: [d.city, " \u00B7 ", t('mp.mapNote')] }), _jsx("h2", { children: t('mp.sellerInfo') }), _jsxs("div", { className: "mp-seller", children: [_jsx("span", { className: "mp-avatar", "aria-hidden": "true", children: d.seller.charAt(0) }), _jsxs("div", { children: [_jsx("strong", { children: d.seller }), _jsx("span", { children: t('mp.memberSince', { year: d.memberSince }) })] })] })] })] })] }));
}
