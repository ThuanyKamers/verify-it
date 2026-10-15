import type { AppState } from '../lib/verify'
import { siteTheme } from '../lib/mockListing'
import { ClassifiedPage } from './ClassifiedPage'
import { KleinanzeigenPage } from './KleinanzeigenPage'
import { MarketplacePage } from './MarketplacePage'

/** Abre a cópia do anúncio no estilo do site de origem: Facebook Marketplace, Kleinanzeigen ou classificados. */
export function ListingCopyPage({ state, checkId }: { state: AppState; checkId: string }) {
  const listing = state.listings.find((x) => x.checkId === checkId)
  if (listing && siteTheme(listing.site) === 'kleinanzeigen') return <KleinanzeigenPage key={checkId} state={state} listing={listing} />
  if (listing && siteTheme(listing.site) !== 'facebook') return <ClassifiedPage listing={listing} />
  return <MarketplacePage state={state} checkId={checkId} />
}
