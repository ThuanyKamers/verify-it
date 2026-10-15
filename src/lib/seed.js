// Dados de demonstração carregados no primeiro acesso.
// Todos os anúncios, placas e documentos são fictícios.
import { renavamCheckDigit } from './validation';
function renavam(base) {
    return base + renavamCheckDigit(base);
}
const civic = { plate: 'RIO2A18', vin: '93HFC2650KZ100001', renavam: renavam('0123456789'), make: 'Honda', model: 'Civic EXL', year: 2019 };
const corolla = { plate: 'BRA2E19', vin: '9BRBL3HE0M0123456', renavam: renavam('1122334455'), make: 'Toyota', model: 'Corolla XEi', year: 2021 };
const gol = { plate: 'ABC1234', vin: '9BWAA05U0FP012345', renavam: renavam('0987654321'), make: 'Volkswagen', model: 'Gol 1.0', year: 2015 };
function listing(checkId, url, key, site, vehicle, createdAt, status = 'active') {
    return { checkId, url, key, site, ...vehicle, proofFileName: 'crlv-e.pdf', createdAt, status };
}
export const DEMO_URLS = {
    verified: 'https://www.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios/honda-civic-exl-2019-1234567890',
    cloned: 'https://www.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios/civic-exl-2019-baixo-km-9998887776',
    clonedPlate: 'RIO2A18',
    unknown: 'https://www.webmotors.com.br/comprar/fiat/argo/1-0/4-portas/2022/55512345',
};
export function seedState() {
    return {
        listings: [
            listing('VI-7K3P9Q', DEMO_URLS.verified, 'olx.com.br/autos-e-pecas/carros-vans-e-utilitarios/honda-civic-exl-2019-1234567890', 'olx.com.br', civic, '2026-10-01T14:20:00.000Z'),
            listing('VI-H4M2XA', 'https://www.facebook.com/marketplace/item/1029384756', 'facebook.com/marketplace/item/1029384756', 'facebook.com', civic, '2026-10-02T09:05:00.000Z'),
            listing('VI-R8TW3E', 'https://www.webmotors.com.br/comprar/toyota/corolla/2-0-xei/4-portas/2021/48812345', 'webmotors.com.br/comprar/toyota/corolla/2-0-xei/4-portas/2021/48812345', 'webmotors.com.br', corolla, '2026-10-05T18:40:00.000Z'),
            listing('VI-N6CZ5B', 'https://carro.mercadolivre.com.br/MLB-3456789012-volkswagen-gol-10-2015', 'carro.mercadolivre.com.br/MLB-3456789012-volkswagen-gol-10-2015', 'carro.mercadolivre.com.br', gol, '2026-09-20T11:00:00.000Z', 'sold'),
        ],
        reports: [
            { key: 'olx.com.br/autos-e-pecas/carros-vans-e-utilitarios/civic-exl-2019-baixo-km-9998887776', site: 'olx.com.br', url: DEMO_URLS.cloned, createdAt: '2026-10-10T20:15:00.000Z' },
            { key: 'olx.com.br/autos-e-pecas/carros-vans-e-utilitarios/civic-exl-2019-baixo-km-9998887776', site: 'olx.com.br', url: DEMO_URLS.cloned, createdAt: '2026-10-12T08:30:00.000Z' },
        ],
        log: [],
    };
}
