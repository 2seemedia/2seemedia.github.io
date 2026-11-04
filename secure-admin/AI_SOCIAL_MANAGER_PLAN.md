# 2SEE AI Social Media Manager — Phase 1

Status: implementation plan, not deployed. Branch: feature/ai-social-manager-v1.

## Existing architecture verified
- secure-admin/ui/dashboard.html: authenticated admin UI with tab navigation.
- secure-admin/ui/dashboard.js: loads /api/content and /api/session; CMS drafts currently use localStorage.
- secure-admin/build.mjs: assembles authenticated dashboard assets.
- secure-admin/worker.js: authenticated Worker, GitHub content publishing.
- secure-admin/wrangler.toml: staging Worker, but GitHub publishing is enabled against main. Do not publish from staging without safeguards.

## First functional milestone
1. Add isolated "AI Social Media Manager" tab to the existing admin.
2. Client records: name, platform handle, brand voice, target audience, services, content constraints. No credentials.
3. Content planner: draft ideas, captions, scripts, statuses (draft, review, approved).
4. Initially use local-only demo data; label clearly as not shared or backed up. No real client data until durable storage and access controls are implemented.
5. Add authenticated API and Cloudflare D1 migrations before enabling multi-user persistence.
6. Add OpenAI API server-side only after secrets, spend limits, validation, and per-client isolation are in place.
7. Meta publishing and messaging are separate later phases, behind explicit approval and permissions.

## Security requirements
- Keep existing auth gate, CSRF protections and rate limits.
- No tokens in browser code, repository or localStorage.
- Strict client scoping on every API request; audit log for approvals and publishing.
- No automatic posting or replies in v1.
- Do not modify wrangler.toml deployment targets until a non-production isolated preview strategy is confirmed.
- Add tests for auth, client isolation, and non-publishing behavior before deployment.

## Acceptance criteria
- Existing CMS tabs and publish flow continue working.
- New section is visible only to authenticated admins.
- Clients and drafts are isolated from website CMS publishing.
- Nothing posts to Meta without a separate explicit approval.
