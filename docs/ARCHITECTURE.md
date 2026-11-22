# Architecture

Verify It is a single-page React app with no server of its own yet. Everything runs in the browser, and the parts that will later talk to a back-end sit behind small interfaces so they can be swapped without touching the screens.

```
src/
├── App.tsx            routing (hash URLs) and the seller/buyer role switch
├── i18n.tsx           all UI strings, in en, pt and de
├── pages/             one component per screen
├── components/        shared UI pieces (plate input, gallery, ...)
└── lib/
    ├── verify.ts      business rules: register, review, publish, check, report, sold
    ├── store.ts       where the state is kept (StateStore interface)
    ├── seed.ts        fictitious sample listings
    └── auth/          sign-up, sign-in and 2FA (AuthProvider interface)
```

## Business rules: `src/lib/verify.ts`

All the rules live here as plain functions that take the current `AppState` and return a new one (or an error). They import nothing from React, so they are easy to test (`verify.test.ts`) and can move to a back-end unchanged.

- `register` / `registerListings`: a seller registers a vehicle on one or more sites. A second active listing of the same vehicle on the same site is rejected.
- `reviewVehicle` and `publishListing`: a listing starts as `draft` and only goes `active` after the seller's account is approved and then the vehicle. The database enforces the same order with a trigger (see [`db/README.md`](../db/README.md)).
- `check`: the buyer's question. It returns `verified`, `scam`, `unverified` or `invalid`, with the reasons (link registered by the owner, same plate on another link of the same site, marked as sold, reported).
- `addReport` and `markSold` feed back into `check`.

## State: `src/lib/store.ts`

The screens read and change state through `useAppState()`, which takes a `StateStore`:

```ts
interface StateStore {
  load(): AppState
  save(state: AppState): void
  reset(): AppState
}
```

Today the only implementation is `localStore`, which keeps the state in `localStorage` and falls back to the sample data from `seed.ts`. To share data between devices, write another `StateStore` backed by an API and pass it to `useAppState`; the pages do not change.

## Accounts: `src/lib/auth/`

`types.ts` defines the `AuthProvider` contract (`signUp`, `signIn`, `verifyTwoFactor`, `signOut`, `currentAccount`). `index.ts` picks the implementation:

- **No `VITE_AUTH_ENDPOINT`** (the public demo): `mockAuth`, which keeps accounts in the browser.
- **With `VITE_AUTH_ENDPOINT`**: `remoteAuth`, which calls `POST {endpoint}/signup`, `/signin`, `/2fa/verify`, `/signout` and `/me` on the same origin with cookies.

See [`.env.example`](../.env.example) for the variable.

## Routing

`App.tsx` uses hash URLs so the site works on GitHub Pages without server rewrites:

- `#/check`, `#/market`, `#/how` for buyers; `#/register`, `#/activity`, `#/how` for sellers.
- `#/market/{checkId}`: a vehicle's page in the Verify It marketplace.
- `#/listing/{checkId}`: the demo copy of the listing on the external site.

## Database: `db/`

[`db/schema.sql`](../db/schema.sql) is the PostgreSQL schema for the future back-end. It mirrors the types in `verify.ts` and `auth/types.ts`, but nothing in the app connects to it yet.
