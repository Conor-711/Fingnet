-- 修复 Waitlist RLS 策略
-- 此脚本用于修复现有部署中的 RLS 策略问题

-- 删除旧策略
DROP POLICY IF EXISTS "Allow public insert" ON waitlist;
DROP POLICY IF EXISTS "Allow authenticated select" ON waitlist;

-- 创建新策略：明确允许匿名用户和认证用户插入
CREATE POLICY "Enable insert for anonymous users" ON waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 创建新策略：允许认证用户查询
CREATE POLICY "Enable read for authenticated users" ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);

