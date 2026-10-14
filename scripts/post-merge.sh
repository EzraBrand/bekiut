#!/bin/bash
set -e

# Kill stale dev-server processes left over from before the merge, so the
# restarted workflows don't crash with EADDRINUSE (recurring issue after
# task merges — see docs/reviews/PROJECT-REVIEW-2026-08.md).
pkill -f "node --enable-source-maps ./dist/index.mjs" 2>/dev/null || true
pkill -f "vite --config vite.config.ts" 2>/dev/null || true

# Task-agent merges can legitimately change package manifests without carrying
# the generated lockfile. Reconcile it here before running project setup.
pnpm install --no-frozen-lockfile
pnpm --filter db push

# Restore the Bekiut demo video's Git-ignored media (audio, captures, MP4)
# from App Storage. Skips files whose sha256 already matches; fails setup on any error.
node artifacts/bekiut-demo/restore-media.mjs restore
