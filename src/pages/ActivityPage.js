import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useI18n } from '../i18n';
import { listingHref } from '../lib/mockListing';
import { maskPlate } from '../lib/validation';
import { appendLog, markSold } from '../lib/verify';
export function ActivityPage({ state, update, reset }) {
    const { t, locale } = useI18n();
    const listings = [...state.listings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    function sold(checkId, site) {
        update((s) => appendLog(markSold(s, checkId), { type: 'sold', site, result: checkId }));
    }
    function resultText(entry) {
        if (entry.type === 'check')
            return t(`status.${entry.result}`);
        if (entry.type === 'rejected')
            return t(`error.${entry.result.split(', ')[0]}`, { id: '', site: entry.site });
        if (entry.type === 'report')
            return t('log.report');
        return entry.result;
    }
    return (_jsxs("section", { className: "page", children: [_jsx("h1", { children: t('activity.title') }), _jsx("p", { className: "muted", children: t('activity.localNote') }), _jsx("h2", { className: "section-title", children: t('activity.listings') }), _jsx("div", { className: "table-wrap", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: t('result.checkId') }), _jsx("th", { children: t('result.vehicle') }), _jsx("th", { children: t('result.plate') }), _jsx("th", { children: t('result.site') }), _jsx("th", { children: t('log.result') }), _jsx("th", {})] }) }), _jsx("tbody", { children: listings.map((l) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("code", { children: l.checkId }) }), _jsxs("td", { children: [l.make, " ", l.model, " ", l.year] }), _jsx("td", { children: maskPlate(l.plate) }), _jsx("td", { children: _jsx("a", { href: listingHref(l), target: "_blank", rel: "noopener noreferrer", children: l.site }) }), _jsx("td", { children: _jsx("span", { className: `badge ${l.status}`, children: t(`activity.status.${l.status}`) }) }), _jsx("td", { children: l.status === 'active' && (_jsx("button", { type: "button", className: "text-button", onClick: () => sold(l.checkId, l.site), children: t('activity.markSold') })) })] }, l.checkId))) })] }) }), _jsx("h2", { className: "section-title", children: t('activity.log') }), state.log.length === 0 ? (_jsx("p", { className: "muted", children: t('activity.empty') })) : (_jsx("div", { className: "table-wrap", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: t('log.when') }), _jsx("th", { children: t('log.type') }), _jsx("th", { children: t('log.site') }), _jsx("th", { children: t('log.result') })] }) }), _jsx("tbody", { children: state.log.map((entry) => (_jsxs("tr", { children: [_jsx("td", { children: new Date(entry.at).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' }) }), _jsx("td", { children: t(`log.${entry.type}`) }), _jsx("td", { children: entry.site }), _jsx("td", { children: resultText(entry) })] }, entry.id))) })] }) })), _jsx("button", { type: "button", className: "button button-quiet reset", onClick: () => {
                    if (window.confirm(t('activity.resetConfirm')))
                        reset();
                }, children: t('activity.reset') })] }));
}
