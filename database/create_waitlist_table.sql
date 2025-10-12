-- 创建 waitlist 表
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  source TEXT DEFAULT 'landing_page',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);

-- 启用 RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许任何人插入
CREATE POLICY "Allow public insert" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- RLS 策略：只允许认证用户查询（管理员）
CREATE POLICY "Allow authenticated select" ON waitlist
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 添加注释
COMMENT ON TABLE waitlist IS 'Waitlist submissions from landing page';
COMMENT ON COLUMN waitlist.email IS 'User email address';
COMMENT ON COLUMN waitlist.status IS 'Approval status: pending, approved, rejected';
COMMENT ON COLUMN waitlist.source IS 'Where the submission came from';

