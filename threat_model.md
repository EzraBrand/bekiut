# Threat Model

## Project Overview

ChavrutAI / Bekiut is a free, bilingual (Hebrew-English) Jewish-text study platform
(Talmud Bavli & Yerushalmi, Mishnah, Mishneh Torah, Tanakh, Jastrow/BDB dictionaries,
scholarship works). It is a pnpm monorepo with multiple artifacts:

- `artifacts/chavrutai` — React/Vite SPA plus a small Express SSR/meta server
  (`src/server/index.ts`) that handles domain canonicalization, legacy redirects,
  crawler SEO enhancement, and a sitemap proxy.
- `artifacts/api-server` — Express API (mounted under `/api`) that proxies Sefaria
  text/search, serves dictionary/SEO data, exposes an OpenAI-backed study chatbot,
  and generates sitemaps/structured data.
- `lib/*` — shared data/text-processing packages (`@workspace/*`).
- `artifacts/mockup-sandbox`, `artifacts/bekiut-demo`, `artifacts/research-guide-preview`
  — static/dev-only artifacts.

Deployed publicly (autoscale) at chavrutai.com / bekiut.com. There is **no user
authentication, no login, and no per-user database** — all content is public and
read-only. Data is sourced live from the Sefaria API and bundled JSON datasets.

## Assets

- **Third-party API budget / OpenAI spend** — the `/api/chat` endpoint calls OpenAI
  `gpt-4o`. Uncontrolled invocation translates directly into monetary cost and
  potential service degradation.
- **Google Mail connector (chatbot alerts)** — `CHATBOT_ALERT_EMAIL` inbox receives
  an email per chatbot query via the Replit Google Mail connector. Abuse = inbox
  flooding / reputation.
- **Application secrets** — `OPENAI_API_KEY`, Replit connector tokens
  (`REPL_IDENTITY` / `WEB_REPL_RENEWAL`), `CHATBOT_ALERT_EMAIL`,
  `VITE_MAPTILER_API_KEY`, `VITE_POSTHOG_API_KEY` (the VITE_* keys are
  intentionally public publishable client keys). All server secrets are read from
  `process.env` and must never reach the client bundle.
- **Site integrity / SEO** — crawler-only HTML enhancement and redirects; incorrect
  handling could allow soft-404s, open redirects, or HTML injection into crawler pages.

## Trust Boundaries

- **Browser → chavrutai web server → api-server (/api)** — all client requests are
  untrusted. The shared proxy forwards `/api/*` to the api-server; endpoints like
  `/api/chat`, `/api/search/text`, `/api/rss-feed` are publicly reachable with no auth.
- **api-server → Sefaria / ezrabrand.com / OpenAI / Google** — outbound calls to
  fixed external hosts. URLs are hardcoded (no user-controlled host → no SSRF today).
- **Server → Replit connector hostname** — connector token exchange for Gmail.
- **Public vs internal** — the SEO-enhance / sitemap proxy uses a fixed internal base
  URL and an `x-chavrutai-internal` header rather than inbound Host headers.

## Scan Anchors

- Production entry points: `artifacts/api-server/src/register-routes.ts` (route map),
  `artifacts/api-server/src/routes/*` (chat, search, feed, seo, sitemaps, text routes),
  `artifacts/chavrutai/src/server/index.ts` (SSR/meta/redirect/sitemap-proxy).
- Highest-risk code: `artifacts/api-server/src/routes/chat.ts` (unauthenticated OpenAI
  + Gmail side effect), `artifacts/api-server/src/app.ts` (CORS, body parsing),
  `artifacts/api-server/src/routes/seo.ts` (crawler HTML generation).
- Public surfaces: everything under `/api/*` and all SSR routes are public/unauthenticated.
  There is no admin surface and no authenticated surface.
- Dev-only / ignore unless proven reachable: `artifacts/mockup-sandbox`,
  `artifacts/bekiut-demo`, `artifacts/research-guide-preview`, `*.test.ts(x)`, `scripts/`.

## Threat Categories

### Denial of Service / Resource & Cost Abuse (primary risk)

`POST /api/chat` is unauthenticated, has no rate limiting, no per-IP quota, and no
CAPTCHA. Each call invokes OpenAI `gpt-4o` (billed) and, when a `context` is present,
sends an email via the Google Mail connector. An attacker can script unlimited
requests to exhaust the OpenAI budget, flood the alert inbox, and degrade availability.
The caller fully controls the `messages` array passed to OpenAI, effectively turning
the endpoint into a free, unrestricted LLM proxy. Guarantee required: apply server-side
rate limiting / abuse controls and bound the request to the intended Talmud-study use.

### Information Disclosure

Server secrets must stay server-side. OpenAI/connector secrets are only read from
`process.env` in the api-server and are not exposed to the client. `VITE_*` keys are
publishable client keys by design. Error responses return generic messages.

### Tampering / Open Redirect

Redirect logic (domain canonicalization, legacy path redirects) compares the Host
header against an explicit allowlist and builds targets from a fixed `PROD_BASE_URL`
and server-side canonical path maps — not from attacker-controlled hosts. The Semgrep
"tainted-redirect" hits in `chavrutai/src/server/index.ts` are false positives: targets
derive from allowlisted hosts / internal canonical maps, not raw user input.

### Spoofing

No authentication exists, so there is no session/token spoofing surface. Outbound
webhooks are not consumed; the Gmail path uses the Replit connector token.
