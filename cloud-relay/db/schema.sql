-- CloudTab Database Schema

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(6) UNIQUE NOT NULL,
  customer_name VARCHAR(255),
  file_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, expired
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 minutes'),
  completed_at TIMESTAMP,
  shopkeeper_id VARCHAR(100)
);

-- Files Table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(6) REFERENCES sessions(session_id) ON DELETE CASCADE,
  original_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT,
  s3_key VARCHAR(500) UNIQUE NOT NULL,
  encrypted BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Shopkeepers Table (for tracking connections)
CREATE TABLE IF NOT EXISTS shopkeepers (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255),
  api_key VARCHAR(255) UNIQUE NOT NULL,
  last_connected TIMESTAMP,
  status VARCHAR(20) DEFAULT 'offline', -- online, offline
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_files_session_id ON files(session_id);
CREATE INDEX IF NOT EXISTS idx_files_s3_key ON files(s3_key);

-- Auto-delete expired sessions (run this periodically with a cron job)
CREATE OR REPLACE FUNCTION delete_expired_sessions() RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW() AND status != 'completed';
END;
$$ LANGUAGE plpgsql;
