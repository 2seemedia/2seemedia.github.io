-- Apply only after creating an isolated Cloudflare D1 database for operations.
CREATE TABLE IF NOT EXISTS scheduled_publications (
 id TEXT PRIMARY KEY,
 client_name TEXT NOT NULL,
 content_title TEXT NOT NULL,
 platform TEXT NOT NULL DEFAULT 'instagram',
 scheduled_at TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','published','cancelled')),
 published_at TEXT,
 verification_status TEXT NOT NULL DEFAULT 'not_checked' CHECK (verification_status IN ('not_checked','confirmed','not_found','unable_to_verify')),
 responsible_chat_id TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_scheduled_publications_due ON scheduled_publications(status,scheduled_at);
CREATE TABLE IF NOT EXISTS monitoring_alerts (
 id TEXT PRIMARY KEY,
 publication_id TEXT NOT NULL REFERENCES scheduled_publications(id),
 alert_type TEXT NOT NULL CHECK(alert_type IN ('before_15','after_5','after_15')),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sent','failed')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 sent_at TEXT,
 error TEXT,
 UNIQUE(publication_id,alert_type)
);
