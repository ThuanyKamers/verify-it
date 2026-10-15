# Verify It

Prototype of a platform that helps used-vehicle buyers find out whether an online listing is genuine before they negotiate.

**Live site:** https://thuanykamers.github.io/verify-it/

## The problem

Vehicle-listing scams caused R$ 2.7 billion in losses to 91,000 victims (Veja Negócios). In the Startup Weekend survey, 80% of respondents had already faced a scam attempt and 100% would use a verification platform. The most common scam is the cloned listing: the scammer copies photos and details from a real listing and posts them again, on the same site, with a different contact.

## How it works

On opening the site, the person goes through a simulated login and picks **I'm a seller** or **I'm a buyer**. Each role sees only the screens it uses.

1. **The owner registers the listing.** They enter the link, plate, VIN and RENAVAM, and upload proof of ownership (CRLV-e). They can register one listing per site (OLX, Facebook, Webmotors...).
2. **The platform verifies.** It checks the documents and rejects a second listing of the same vehicle on the same site.
3. **The buyer pastes the link** of the listing they are looking at and gets one of these answers:
   - ✅ **Verified:** it is the link registered by the owner.
   - 🚨 **Possible scam:** the vehicle has a verified listing on another link of the same site, the owner marked it as sold, or the link was reported.
   - ❔ **Unverified:** there is no record; if the vehicle is verified on another site, we show the official link.

The full flow is in [docs/fluxo.png](docs/fluxo.png).

For Facebook listings, the "Go to the original listing" button opens a demo copy of a marketplace page built from the registered data (with illustrations instead of photos).

## Languages

English (default), Portuguese and German, with a switch at the top of the page. The strings live in [`src/i18n.tsx`](src/i18n.tsx); TypeScript reports an error if a translation is missing.

## Prototype limitations

- Ownership verification is **simulated**: we only check the plate and VIN format and the RENAVAM check digit. A real lookup requires integration with DETRAN/SENATRAN.
- Data stays **in the browser** (localStorage), with fictitious sample listings. For a seller and a buyer on different devices, replace `localStore` in [`src/lib/store.ts`](src/lib/store.ts) with an online database (e.g. Supabase).

## Development

```bash
npm install
npm run dev      # local server
npm test         # verification logic tests
npm run build    # production build in dist/
```

The business rules live in [`src/lib/verify.ts`](src/lib/verify.ts), separate from the UI, so they can be reused in a back-end.

### Deployment

Every push to `main` publishes the site to GitHub Pages through the [`deploy.yml`](.github/workflows/deploy.yml) workflow. The first time, enable **Settings → Pages → Source: GitHub Actions**.
