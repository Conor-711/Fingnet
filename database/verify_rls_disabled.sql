-- 验证 Waitlist RLS 已禁用

-- 1. 验证 RLS 状态（应该显示 rowsecurity = false）
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE tablename = 'waitlist';

-- 2. 验证没有策略（应该显示 0）
SELECT COUNT(*) as "Policy Count"
FROM pg_policies
WHERE tablename = 'waitlist';

-- 3. 列出所有策略名称（应该为空）
SELECT policyname as "Remaining Policies"
FROM pg_policies
WHERE tablename = 'waitlist';

-- 4. 验证表存在
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'waitlist';

-- 5. 测试插入（如果成功说明 RLS 已禁用）
-- 取消注释下面这行来测试
-- INSERT INTO waitlist (email, source) VALUES ('test-disabled-rls@example.com', 'test') RETURNING *;

