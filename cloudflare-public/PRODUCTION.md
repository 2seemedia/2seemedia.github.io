# Cloudflare production hosting

Connect this repository to Workers Builds with production branch `main`.

- Root directory: repository root
- Build command: `node cloudflare-public/build.mjs`
- Deploy command: `npx wrangler deploy --config cloudflare-public/wrangler.production.toml`
- Worker name: `2see-media-site`

The private admin continues to publish content to `main`; the Cloudflare build then deploys that commit. Keep `2see-admin-staging` and its secrets private and unchanged.

Validate all pages, Arabic/English, media, robots.txt, sitemap.xml and missing-page responses on the workers.dev hostname before attaching a purchased domain. Canonicals remain on the existing official GitHub Pages domain until the domain cutover. At cutover update canonical/hreflang/JSON-LD/runtime URLs and sitemap, configure old-domain redirects and verify Search Console.

No custom domain or DNS is enabled by these configuration files. The separate preview Worker configuration is retained.
