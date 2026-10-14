// Upload / restore the Bekiut demo's Git-ignored media (audio, captures, MP4)
// to App Storage via the Replit sidecar. No npm dependencies (Node 18+ fetch).
//   node artifacts/bekiut-demo/restore-media.mjs restore  -> download missing/changed files (sha256-verified)
//   node artifacts/bekiut-demo/restore-media.mjs upload   -> push local files, rewrite media-manifest.json
// Requires PRIVATE_OBJECT_DIR (/<bucket>/<dir>). Restore exits non-zero if storage
// is unreachable or any checksum mismatches, so setup fails loudly.
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.join(ROOT, 'media-manifest.json');
const SIDE = 'http://127.0.0.1:1106';
const GCS = 'https://storage.googleapis.com';
const LOCAL_DIRS = ['public/audio', 'public/images', 'exports'];

const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex');

async function token() {
  const c = await (await fetch(`${SIDE}/credential`, { signal: AbortSignal.timeout(5000) })).json();
  const r = await fetch(`${SIDE}/token`, {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      audience: 'replit',
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      subject_token: c.access_token,
      subject_token_type: 'access_token',
    }),
  });
  if (!r.ok) throw new Error(`token exchange ${r.status}`);
  return (await r.json()).access_token;
}

function target() {
  const dir = process.env.PRIVATE_OBJECT_DIR;
  if (!dir) throw new Error('PRIVATE_OBJECT_DIR not set');
  const [, bucket, ...rest] = dir.split('/');
  return { bucket, prefix: [...rest.filter(Boolean), 'bekiut-demo'].join('/') };
}

async function restore() {
  const { files } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const todo = files.filter((e) => {
    const p = path.join(ROOT, e.path);
    return !(fs.existsSync(p) && sha(p) === e.sha256);
  });
  if (!todo.length) return console.log(`bekiut-demo media: all ${files.length} files present`);
  const { bucket } = target();
  const auth = { authorization: `Bearer ${await token()}` };
  let failed = 0;
  await Promise.all(
    todo.map(async (e) => {
      const r = await fetch(`${GCS}/storage/v1/b/${bucket}/o/${encodeURIComponent(e.object)}?alt=media`, { headers: auth });
      const buf = Buffer.from(await r.arrayBuffer());
      const ok = r.ok && createHash('sha256').update(buf).digest('hex') === e.sha256;
      if (!ok) { failed++; return console.error(`bekiut-demo media: FAILED ${e.path} (${r.status})`); }
      const dest = path.join(ROOT, e.path);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, buf);
    }),
  );
  console.log(`bekiut-demo media: restored ${todo.length - failed}/${todo.length}, skipped ${files.length - todo.length}`);
  if (failed) process.exitCode = 1;
}

async function upload() {
  const { bucket, prefix } = target();
  const auth = { authorization: `Bearer ${await token()}` };
  const entries = [];
  for (const d of LOCAL_DIRS) {
    const abs = path.join(ROOT, d);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs).sort()) {
      const rel = `${d}/${f}`;
      const object = `${prefix}/${rel}`;
      const body = fs.readFileSync(path.join(ROOT, rel));
      const r = await fetch(`${GCS}/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(object)}`, {
        method: 'POST', headers: { ...auth, 'content-type': 'application/octet-stream' }, body,
      });
      if (!r.ok) throw new Error(`upload ${rel} ${r.status}`);
      entries.push({ path: rel, object, bytes: body.length, sha256: createHash('sha256').update(body).digest('hex') });
      console.log('uploaded', rel);
    }
  }
  fs.writeFileSync(MANIFEST, JSON.stringify({ objectPrefix: prefix, note: 'bucket from PRIVATE_OBJECT_DIR', files: entries }, null, 2) + '\n');
}

const mode = process.argv[2];
if (mode === 'restore') {
  await restore().catch((e) => {
    console.error(`bekiut-demo media: restore FAILED (${e.message})`);
    process.exitCode = 1;
  });
} else if (mode === 'upload') {
  await upload();
} else {
  console.log('usage: node restore-media.mjs restore|upload');
}
