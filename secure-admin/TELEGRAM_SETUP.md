# Telegram monitoring setup (NOT DEPLOYED)

Bot: @See2MediaAlertsBot. Never store token or chat ID in Git.

## Isolation and activation
1. Create a **separate** Cloudflare D1 database for operations staging. Run `wrangler d1 migrations apply <DB_NAME> --remote` only against that new database.
2. Bind D1 as `OPERATIONS_DB` using its real database_id in the intended isolated Worker configuration.
3. Store `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ALERT_CHAT_ID` as encrypted Cloudflare Worker secrets (not plaintext vars).
4. Add `[triggers]\ncrons = ["* * * * *"]` to the isolated Worker's Wrangler config. Cron uses UTC. Do not attach this trigger to existing production/staging without review.
5. Set `MONITORING_ENABLED = "true"` only after integration testing. Default is off.
6. Obtain chat ID securely: user starts bot; an authenticated setup endpoint or local one-off script can read Telegram getUpdates. Do not paste tokens in chat or source code.
7. Insert test publication into D1 using UTC ISO timestamps and verify 15-minute reminder, 5-minute follow-up, 15-minute escalation and no duplicates.
8. Roll back by setting MONITORING_ENABLED=false; keep records.

## Current limitations
- Scheduling source is the new D1 table, NOT the localStorage prototype.
- Meta publication verification is not connected yet. Status is 'not confirmed', never definitive 'not published'.
- The current worker cron handler is opt-in and requires bindings; existing deployment config was intentionally not changed.
- Alert delivery retry and production-grade observability need additional work before enabling for real clients.
