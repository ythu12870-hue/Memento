# Memento security roadmap

## Current protections added in this version

- Next.js response headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, a restrictive `Referrer-Policy`, limited `Permissions-Policy`, DNS prefetch control, and disabled `X-Powered-By` header.
- Client-side media selection checks MIME types, limits image selection to 12 files and 8 MB per image, and limits audio to 12 MB. These checks improve usability but are not a substitute for server-side validation once uploads are implemented.
- User-facing language/theme preferences are stored locally. No passwords or secrets should be stored in localStorage.
- Admin/Users navigation is not shown in the public creator interface. Existing management UI is still a prototype and is not protected authentication.

## Before public launch (required)

1. **Authentication:** implement a trusted authentication provider or server-managed sessions; secure, HttpOnly, SameSite cookies; CSRF protection where needed; login rate limiting; password reset and email verification; optional MFA for administrators.
2. **Authorization:** enforce role checks on every server route/action and database query. Never rely on hiding a button or checking a role only in client-side React. Deny access by default.
3. **Admin area:** create separate `/admin/login` and `/admin` routes, protect them on the server, and audit administrative actions. Seed the first admin securely; never ship default credentials.
4. **Validation:** validate every field on the server with allow-lists, length limits, schema validation, and parameterized database queries. Treat all client input as untrusted.
5. **Uploads:** validate actual file signatures, allowed formats, dimensions and size on the server; rename files; store outside executable/public paths where appropriate; scan uploads; apply quotas; prevent path traversal and decompression bombs.
6. **Publishing:** use unguessable identifiers, owner checks, access controls, expiration/revocation, abuse reporting, and rate limits. Avoid placing personal details in public links by default.
7. **Browser security:** introduce a tested Content Security Policy compatible with the final Next.js build; keep dependencies patched; review third-party scripts and external font usage.
8. **Data protection:** use least-privilege database accounts, encrypted transport, managed secrets/environment variables, backups and restore tests, retention/deletion policies, and privacy notice/consent where appropriate.
9. **Abuse prevention:** rate-limit expensive exports and API actions; add request size limits, monitoring, safe error messages, and security logging that excludes passwords, tokens, and private message contents.
10. **Verification:** run production build, dependency audit, authorization tests (including direct URL/API attempts), upload tests, accessibility checks, and a security review before deployment.

## Honest scope statement

This project is a client-side prototype, not a hardened production service. Response headers and client-side validation are baseline improvements, not a guarantee against hackers. Server-side authentication, database-backed authorization, upload handling, publishing controls, and a complete security test suite remain future work.
