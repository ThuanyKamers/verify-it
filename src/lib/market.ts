// O marketplace do Verify It tratado como "um site" a mais: um anúncio publicado
// aqui tem o mesmo formato dos anúncios de links externos, com URL e chave
// próprias. Mantido separado para ser usado tanto pelas regras (verify) quanto
// pela camada de apresentação (mockListing), sem import circular.

/** Domínio do marketplace do próprio Verify It (GitHub Pages). */
export const MARKET_SITE = 'thuanykamers.github.io'

/** Link público de um anúncio no marketplace do Verify It. */
export function marketUrl(checkId: string): string {
  return `https://${MARKET_SITE}/verify-it/#/market/${checkId}`
}
