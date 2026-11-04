# 2SEE Operations — independent Worker

This is a separate operations application, not a website CMS deployment. It retains the existing standalone Cron/Telegram handler and OPERATIONS_DB binding. No primary website routes, production branch, website secrets, or CMS publishing code is used.

## Build

From secure-admin:

    node build-standalone-operations.mjs /absolute/path/operations-bundle.mjs
    node --test tests/standalone-operations.test.js tests/standalone-operations-ui.test.js

Deploy the generated single ESM bundle only to 2see-monitoring-dev. Keep the existing D1 binding (2see-operations-dev), Cron every minute and Telegram secrets. The build embeds the three operations-ui assets; it does not build or modify the main website.

## Activation

The owner must set a **new encrypted secret** named OPERATIONS_ADMIN_PASSWORD (24–256 characters) on this independent Worker. Do not reuse or copy website credentials. Credential entry is performed by the owner in Cloudflare; do not send it in a chat or commit it. Username: 2see. APIs fail closed while the secret is missing. Changing the password invalidates existing sessions.

The login route initializes four new tables (ops_records, ops_audit, ops_login_limits and an index) without altering the existing monitoring tables. The application requires the existing 0001_monitoring.sql schema. Sessions are HMAC-signed, origin bound, expire in four hours, and use an HttpOnly/Secure/SameSite cookie. Login attempts are rate-limited in D1. Mutations require same-origin plus a custom header.

## Features

- Shared client records, brand voice, audience, services and content constraints.
- Contract periods, quantities for reels/posts/stories, fees, currencies and contract links.
- Content ideas, captions, scripts, file links, owner, approval states and schedule.
- Task requirements, owner, due date, content relation and completion state.
- Payments linked to same-client contracts; matching currency; void without deletion.
- Per-contract delivery progress, outstanding balances, monthly reports and CSV/print export.
- Last 100 delivery results and last 100 audit records.
- Optimistic version checks and atomic D1 mutation batches.
- Scheduling creates monitoring records. Rescheduling cancels the old publication identity and creates a new one. Marking content manually published cancels overdue monitoring without claiming Meta verification.

## Honest limits

- Single shared team account, not per-person roles or customer logins.
- File references are HTTPS links; binary uploads/storage are not enabled.
- No OpenAI generation, Meta OAuth, automatic publishing or platform verification.
- The existing standalone monitoring code has no delivery retry outbox for Telegram outages, and selects a maximum of 250 due publications per run. Failed alerts are recorded, not automatically retried.
- No pagination yet for operations records; suitable for an initial small team deployment. Alert and audit views show the latest 100 entries.
- Contract quotas represent the explicitly entered period; add a new contract/period when renewing rather than silently resetting delivery counts.

## Validation

Eight focused server/UI tests cover auth, rate limiting, CSRF, client ownership, invalid values, stale updates, shared persistence, schedule cancellation/reschedule, manual publication semantics, form flows, client filters, and Cron Telegram deduplication. A broader existing suite includes a pre-existing telegram-monitor test expecting cumulative reminder windows; that file is not part of this independent application's deployed code and is not changed here.
