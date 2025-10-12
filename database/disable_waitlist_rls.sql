-- Waitlist RLS 最终解决方案：完全禁用 RLS
-- 适用于公开的 Waitlist 功能

-- 删除所有策略（清理所有可能存在的策略）
DROP POLICY IF EXISTS "Allow public insert" ON waitlist;
DROP POLICY IF EXISTS "Allow authenticated select" ON waitlist;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON waitlist;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON waitlist;
DROP POLICY IF EXISTS "Enable insert for all users" ON waitlist;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON waitlist;

-- 完全禁用 RLS
ALTER TABLE waitlist DISABLE ROW LEVEL SECURITY;

-- 注释说明
COMMENT ON TABLE waitlist IS 'Waitlist submissions - RLS disabled for public access';

-- 完成提示
SELECT 'Waitlist RLS has been disabled. Table is now publicly accessible.' as status;

