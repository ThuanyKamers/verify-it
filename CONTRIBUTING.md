# Contributing

Thanks for helping with Verify It. This guide covers how to run the project, how to check a change, and how to add a language.

## Run it

Requirements: **Node.js 22** and npm.

```bash
npm install
npm run dev      # http://localhost:5173/verify-it/
```

No configuration is needed. Without environment variables the app uses a local mock for login and 2FA and keeps its data in the browser (localStorage). See [`.env.example`](.env.example) if you want to point it at a back-end.

## Check a change

Run both before opening a pull request; CI runs the same two commands.

```bash
npm test         # Vitest: verification rules, validation, URLs, photos, auth mock, storage
npm run build    # type check (tsc) + production build
```

Where things live:

- **Business rules:** [`src/lib/verify.ts`](src/lib/verify.ts), kept apart from the UI. Add or change a rule here together with a test in `src/lib/verify.test.ts`.
- **Screens:** `src/pages/`. Shared pieces: `src/components/`.
- **Sample data:** [`src/lib/seed.ts`](src/lib/seed.ts). Use made-up names, plates and VINs only, never real people's data.
- **Database schema:** [`db/schema.sql`](db/schema.sql), not connected yet.

## Add a language

All strings live in [`src/i18n.tsx`](src/i18n.tsx).

1. Add the code to the `Lang` type, for example `'pt' | 'en' | 'de' | 'fr'`.
2. Add an entry to `LANGUAGES` with its label, HTML `lang` and locale.
3. Create a `const fr: Messages = { ... }` object. The Portuguese object `pt` is the reference: `Messages` requires every one of its keys, so TypeScript reports any missing translation.
4. Register it in `MESSAGES`.
5. Run `npm run build` to confirm nothing is missing.

## Pull requests

- One topic per pull request, with a short description of what changed and why.
- Never commit `.env` files, keys or tokens. `.gitignore` already excludes them.
- By contributing, you agree that your contribution is licensed under the project's [MIT License](LICENSE).
