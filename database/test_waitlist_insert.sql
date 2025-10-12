-- 测试 Waitlist 插入功能
-- 在 Supabase SQL Editor 中运行此脚本测试插入是否正常

-- 测试 1: 插入新的 email
INSERT INTO waitlist (email, source)
VALUES ('test-' || NOW()::TEXT || '@example.com', 'sql_test')
RETURNING *;

-- 测试 2: 查看最近的 5 条记录
SELECT 
  id,
  email,
  status,
  source,
  created_at
FROM waitlist
ORDER BY created_at DESC
LIMIT 5;

-- 测试 3: 统计 waitlist 数量
SELECT 
  status,
  COUNT(*) as count
FROM waitlist
GROUP BY status;

-- 测试 4: 验证唯一性约束（尝试插入重复 email 应该失败）
-- 取消注释下面这行来测试
-- INSERT INTO waitlist (email, source) VALUES ('test@example.com', 'duplicate_test');

