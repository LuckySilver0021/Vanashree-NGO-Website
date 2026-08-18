🔴 Security
1. Seller phone numbers (PII) exposed publicly — HIGH
- lib/donations.server.ts:166 — seller: { select: { id: true, fullName: true, phone: true } }
- app/donation/[id]/page.tsx:36 — same; the phone is serialized into the public page HTML
- Both /api/donations and /api/donations/[id] GET are unauthenticated. The UI hides WhatsApp behind sign-in, but the phone itself is in every public API response and in page HTML. Fix: don't select phone for anonymous callers; only include it for the owner (or an authenticated non-owner server-side when contact is allowed).


2. Marker deletion authorization flaw — HIGH — app/api/markers/route.ts:197
if (marker.userId && marker.userId !== user?.id) return 403
Markers with userId: null (POST writes user?.id ?? null when the account lookup fails, line 97) can be deleted by any authenticated user. The comment says "or if user is admin" but no admin check exists anywhere. Fix: deny unless marker.userId === user?.id; add a real admin role (e.g. role field + authOptions check) if admins are needed.


3. No email verification + public enumeration — MEDIUM
- app/api/user/check/route.ts — unauthenticated, unthrottled; anyone can enumerate which emails are registered (and the login page surfaces it).
- Signup (app/api/auth/signup/route.ts) creates accounts with zero verification — anyone can squat another person's email, then use that identity on the marketplace. For a community marketplace, at minimum add email verification; otherwise impersonation is trivial.


4. No rate limiting / brute-force protection — MEDIUM
- Login, signup, email-check, marker/timeline/favorite/listing POSTs are all unthrottled.
- The contact limiter (app/api/contact/route.ts:51) is a per-instance in-memory Map — useless on serverless (each warm instance has its own map) and trusts x-forwarded-for, which callers can spoof when not behind a trusted proxy. hCaptcha verification is commented out (line 138), so the form is honeypot-only.


5. No security headers / middleware — MEDIUM — no middleware.ts and next.config.ts sets no headers(): no CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy. The map tiles and user content make CSP worthwhile.


6. Server-side validation gaps — LOW/MEDIUM
- app/api/user/details/route.ts PUT: name has no max length, age accepts any number incl. negative/NaN (typeof age === 'number'), location unbounded → oversized/untrusted rows.
- Signup password has no max (bcrypt silently truncates at 72 bytes).


7. Session cookie secure flag — .env sets NEXTAUTH_URL=http://localhost:3000 (fine locally), but confirm prod NEXTAUTH_URL is https on Vercel — otherwise the JWT cookie ships without Secure.


8. Misc — MapsClient.tsx:39 logs the Mapbox token on every prod load (public key, but unnecessary); app/api/markers/route.ts:73 logs upload metadata; no dangerouslySetInnerHTML found — React-escaped rendering throughout, good.


🟠 Scalability
1. TimelineEntry has no index on markerId (confirmed in migrations/20260708132758...sql) — every timeline GET does a full scan. Add @@index([markerId, date(sort: Desc)]). MapMarker.userId also unindexed (querying markers-by-user will scan).


2. Unbounded reads — GET /api/markers returns every marker ever; GET /api/timeline returns all entries per marker. Add pagination/caps.


3. Client-side catalog caps at 500 (CATALOG_LIMIT, donations.server.ts:117) — once listings exceed 500, the marketplace's client-side filtering silently filters an incomplete set. Budget for server-side filtering/pagination once you cross that.


4. popular sort aggregates favourites._count per request — fine now; denormalize a counter when it grows.


5. Everything is force-dynamic — public read endpoints (markers, marketplace) could be cached/ISR'd for real gains.


🟡 Robustness
1. Favourite toggle race — app/api/donations/[id]/favorite/route.ts:35-48 does findUnique→create/delete; two rapid taps (or double-click) → P2002 unique violation → 500. Use upsert/deleteMany with idempotent semantics.


2. Stale-user writes succeed silently — marker POST (user?.id ?? null), timeline POST (createdById without user check → FK 500). Both should 401 if the account is gone, and marker POST shouldn't create an orphaned marker.


3. user/details PUT persists NaN ages.


4. No status transition rules on listings PATCH — a donated item can be flipped back to available.


5. Owner-only listing PATCH/DELETE checks are correct (good), and donations.server.ts zod schemas are solid — those are the strong parts.


Suggested priority order
1. Phone PII fix, marker-delete authorization
2. Favourite race → upsert
3. Rate limiting (login/signup/contact) + re-enable hCaptcha
4. Timeline markerId index + security headers
5. Server-side input caps (user details, password max)