---
name: Anonymous chat abuse boundary
description: Why chat quotas are shared and forwarding headers are not trusted.
---

Keep anonymous chat limits shared across instances and persistent across restarts.
Fail closed if the quota store is unavailable; never substitute process-local
limits for the spending boundary.

**Why:** Public chat incurs third-party costs on an autoscaling deployment.
Per-process counters reset on restart and multiply with instances. No verified
ingress header-rewriting contract was available when hardening this surface.

**How to apply:** Preserve the global ceiling even if client attribution improves.
Socket-peer limits intentionally group visitors behind a proxy. Only switch to
forwarded client IPs after verifying the trusted ingress topology and stripping
attacker-supplied headers. CORS and topic instructions do not authenticate callers
or enforce spending limits.

Long reader passages may be sent as explicitly disclosed opening excerpts;
do not silently imply that chat sees the entire selected range.

**Why:** Full Sugya Viewer ranges exceeded both HTTP body and model-context
limits. Raising only the body limit would still fail context validation.

**How to apply:** Keep the excerpt notice visible and tell the model when its
context is partial; preserve the independent history, context, and quota limits.

Use the explicitly configured Replit OpenRouter integration for chat, without
falling back to legacy OpenAI credentials.

**Why:** The legacy configuration reached a credit-exhausted provider despite
no saved OpenAI key being visible; the user approved switching to the existing
OpenRouter integration. A live chat response confirmed it worked.

**How to apply:** Preserve explicit integration routing when changing models or
refactoring chat. Missing integration configuration should fail clearly rather
than silently changing the billing provider.

Keep SDK UI history separate from validated model-facing text history.

**Why:** Provider-specific response fields previously caused second-turn
validation failures. The AI SDK migration intentionally keeps tool results
server-generated and strips client-side tool metadata at the request boundary.

**How to apply:** Exercise actual SDK message streams and a second turn in
regression tests; retain strict admission and text validation rather than
accepting arbitrary client tool results to accommodate a framework.
