// Normalização de links de anúncios, para que o mesmo anúncio colado de
// formas diferentes (com www, com parâmetros de rastreamento, com barra
// no final) seja reconhecido como o mesmo.
const TRACKING_PARAMS = /^(utm_|fbclid$|gclid$|ref$|src$|source$|mibextid$|share)/i;
export function parseListingUrl(input) {
    let raw = input.trim();
    if (!raw)
        return null;
    if (!/^https?:\/\//i.test(raw))
        raw = `https://${raw}`;
    let url;
    try {
        url = new URL(raw);
    }
    catch {
        return null;
    }
    if (!url.hostname.includes('.'))
        return null;
    const site = url.hostname.toLowerCase().replace(/^(www|m|mobile|web)\./, '');
    const params = [...url.searchParams.entries()]
        .filter(([name]) => !TRACKING_PARAMS.test(name))
        .sort(([a], [b]) => a.localeCompare(b));
    const query = params.length ? `?${new URLSearchParams(params).toString()}` : '';
    const path = url.pathname.replace(/\/+$/, '') || '/';
    return { key: `${site}${path}${query}`, site };
}
