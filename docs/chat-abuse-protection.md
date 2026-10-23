# Public chat safeguards

Chat remains anonymous; no new login or CAPTCHA flow is required.

- Exact CORS origins: the two canonical domains (including www), exact workspace
  preview hosts, and localhost in development only. Foreign origins (including
  `null`) are rejected before routes. CORS is not authentication; scripts without
  an Origin still face all quotas.
- Shared PostgreSQL reservations: 10 attempts/minute and 200 attempts/24 hours
  globally; 5 attempts/10 minutes and 30 attempts/24 hours per socket peer.
  Windows begin at first use. Denied/failed requests are not refunded.
- Forwarding headers are deliberately not trusted. Behind a shared ingress,
  visitors may share a peer quota. Do not enable blanket Express `trust proxy`;
  only adopt client-IP attribution once the ingress strips/rebuilds the header
  and the trusted hop topology is verified. Global quotas remain necessary.
- The quota table is created lazily if absent and is also declared in the
  database schema. Database/DDL failure returns 503, never unmetered chat.
  Counters persist through restarts and are shared across autoscaled instances.
- At most two model calls per admission, 1,000 output tokens each, no SDK
  retries, 20-second timeout per call, bounded history/context/tool results.
  These limits bound usage, not a fixed dollar price; provider pricing can change.
  Configure a provider-side project budget as additional protection.
- Only plain user/assistant text turns are accepted. Caller data is never
  interpolated into the system role. The assistant is instructed to decline
  unrelated topics; this is not a guarantee against semantic prompt injection.
  Usage quotas, not model obedience, enforce the spending boundary.
- Email attempts are globally reserved once/hour before contacting Gmail.
  Failure does not refund the reservation; missing recipient skips sending.
- No OpenAI key means chat returns 503, as before. No credentials were added by
  this change. Read-only text endpoints remain available independently of chat.

Verification: API route tests mock OpenAI/Gmail to avoid charges and email.
The quota test uses a PostgreSQL temporary table when DATABASE_URL is available.
