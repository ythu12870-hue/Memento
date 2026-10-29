# Project Status

## Milestone 1 — Creator prototype and reference-inspired export

Implemented in the current source:
- Responsive four-step creator UI with five simple categories and 25 templates (five per category).
- Editable creator/recipient names, opening and closing text, and up to 12 customizable message cards.
- Up to 12 local image selections and one optional audio file (maximum 12 MB).
- Lavender, rose, and ice-blue theme presets; optional countdown.
- Standalone HTML download with opening scenes, optional countdown, audio-synchronized messages, final screen, and replay. Photo presentation uses a compact translucent message panel to keep photos visible. Templates use varied motion (slow zoom, letter-slide, float, focus, flying photo, Polaroid, bounce, dissolve, rise, sparkle, drop, blur, and more). The anniversary template accepts a date and displays elapsed days. The exported HTML omits the Skip countdown and Finish buttons while keeping the other playback/replay controls.
- Myanmar-friendly font fallbacks and reduced-motion CSS in the exported experience.
- Five categories contain five templates each. Every template has a dedicated `public/music/<template-id>/` folder with five named music slots; the creator can embed a chosen track in the exported HTML.
- Source-based analysis in `docs/reference-analysis.md`.

## Not implemented yet

- Accounts, secure server sessions, persistent drafts, and user dashboard data.
- Hosted publishing, shareable URLs, link revocation, and password protection.
- Database, object storage, background processing, and media optimization pipeline.
- Admin dashboard, role/permission enforcement, subscriptions, premium key lifecycle, audit logs, and moderation.
- Visual timeline editor with editable event timestamps.
- Automated unit, integration, end-to-end, browser, and security tests.

## Verification status

The source has been updated after inspecting `Love.html`. TypeScript/JSX transpilation syntax, generated HTML parsing, generated inline JavaScript syntax, absence of the two requested buttons, and presence of the remaining key controls were checked. A successful dependency installation/build and full browser-based test run have not yet been confirmed. Do not treat the prototype as production-ready until those checks are executed.


## October 2026 update — motion, message transitions, and admin prototype

- Added a subtle 3-second photo nudge to selected template motions; reduced-motion preferences disable it.
- Message cards now fade out together with their glass panel before the next message appears, then reveal with a short motion.
- Added an Admin section with overview counts, template visibility toggles, per-template music-label editing, site name, announcement banner, and an informational maintenance-style notice.
- Admin preferences persist in the current browser via localStorage. This is only a front-end prototype: there is no real login, server-side authorization, shared database, or cross-visitor configuration. Do not treat it as a secure production admin system.
- Full production administration still requires backend APIs, a database, authenticated admin roles, server-side validation, and deployment configuration.


## Public workspace navigation correction (2026-10-18)
- Removed Admin and Users navigation buttons from the ordinary creator workspace so visitors do not see management sections.
- Existing management UI code is still a local prototype, not a secured admin application. Before launch, move management screens behind a separate admin route and enforce server-side authentication/authorization; hiding navigation alone is not security.


## V6 changes
- Added English/Burmese interface toggle; preference persists in the current browser. Some secondary copy and template descriptions still require full translation review.
- Added site-wide light/dark appearance toggle with persisted preference and dark styles across main panels/forms/modals.
- Removed the sidebar profile/avatar circle and its starter-workspace card.
- Added baseline security response headers and client-side media type/size checks. These are not a complete security defense; see `SECURITY_ROADMAP.md`.
- Admin area remains a prototype and must not be considered protected or production-ready.
- Validation performed for this package: source syntax and ZIP integrity should be checked; full production build/browser test not claimed unless run successfully.

## Hosted sharing integration update (2026-10-24)

Added the first implementation of hosted sharing against Supabase: server-side share creation, scrypt-hashed optional passwords, expiry and revocation, private signed media uploads/reads, a recipient password gate, QR display, and a migration SQL file. The original standalone HTML export path remains separate. The QR preview currently uses QR Server, which receives the public share URL.

Validation completed: TypeScript/TSX syntax transpilation passed for all app and library source files. A full Next.js production build/typecheck could not be completed in this environment because dependency installation timed out and `node_modules` remained incomplete. Before production deployment, install dependencies, run `npm ci`, run `npx tsc --noEmit` and `npm run build`, then test with real Supabase environment variables and bucket settings.


## Hosted sharing migration update (2026-10-26)

- Replaced Supabase REST/database and Storage calls in the share API with Netlify Blobs key-value storage and media objects.
- Added media-serving route, random opaque media keys, MIME allowlist, 5 MB upload limit, password hashing, expiration checks, and revoke-token verification.
- Corrected the Get HTML button handler so it calls `downloadHtml()` rather than passing a function reference.
- Updated `.env.example` and README for Netlify Dev and Netlify deployment; Supabase credentials are no longer required by this code.
- **Validation limitation:** package installation timed out in this environment, so a full TypeScript check and production build could not be completed here. Before relying on this ZIP, run `npm install`, `npm run build`, then `npm run dev:netlify` and test HTML download, publish, recipient open/password gate, media playback, expiration, and revocation.
