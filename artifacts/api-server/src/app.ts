import express, { type Express } from "express";
import { apiCors, enforceApiOrigin } from "./lib/api-origin";
import pinoHttp from "pino-http";
import healthRouter from "./routes/health";
import { logger } from "./lib/logger";
import { requestTelemetry } from "./lib/request-telemetry";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    autoLogging: false,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(requestTelemetry);
app.use(enforceApiOrigin);
app.use(apiCors);
// Character-bounded chat can exceed the default 100 KB in UTF-8.
// Keep a finite transport limit; chat-input still enforces model/spending limits.
app.use("/api/chat", express.json({ limit: "256kb" }));
app.use(express.json());
app.use(((err, _req, res, next) => {
  if (err?.type === "entity.too.large") {
    res.status(413).json({ error: "This request is too large. Please select a shorter passage or shorten your message." });
    return;
  }
  next(err);
}) as express.ErrorRequestHandler);
app.use(express.urlencoded({ extended: true }));

// Health check route (scaffold default)
app.use("/api", healthRouter);

// NOTE: registerRoutes(app) is called in index.ts — it mounts all legacy routes
// directly on the app (with their own /api/ and other prefixes built in).

export default app;
