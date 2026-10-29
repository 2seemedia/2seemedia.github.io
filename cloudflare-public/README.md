# Public Cloudflare preview

This is separate from the authenticated admin Worker. Do not point the admin build at this configuration.

Create a new Workers Builds project connected to this repository and branch `perf/cloudflare-preview`:

- Root directory: `/`
- Build command: `node cloudflare-public/build.mjs`
- Deploy command: `npx wrangler deploy --config cloudflare-public/wrangler.toml`
- Worker name: `2see-public-preview`

No password, GitHub token or other secret is needed for the public static Worker. The build copies only public pages/assets and makes first-party media local to this host. Cloudflare's default static asset caching is retained so edits are revalidated rather than hidden behind long HTML/JavaScript cache lifetimes.

Keep GitHub Pages as the official site until the preview is tested and the owner approves the new public URL. Once approved, connect Builds to `main` after merging this PR so admin content commits trigger public deployment too. The existing admin Worker remains separate.

Verify mobile and desktop layouts, Arabic/English, navigation, images, work filters, video links, contact links, 404s and admin-route absence. Measure cold and warm mobile loads against GitHub Pages before claiming any speed improvement. No live performance score has been measured yet.

The owner selected `perf/cloudflare-preview` as this Worker's production branch on 2026-10-29. Trigger a fresh build from this branch; retrying an old main-branch build will still lack the preview build script.
