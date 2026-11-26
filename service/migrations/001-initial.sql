CREATE TABLE IF NOT EXISTS documents (
  name TEXT PRIMARY KEY,
  draft TEXT NOT NULL CHECK(json_valid(draft)),
  release TEXT CHECK(release IS NULL OR json_valid(release)),
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS performance_daily (
  day TEXT NOT NULL,
  route TEXT NOT NULL,
  samples INTEGER NOT NULL,
  total_ms INTEGER NOT NULL,
  PRIMARY KEY(day, route)
);
