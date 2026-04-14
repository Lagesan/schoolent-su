CREATE TABLE IF NOT EXISTS content_store (
  id TEXT PRIMARY KEY,
  content_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
