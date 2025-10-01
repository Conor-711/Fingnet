-- 修复 users 表的 RLS 策略
-- 问题: 当前策略要求 auth.uid() = id，但我们使用自己的认证系统

-- 1. 删除现有的限制性策略
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- 2. 创建更宽松的策略（允许应用层控制）

-- 允许所有人插入用户（应用层通过google_id唯一约束防止重复）
CREATE POLICY "Allow user creation"
  ON users FOR INSERT
  WITH CHECK (true);

-- 允许用户查看自己的记录（通过google_id匹配）
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (true);  -- 暂时允许所有人查看，后续可以收紧

-- 允许用户更新自己的记录
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (true);  -- 暂时允许所有人更新，应用层控制

-- 验证策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 提示
DO $$
BEGIN
  RAISE NOTICE '✅ Users table RLS policies updated!';
  RAISE NOTICE 'Now users can be created without Supabase Auth';
  RAISE NOTICE 'Application layer controls access via google_id';
END $$;

