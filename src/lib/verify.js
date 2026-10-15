// Regras de negócio do Verify It, sem dependência de interface ou de
// armazenamento, para poderem ser testadas e reaproveitadas num back-end.
//
// Fluxo (ver docs/fluxo.png):
//   Vendedor: cadastra o link + dados do veículo + comprovante -> verificação -> ID único
//   Comprador: cola o link que está vendo -> verificado / possível golpe / não verificado
import { parseListingUrl } from './url';
import { clean, isValidPlate, isValidRenavam, isValidVin, normalizeRenavam } from './validation';
const ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function newCheckId(random = Math.random) {
    let id = '';
    for (let i = 0; i < 6; i++)
        id += ID_ALPHABET[Math.floor(random() * ID_ALPHABET.length)];
    return `VI-${id}`;
}
function sameVehicle(a, b) {
    return a.plate === b.plate || a.vin === b.vin || a.renavam === b.renavam;
}
export function register(state, input, now = new Date(), makeId = newCheckId) {
    const errors = [];
    const parsed = parseListingUrl(input.url);
    if (!parsed)
        errors.push('invalidUrl');
    if (!isValidPlate(input.plate))
        errors.push('invalidPlate');
    if (!isValidVin(input.vin))
        errors.push('invalidVin');
    if (!isValidRenavam(input.renavam))
        errors.push('invalidRenavam');
    if (!input.make.trim() || !input.model.trim())
        errors.push('missingVehicle');
    const year = Number(input.year);
    if (!Number.isInteger(year) || year < 1950 || year > now.getFullYear() + 1)
        errors.push('invalidYear');
    if (!input.proofFileName.trim())
        errors.push('missingProof');
    if (errors.length || !parsed)
        return { ok: false, errors };
    const vehicle = { plate: clean(input.plate), vin: clean(input.vin), renavam: normalizeRenavam(input.renavam) };
    const active = state.listings.filter((l) => l.status === 'active');
    const sameUrl = active.find((l) => l.key === parsed.key);
    if (sameUrl)
        return { ok: false, errors: ['urlAlreadyRegistered'], conflict: sameUrl };
    // Mesmo veículo em outro link do MESMO site: é o padrão do golpe de anúncio clonado.
    // Em sites diferentes (OLX, Facebook, Webmotors...) é normal o dono anunciar em vários.
    const duplicate = active.find((l) => l.site === parsed.site && sameVehicle(l, vehicle));
    if (duplicate)
        return { ok: false, errors: ['duplicateOnSite'], conflict: duplicate };
    // Placa, chassi e RENAVAM precisam bater com o que já foi verificado para esse veículo.
    const mismatch = active.find((l) => sameVehicle(l, vehicle) && (l.plate !== vehicle.plate || l.vin !== vehicle.vin || l.renavam !== vehicle.renavam));
    if (mismatch)
        return { ok: false, errors: ['dataMismatch'], conflict: mismatch };
    const listing = {
        checkId: makeId(),
        url: input.url.trim(),
        key: parsed.key,
        site: parsed.site,
        ...vehicle,
        make: input.make.trim(),
        model: input.model.trim(),
        year,
        proofFileName: input.proofFileName.trim(),
        createdAt: now.toISOString(),
        status: 'active',
    };
    const otherSites = active.filter((l) => sameVehicle(l, vehicle));
    return { ok: true, listing, otherSites };
}
export function check(state, input) {
    const parsed = parseListingUrl(input.url);
    if (!parsed)
        return { status: 'invalid', reasons: [], related: [], reportCount: 0 };
    const reportCount = state.reports.filter((r) => r.key === parsed.key).length;
    const active = state.listings.filter((l) => l.status === 'active');
    const listing = state.listings.find((l) => l.key === parsed.key);
    if (listing?.status === 'active') {
        const related = active.filter((l) => l.checkId !== listing.checkId && sameVehicle(l, listing));
        return { status: 'verified', reasons: ['registered'], listing, related, reportCount };
    }
    const reasons = [];
    let related = [];
    if (listing?.status === 'sold')
        reasons.push('sold');
    const plate = input.plate && isValidPlate(input.plate) ? clean(input.plate) : undefined;
    if (plate) {
        related = active.filter((l) => l.plate === plate);
        if (related.some((l) => l.site === parsed.site))
            reasons.push('plateOnOtherUrl');
        else if (related.length)
            reasons.push('knownOnOtherSites');
    }
    if (reportCount > 0)
        reasons.push('reported');
    const isScam = reasons.some((r) => r === 'sold' || r === 'plateOnOtherUrl' || r === 'reported');
    if (!reasons.length)
        reasons.push('notFound');
    return { status: isScam ? 'scam' : 'unverified', reasons, listing, related, reportCount };
}
export function addReport(state, url, now = new Date()) {
    const parsed = parseListingUrl(url);
    if (!parsed)
        return null;
    const report = { key: parsed.key, site: parsed.site, url: url.trim(), createdAt: now.toISOString() };
    return { ...state, reports: [...state.reports, report] };
}
export function markSold(state, checkId) {
    return {
        ...state,
        listings: state.listings.map((l) => (l.checkId === checkId ? { ...l, status: 'sold' } : l)),
    };
}
export function appendLog(state, entry, now = new Date()) {
    const log = { id: `${now.getTime()}-${state.log.length}`, at: now.toISOString(), ...entry };
    return { ...state, log: [log, ...state.log].slice(0, 200) };
}
