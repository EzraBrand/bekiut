import { describe, expect, it } from "vitest";
import { takeQuota } from "./chat-quota";

// Uses a session-local temporary table: no application quotas/data are changed.
describe.skipIf(!process.env.DATABASE_URL)("PostgreSQL quota atomicity", () => {
  it("caps reservations, expires windows, and persists across calls", async () => {
    const { pool } = await import("@workspace/db");
    const client = await pool.connect();
    try {
      await client.query("CREATE TEMP TABLE chat_usage_limits (key text PRIMARY KEY, used integer NOT NULL, resets_at timestamptz NOT NULL)");
      const results = [];
      for (let i = 0; i < 30; i++) results.push(await takeQuota(client, "test", 5, 600));
      expect(results.filter(Boolean)).toHaveLength(5);
      expect(await takeQuota(client, "test", 5, 600)).toBe(false);
      await client.query("UPDATE chat_usage_limits SET resets_at = clock_timestamp() - interval '1 second'");
      expect(await takeQuota(client, "test", 5, 600)).toBe(true);
      const result = await client.query("SELECT used FROM chat_usage_limits WHERE key = 'test'");
      expect(result.rows[0].used).toBe(1);
    } finally {
      await client.query("DROP TABLE IF EXISTS pg_temp.chat_usage_limits");
      client.release();
    }
  }, 30000);
});
