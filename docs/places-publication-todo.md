# Places map: before publication

- [ ] Restrict the MapTiler browser key's **Allowed HTTP Origins** to the verified live hostname, its www variant if used, and the exact development preview hostname. Leave **Allowed user-agent header** blank for browsers. Do not use `*.replit.dev` or `?`.
- [ ] Verify allowed origins in the actual browser preview and published site; never copy a key into chat or source code.
- [ ] Ensure `MAPTILER_API_KEY` is available during the production build. The build intentionally exposes this browser key, not other secrets. Domain restrictions, quotas and monitoring—not hiding the key—protect browser usage.
- [ ] Confirm the MapTiler account's commercial eligibility and quota; this integration does not change the subscription or enable paid overages.
- [ ] Complete editorial review of disputed ancient-place identifications before removing noindex or adding navigation.

The user explicitly deferred origin restrictions while development proceeds. Nothing here authorizes publication.
