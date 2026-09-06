-- TEMIN 360 PostgreSQL Database Schema Init
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(64) PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  scope VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dosyalar (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  data JSONB,
  total NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sync_logs (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(100),
  action VARCHAR(50),
  records_count INT DEFAULT 0,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default initial settings & API Key
INSERT INTO settings (key, value) 
VALUES ('kurum_adi', 'Ankara İl Sağlık Müdürlüğü'), ('db_version', '1.0.0-web.1')
ON CONFLICT (key) DO NOTHING;

INSERT INTO api_keys (id, key, name, scope)
VALUES ('key-default-01', 'dta_live_8e4a90f1b2c3d4e59071f', 'Masaüstü İstemci (Varsayılan)', 'admin')
ON CONFLICT (key) DO NOTHING;
