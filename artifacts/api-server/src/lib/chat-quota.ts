import { createHash } from "node:crypto";

interface QuotaClient {
  query(text: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

// Rows are reused per key; peer keys are only created after global admission.
// PostgreSQL's atomic upsert serializes contenders across all server instances.
export async function takeQuota(
  client: QuotaClient, key: string, limit: number, seconds: number,
): Promise<boolean> {
  const result = await client.query(`
    INSERT INTO chat_usage_limits (key, used, resets_at)
    VALUES ($1, 1, clock_timestamp() + $3 * interval '1 second')
    ON CONFLICT (key) DO UPDATE SET
      used = CASE WHEN chat_usage_limits.resets_at <= clock_timestamp()
        THEN 1 ELSE chat_usage_limits.used + 1 END,
      resets_at = CASE WHEN chat_usage_limits.resets_at <= clock_timestamp()
        THEN clock_timestamp() + $3 * interval '1 second' ELSE chat_usage_limits.resets_at END
    WHERE chat_usage_limits.resets_at <= clock_timestamp() OR chat_usage_limits.used < $2
    RETURNING used`, [key, limit, seconds]);
  return result.rows.length === 1;
}

let ready: Promise<QuotaClient> | undefined;
async function quotaClient(): Promise<QuotaClient> {
  if (!ready) {
    ready = (async () => {
      const { pool } = await import("@workspace/db");
      await pool.query(`CREATE TABLE IF NOT EXISTS chat_usage_limits (
        key text PRIMARY KEY, used integer NOT NULL, resets_at timestamptz NOT NULL
      )`);
      return pool;
    })().catch(error => { ready = undefined; throw error; });
  }
  return ready;
}

export async function admitChat(peer: string): Promise<boolean> {
  const client = await quotaClient();
  // Charge attempts, including failed upstream calls; never refund reservations.
  if (!await takeQuota(client, "global:minute", 10, 60)) return false;
  if (!await takeQuota(client, "global:day", 200, 86400)) return false;
  await client.query("DELETE FROM chat_usage_limits WHERE resets_at < clock_timestamp() - interval '1 day'");
  const id = createHash("sha256").update(peer).digest("hex");
  return await takeQuota(client, `peer:burst:${id}`, 5, 600) &&
    await takeQuota(client, `peer:day:${id}`, 30, 86400);
}

export async function admitChatAlert(): Promise<boolean> {
  return takeQuota(await quotaClient(), "alert:hour", 1, 3600);
}
