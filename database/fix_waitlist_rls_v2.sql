-- Waitlist RLS 深度修复脚本 v2
-- 此脚本完全清理并重新配置 waitlist 表的 RLS 策略

-- 第一步：删除所有现有策略（包括可能存在的所有变体）
DROP POLICY IF EXISTS "Allow public insert" ON waitlist;
DROP POLICY IF EXISTS "Allow authenticated select" ON waitlist;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON waitlist;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON waitlist;
DROP POLICY IF EXISTS "Enable insert for all users" ON waitlist;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON waitlist;

-- 第二步：临时禁用 RLS（清理环境）
ALTER TABLE waitlist DISABLE ROW LEVEL SECURITY;

-- 第三步：授予表级权限
GRANT INSERT ON waitlist TO anon;
GRANT INSERT ON waitlist TO authenticated;
GRANT SELECT ON waitlist TO authenticated;

-- 第四步：重新启用 RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- 第五步：创建简化的策略（不使用 TO 子句）
CREATE POLICY "Enable insert for all users" ON waitlist
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users" ON waitlist
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 完成提示
COMMENT ON TABLE waitlist IS 'Waitlist submissions - RLS fixed v2 - All users can insert, authenticated users can select';

