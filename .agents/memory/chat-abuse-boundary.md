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
