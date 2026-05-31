-- Phase 3: Dynamic Backend — Initial Schema
-- Apply with: wrangler d1 execute ai-news-hub-db --file=migrations/0001_initial.sql
-- Remote:    wrangler d1 execute ai-news-hub-db --file=migrations/0001_initial.sql --remote

-- 1. 私人豆瓣收藏
CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('book','music','movie','tv')),
  title TEXT NOT NULL,
  creator TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  review TEXT DEFAULT '',
  status TEXT DEFAULT 'done' CHECK(status IN ('want','doing','done')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_collections_type ON collections(type);
CREATE INDEX IF NOT EXISTS idx_collections_created ON collections(created_at);

-- 2. 值班表
CREATE TABLE IF NOT EXISTS duty_roster (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  person TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_duty_date ON duty_roster(date);

-- 3. 地图自定义标记
CREATE TABLE IF NOT EXISTS map_markers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'default',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 4. 预制景点
CREATE TABLE IF NOT EXISTS attractions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  category TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_attractions_city ON attractions(city);

-- 5. 景点打卡记录
CREATE TABLE IF NOT EXISTS visit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attraction_id INTEGER NOT NULL,
  visited INTEGER DEFAULT 0,
  visited_at TEXT DEFAULT NULL,
  note TEXT DEFAULT '',
  FOREIGN KEY (attraction_id) REFERENCES attractions(id)
);

CREATE INDEX IF NOT EXISTS idx_visit_logs_attraction ON visit_logs(attraction_id);
