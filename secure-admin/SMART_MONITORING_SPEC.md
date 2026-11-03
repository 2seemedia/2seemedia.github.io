# 2SEE Smart Monitoring — implementation specification

Status: specification only, not deployed.

## Objective
Monitor every scheduled client post, confirm publication via supported Meta APIs where authorized, and alert responsible staff on missing or unverified publication.

## Data model (planned)
- clients: id, name, timezone, responsible_user_id
- content_items: id, client_id, platform, type, scheduled_at_utc, status, caption, media_reference, expected_meta_media_id, published_url, published_at_utc
- publication_checks: id, content_item_id, checked_at, result (confirmed | not_found | unable_to_verify), evidence, provider_error
- alerts: id, content_item_id, severity, due_at, sent_at, acknowledged_at, resolved_at, channel, dedup_key
- user_notification_preferences: user_id, channels, reminder_minutes, escalation_minutes
- audit_events: actor, action, timestamp, content_item_id, details

## Rules
1. Schedule pre-publication reminder 15 minutes before due time.
2. At due time, run confirmation through authorized Meta Graph API. A local status alone is not sufficient evidence.
3. At +5 minutes, retry. Missing item != proven unpublished; use 'not confirmed' if uncertain.
4. At +15 minutes, notify owner again and optionally escalate.
5. Stop duplicate notifications on confirmed publication or acknowledged, rescheduled item.
6. Respect client time zones, daylight saving time, API rate limits, token expiry, and transient failures.
7. Never publish automatically in this phase. No public client-facing alerts by default.
8. Avoid misleading confirmations: only set confirmed when media ID/permalink and account match; match manually posted items cautiously.
9. Send notification via durable queue/outbox; never rely on an open browser tab.
10. Access controls: all client and notification reads must be authenticated and authorized. Keep Meta tokens server-side encrypted/secret-managed.

## Engineering phases
- A: durable D1 schema, staff roles, schedule timestamp fields, notification center UI.
- B: Cloudflare Cron Triggers, retries, durable alert outbox, internal email/Telegram optional.
- C: Meta OAuth and scoped media read, confirmation matching, error states and audit trail.
- D: integration tests, staging deploy, then production approval.

## Acceptance tests
- On-time confirmed post => no overdue alert.
- Missing/unverified post => 5 minute alert; 15 minute escalation if unresolved.
- Provider outage => unable_to_verify, not falsely 'unpublished'.
- Reschedule => old reminder canceled.
- Duplicate cron invocations => one alert per dedup key.
- Token expiry => reauthorization notice.
- Cross-client access denied.
- User can see all due today and outstanding alerts from mobile.
