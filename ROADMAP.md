# Roadmap

Verify It is a working prototype: the full seller and buyer flows run in the browser with fictitious sample data. This is the work planned next, roughly in order. Every step keeps using made-up sample data; nothing here involves collecting real people's documents.

## 1. Back-end for the demo (shared data across devices)

- [ ] Small API (serverless functions) in front of the Postgres schema in [`db/schema.sql`](db/schema.sql).
- [ ] Replace `localStore` in [`src/lib/store.ts`](src/lib/store.ts) with an API-backed store behind the same interface, so a seller and a buyer on different devices see the same listings.
- [ ] Seed script that loads the sample listings from [`src/lib/seed.ts`](src/lib/seed.ts) into the database.
- [ ] Implement the auth routes that [`src/lib/auth/remoteAuth.ts`](src/lib/auth/remoteAuth.ts) already expects, switched on by `VITE_AUTH_ENDPOINT` (see [`.env.example`](.env.example)).

## 2. Verification rules

- [ ] Separate reviewer role: today the seller's own activity page simulates the approvals; move them to a reviewer screen.
- [ ] Expire reports after a time window and let the owner contest a report.
- [ ] Detect the same photos reused on a different link (perceptual hash of the sample photos).
- [ ] More plate formats per country in `PlateInput` (Italy, Spain, Netherlands).

## 3. Quality

- [ ] Component tests for the check result screens (verified, possible scam, unverified).
- [ ] End-to-end test of the seller → approval → buyer check flow with Playwright.
- [ ] Accessibility pass on the marketplace filters and the message pop-up (keyboard and screen reader).
- [ ] Split the large page components (`MarketplacePage`, `RegisterPage`) into smaller pieces.
- [ ] Move the inline strings that are still outside [`src/i18n.tsx`](src/i18n.tsx) into it.

## 4. Docs

- [ ] Architecture notes: where the business rules live and how the store and auth providers are swapped.
- [ ] Contributor guide (how to run, test and add a language).

## Not planned for now

- Real ownership lookups against vehicle registries (DETRAN/SENATRAN or EU equivalents) and storing real identity documents. That needs a legal entity, a privacy review and data-protection agreements, so it stays out of the prototype.
