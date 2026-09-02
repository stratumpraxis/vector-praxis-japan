CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  canonical_key TEXT NOT NULL UNIQUE,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  official_url TEXT NOT NULL,
  employer TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  remote_type TEXT CHECK (remote_type IN ('remote','hybrid','onsite','unknown')) DEFAULT 'unknown',
  japan_eligible INTEGER CHECK (japan_eligible IN (0,1)) DEFAULT 0,
  japan_eligibility_confidence REAL DEFAULT 0,
  japanese_required INTEGER CHECK (japanese_required IN (0,1)) DEFAULT 0,
  english_level TEXT,
  employment_type TEXT,
  compensation_min REAL,
  compensation_max REAL,
  compensation_currency TEXT,
  compensation_period TEXT,
  category TEXT,
  first_seen_at TEXT NOT NULL,
  last_verified_at TEXT NOT NULL,
  expires_at TEXT,
  source_status TEXT CHECK (source_status IN ('active','expired','blocked','unknown')) DEFAULT 'unknown',
  source_policy TEXT CHECK (source_policy IN ('official','api','rss','index_only','blocked')) NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(source_status, last_verified_at);
CREATE INDEX IF NOT EXISTS idx_jobs_japan ON jobs(japan_eligible, remote_type);
CREATE INDEX IF NOT EXISTS idx_jobs_language ON jobs(japanese_required, english_level);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_comp ON jobs(compensation_currency, compensation_min);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  access_method TEXT CHECK (access_method IN ('official','api','rss','index_only','blocked')) NOT NULL,
  terms_checked_at TEXT,
  robots_checked_at TEXT,
  active INTEGER CHECK (active IN (0,1)) DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ingest_runs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  discovered INTEGER DEFAULT 0,
  inserted INTEGER DEFAULT 0,
  updated INTEGER DEFAULT 0,
  expired INTEGER DEFAULT 0,
  rejected INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('running','success','partial','failed')) NOT NULL,
  error TEXT,
  FOREIGN KEY (source_id) REFERENCES sources(id)
);
