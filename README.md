# Verify It

Prototype of a platform that helps used-vehicle buyers find out whether an online listing is genuine before they negotiate.

**Live site:** https://thuanykamers.github.io/verify-it/

## Who it's for

- **Buyers** of used cars and motorcycles on classifieds sites (Kleinanzeigen, mobile.de, OLX, Facebook Marketplace...), who want to know whether the listing in front of them is the owner's real one or a clone.
- **Private sellers and dealers**, who register their listing once and get a link buyers can trust.

Today it is a working prototype with fictitious sample data, published as a static demo.

## Built with

- **React 19** and **TypeScript**, bundled with **Vite**
- **Vitest** for the verification-logic tests
- **GSAP** and **Lenis** for animation and smooth scrolling
- **PostgreSQL** schema for the future back-end ([`db/`](db/))
- **GitHub Actions** for CI (tests and build) and deployment to **GitHub Pages**

## Background

Verify It started at the Techstars Startup Weekend Cyber Security São José 2025, where the team built the first MVP (then called **verifiCAR**) and won 3rd place.

## The problem

Vehicle-listing scams caused R$ 2.7 billion in losses to 91,000 victims (Veja Negócios). In the Startup Weekend survey, 80% of respondents had already faced a scam attempt and 100% would use a verification platform. The most common scam is the cloned listing: the scammer copies photos and details from a real listing and posts them again, on the same site, with a different contact.

## How it works

On opening the site, the person goes through a simulated login and picks **I'm a seller** or **I'm a buyer**. Each role sees only the screens it uses.

1. **The owner registers the listing.** They enter the link, plate, VIN and RENAVAM, and upload proof of ownership (CRLV-e). They can register one listing per site (Kleinanzeigen, Facebook, mobile.de...).
2. **The platform verifies.** It checks the documents and rejects a second listing of the same vehicle on the same site.
3. **The buyer pastes the link** of the listing they are looking at and gets one of these answers:
   - ✅ **Verified:** it is the link registered by the owner.
   - 🚨 **Possible scam:** the vehicle has a verified listing on another link of the same site, the owner marked it as sold, or the link was reported.
   - ❔ **Unverified:** there is no record; if the vehicle is verified on another site, we show the official link.

The full flow is in [docs/fluxo.png](docs/fluxo.png).

## Marketplace and listing pages

Verify It has its own marketplace of cars and motorcycles registered by their owners, with search by make or model, type (car or motorcycle), city with a radius in km, and sorting by date or price. Each vehicle has its own listing page inside Verify It (`#/market/{checkId}`), with photos, details and links to the same vehicle on every site where it is verified. **Contact the owner** opens a message pop-up.

Each registered link opens a demo copy of the original listing page, without login. Kleinanzeigen, mobile.de, AutoScout24, leboncoin and Facebook Marketplace are rebuilt in each site's current layout (desktop and mobile); OLX, Standvirtual, Webmotors and Mercado Livre use a generic classifieds layout. The demo copies are built from the registered data, with real photos of the sample vehicles, or drawn illustrations when no photo matches.

## Vehicle photos

The sample cars and motorcycles use free-licence photos from Wikimedia Commons, stored in `public/vehicles/` so the site never hotlinks. Each photo, its author and its licence are listed in `src/lib/photos.ts`, and the credits are shown next to the photo and in the marketplace footer. Vehicles without a matching photo fall back to the drawn illustration.

## Languages

English (default), Portuguese and German, with a switch at the top of the page. The strings live in [`src/i18n.tsx`](src/i18n.tsx); TypeScript reports an error if a translation is missing.

## Prototype limitations

- Ownership verification is **simulated**: we only check the plate and VIN format and the RENAVAM check digit. A real lookup requires integration with DETRAN/SENATRAN.
- Data stays **in the browser** (localStorage), with fictitious sample listings. For a seller and a buyer on different devices, replace `localStore` in [`src/lib/store.ts`](src/lib/store.ts) with an online database (e.g. Supabase).

## Running it locally

Requirements: **Node.js 22** and npm.

```bash
git clone https://github.com/thuanykamers/verify-it.git
cd verify-it
npm install
npm run dev      # local server at http://localhost:5173/verify-it/
npm test         # verification logic tests
npm run build    # production build in dist/
```

No configuration is needed: without environment variables the app uses a local mock for login and 2FA and keeps data in the browser. To point it at a back-end, copy [`.env.example`](.env.example) to `.env.local` and fill in `VITE_AUTH_ENDPOINT`. `.env` files are ignored by git; never commit real keys.

The business rules live in [`src/lib/verify.ts`](src/lib/verify.ts), separate from the UI, so they can be reused in a back-end.

## Deployment

Every push to `main` publishes the site to GitHub Pages through the [`deploy.yml`](.github/workflows/deploy.yml) workflow. The first time, enable **Settings → Pages → Source: GitHub Actions**.

## Roadmap

The planned work is in [ROADMAP.md](ROADMAP.md).
