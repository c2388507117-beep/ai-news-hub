-- Family Tree cloud sync tables
-- Apply with: wrangler d1 execute ai-news-hub-db --file=migrations/0003_family_trees.sql --remote

-- Families table
CREATE TABLE IF NOT EXISTS family_trees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  root_id TEXT DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Persons table (JSON serialized for simplicity, keyed by family)
CREATE TABLE IF NOT EXISTS family_persons (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  data TEXT NOT NULL,  -- JSON: { name, gender, spouses[], children[], parentId }
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (family_id) REFERENCES family_trees(id)
);

CREATE INDEX IF NOT EXISTS idx_family_persons_family ON family_persons(family_id);

-- Sync tokens (simple password per family for shared access)
CREATE TABLE IF NOT EXISTS family_sync_tokens (
  family_id TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (family_id) REFERENCES family_trees(id)
);

-- Full state snapshots (for one-shot save/load)
CREATE TABLE IF NOT EXISTS family_snapshots (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  state_json TEXT NOT NULL,
  saved_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (family_id) REFERENCES family_trees(id)
);

CREATE INDEX IF NOT EXISTS idx_family_snapshots_family ON family_snapshots(family_id);
