# 2SEE design preview

Preview-only homepage redesign inspired by the reviewed UPT House interaction patterns, using original 2SEE assets and brand colours.

Based on main e46856b7cfe55c8ac07112402b9edb9daa7aa9c4. Official main remains unchanged. The preview contains the current supporting pages and forms; the new art direction is implemented on the homepage. No client names, results or testimonials have been invented.

Deployment: node cloudflare-public/build.mjs then npx wrangler deploy --config cloudflare-public/wrangler.toml. Both Worker config files in this branch target the preview Worker only. Do not merge deployment configs or noindex settings into main.

Includes AR/EN, responsive top navigation, portrait gallery with drag/buttons and portrait modal, existing customer logos, six sticky service cards (static on mobile/reduced motion), founder portraits, FAQ 3+9, and quote CTA.
