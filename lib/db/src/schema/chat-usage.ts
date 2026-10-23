import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

// Also bootstrapped lazily by the chat quota store, so a missing migration
// never opens an unmetered path during rollout.
export const chatUsageLimits = pgTable("chat_usage_limits", {
  key: text("key").primaryKey(),
  used: integer("used").notNull(),
  resetsAt: timestamp("resets_at", { withTimezone: true }).notNull(),
});
