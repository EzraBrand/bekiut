import type { RequestHandler } from "express";
import cors from "cors";

export function allowedOrigins(): Set<string> {
  const origins = new Set([
    "https://chavrutai.com", "https://www.chavrutai.com",
    "https://bekiut.com", "https://www.bekiut.com",
  ]);
  // Exact workspace hosts only, never a wildcard for all Replit previews.
  for (const host of (process.env.REPLIT_DOMAINS ?? "").split(",")) {
    if (/^[a-z0-9.-]+$/i.test(host.trim())) origins.add(`https://${host.trim()}`);
  }
  const devHost = process.env.REPLIT_DEV_DOMAIN;
  if (devHost && /^[a-z0-9.-]+$/i.test(devHost)) origins.add(`https://${devHost}`);
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:5000");
    origins.add("http://localhost:5173");
  }
  return origins;
}

// Reject disallowed origins before any route or side effect, not merely by
// omitting CORS response headers. No-Origin server clients still face quotas.
export const enforceApiOrigin: RequestHandler = (req, res, next) => {
  const origin = req.get("Origin");
  if (origin && !allowedOrigins().has(origin)) {
    res.status(403).json({ error: "Origin not allowed." });
    return;
  }
  next();
};

export const apiCors = cors({
  origin: (origin, callback) => callback(null, !!origin && allowedOrigins().has(origin)),
  methods: ["GET", "HEAD", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
