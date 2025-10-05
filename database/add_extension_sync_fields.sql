-- 为 users 表添加扩展同步相关字段
-- 这些字段用于跟踪用户数据在网站和插件之间的同步状态

-- 1. 添加 last_synced_at 字段（最后同步时间）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- 2. 添加 sync_source 字段（同步来源：'web' 或 'extension'）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS sync_source TEXT CHECK (sync_source IN ('web', 'extension'));

-- 3. 确保 google_id 字段存在且唯一
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id TEXT;

-- 添加唯一约束（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_google_id_unique'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_google_id_unique UNIQUE (google_id);
  END IF;
END $$;

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_last_synced_at ON users(last_synced_at);

-- 5. 添加注释
COMMENT ON COLUMN users.last_synced_at IS '最后一次数据同步的时间戳';
COMMENT ON COLUMN users.sync_source IS '最后一次数据更新的来源（web 或 extension）';
COMMENT ON COLUMN users.google_id IS 'Google OAuth 用户 ID，用于跨平台身份识别';

-- 6. （可选）创建 extension_sessions 表用于跟踪插件会话
CREATE TABLE IF NOT EXISTS extension_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  access_token_hash TEXT NOT NULL, -- 存储 token 的哈希值，不存储原始 token
  refresh_token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  
  -- 索引
  CONSTRAINT extension_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 为 extension_sessions 创建索引
CREATE INDEX IF NOT EXISTS idx_extension_sessions_user_id ON extension_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_extension_sessions_expires_at ON extension_sessions(expires_at);

-- 添加注释
COMMENT ON TABLE extension_sessions IS 'Chrome 插件的会话记录表';
COMMENT ON COLUMN extension_sessions.access_token_hash IS 'Access token 的哈希值（安全存储）';
COMMENT ON COLUMN extension_sessions.last_used_at IS '会话最后使用时间';

-- 7. 创建清理过期会话的函数
CREATE OR REPLACE FUNCTION cleanup_expired_extension_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM extension_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 8. 创建自动更新 last_synced_at 的触发器函数
CREATE OR REPLACE FUNCTION update_last_synced_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_synced_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 为 users 表添加触发器（当 sync_source 更新时自动更新 last_synced_at）
DROP TRIGGER IF EXISTS trigger_update_last_synced_at ON users;
CREATE TRIGGER trigger_update_last_synced_at
  BEFORE UPDATE OF sync_source ON users
  FOR EACH ROW
  WHEN (OLD.sync_source IS DISTINCT FROM NEW.sync_source)
  EXECUTE FUNCTION update_last_synced_at();

-- 完成
SELECT 'Extension sync fields added successfully!' AS status;
