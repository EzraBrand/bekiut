# Archived projects

The demo video, research guide and design sandbox were archived at the owner's request on
October 24, 2026. Sources stay in their existing locations so relative paths and
media manifests remain usable; this is an in-place archive, not deletion.

## Preserved locations

- `artifacts/bekiut-demo/`: editable video, script, media manifest, restoration
  script, and any local media. App Storage media was not deleted.
- `artifacts/research-guide-preview/`: guide preview application.
- `jewish-research-guide/`: standalone guide source and supporting research.
  Also archived locally, with automatic push-triggered Pages publication removed
  from its local workflow. The existing remote GitHub Pages website is unchanged;
  local archiving does not unpublish it.
- `artifacts/mockup-sandbox/`: favicon options and social-image experiments,
  plus the shared preview scaffold. Existing canvas data is retained locally,
  but live sandbox previews are inactive until restored.

The three registered artifacts have “Archived” titles and empty service lists.
They no longer start workflows, build for publishing, or serve their former
`/bekiut-demo/`, `/research-guide/` and `/__mockup` paths after the next publish
(the sandbox had no production service to begin with).
They are excluded from the pnpm workspace and published package.
The post-merge script no longer automatically restores demo media.

## Restoring

1. Remove their exclusions from `pnpm-workspace.yaml` and `.replitignore`.
   For the guide, also remove the `jewish-research-guide` publishing exclusion.
2. Restore their service definitions from the pre-archive checkpoint using the
   validated artifact configuration workflow; remove “Archived” from the titles.
3. Run `pnpm install` to update workspace links and the lockfile.
4. For the video, run `node artifacts/bekiut-demo/restore-media.mjs restore`
   to recover any missing media from App Storage.
5. Restart the restored artifact services and verify them before publishing.

Do not remove stored media merely because the source is archived.
