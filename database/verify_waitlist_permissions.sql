-- 验证 Waitlist 表的 RLS 和权限配置
-- 在 Supabase SQL Editor 中运行此脚本以检查配置是否正确

-- 1. 验证 RLS 状态
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE tablename = 'waitlist';

-- 2. 验证所有策略
SELECT 
  schemaname as schema,
  tablename as table,
  policyname as "Policy Name",
  permissive as "Permissive",
  roles as "Roles",
  cmd as "Command",
  qual as "USING Clause",
  with_check as "WITH CHECK Clause"
FROM pg_policies
WHERE tablename = 'waitlist'
ORDER BY policyname;

-- 3. 验证表权限
SELECT 
  grantee as "Granted To",
  privilege_type as "Privilege"
FROM information_schema.role_table_grants
WHERE table_name = 'waitlist'
ORDER BY grantee, privilege_type;

-- 4. 验证表是否存在
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'waitlist';

-- 5. 验证列结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'waitlist'
ORDER BY ordinal_position;

