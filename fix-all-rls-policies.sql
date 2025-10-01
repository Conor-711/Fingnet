-- 全面修复 RLS 策略以支持自定义认证系统
-- 我们不使用 Supabase Auth，而是自己的 Google OAuth + users 表

-- ============================================
-- USERS 表 - 允许应用层管理
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- 允许插入新用户（google_id唯一约束防止重复）
CREATE POLICY "Allow user creation"
  ON users FOR INSERT
  WITH CHECK (true);

-- 允许查看所有用户（用于匹配、显示等）
CREATE POLICY "Allow user viewing"
  ON users FOR SELECT
  USING (true);

-- 允许更新用户（应用层通过user_id控制）
CREATE POLICY "Allow user updates"
  ON users FOR UPDATE
  USING (true);

-- ============================================
-- AI_TWINS 表 - 基于 user_id 控制
-- ============================================

DROP POLICY IF EXISTS "Users can view own AI twin" ON ai_twins;
DROP POLICY IF EXISTS "Users can view other AI twins" ON ai_twins;
DROP POLICY IF EXISTS "Users can update own AI twin" ON ai_twins;
DROP POLICY IF EXISTS "Users can insert own AI twin" ON ai_twins;
DROP POLICY IF EXISTS "Users can delete own AI twin" ON ai_twins;

-- 允许所有人查看 AI Twins（用于匹配）
CREATE POLICY "Allow viewing AI twins"
  ON ai_twins FOR SELECT
  USING (true);

-- 允许插入 AI Twin（应用层通过 user_id 控制）
CREATE POLICY "Allow creating AI twins"
  ON ai_twins FOR INSERT
  WITH CHECK (true);

-- 允许更新 AI Twin（应用层控制）
CREATE POLICY "Allow updating AI twins"
  ON ai_twins FOR UPDATE
  USING (true);

-- 允许删除 AI Twin（应用层控制）
CREATE POLICY "Allow deleting AI twins"
  ON ai_twins FOR DELETE
  USING (true);

-- ============================================
-- ONBOARDING_PROGRESS 表
-- ============================================

DROP POLICY IF EXISTS "Users can manage own onboarding" ON onboarding_progress;

CREATE POLICY "Allow onboarding management"
  ON onboarding_progress FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- AI_CONVERSATIONS 表
-- ============================================

DROP POLICY IF EXISTS "Users can view own conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON ai_conversations;

CREATE POLICY "Allow conversation management"
  ON ai_conversations FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- INVITATIONS 表
-- ============================================

DROP POLICY IF EXISTS "Users can view related invitations" ON invitations;
DROP POLICY IF EXISTS "Users can send invitations" ON invitations;
DROP POLICY IF EXISTS "Users can update received invitations" ON invitations;
DROP POLICY IF EXISTS "Users can delete own sent invitations" ON invitations;

CREATE POLICY "Allow invitation management"
  ON invitations FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- GROUPS 表（如果存在）
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'groups') THEN
    -- 删除旧策略
    DROP POLICY IF EXISTS "Users can view groups they are members of" ON groups;
    DROP POLICY IF EXISTS "Users can create groups" ON groups;
    DROP POLICY IF EXISTS "Group creators can update groups" ON groups;
    
    -- 创建新策略
    CREATE POLICY "Allow group management"
      ON groups FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- GROUP_MEMBERS 表（如果存在）
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'group_members') THEN
    DROP POLICY IF EXISTS "Users can view group members" ON group_members;
    DROP POLICY IF EXISTS "Users can join groups" ON group_members;
    DROP POLICY IF EXISTS "Users can leave groups" ON group_members;
    
    CREATE POLICY "Allow group member management"
      ON group_members FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- GROUP_MESSAGES 表（如果存在）
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'group_messages') THEN
    DROP POLICY IF EXISTS "Group members can view messages" ON group_messages;
    DROP POLICY IF EXISTS "Group members can send messages" ON group_messages;
    DROP POLICY IF EXISTS "Users can delete own messages" ON group_messages;
    
    CREATE POLICY "Allow group message management"
      ON group_messages FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- 验证策略
-- ============================================

-- 查看所有表的策略
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 完成提示
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated for custom authentication!';
  RAISE NOTICE '';
  RAISE NOTICE 'Updated tables:';
  RAISE NOTICE '  ✅ users - Allow creation, viewing, updating';
  RAISE NOTICE '  ✅ ai_twins - Full access';
  RAISE NOTICE '  ✅ onboarding_progress - Full access';
  RAISE NOTICE '  ✅ ai_conversations - Full access';
  RAISE NOTICE '  ✅ invitations - Full access';
  RAISE NOTICE '  ✅ groups - Full access (if exists)';
  RAISE NOTICE '  ✅ group_members - Full access (if exists)';
  RAISE NOTICE '  ✅ group_messages - Full access (if exists)';
  RAISE NOTICE '';
  RAISE NOTICE 'Security:';
  RAISE NOTICE '  - RLS is still ENABLED';
  RAISE NOTICE '  - Policies now allow application-layer control';
  RAISE NOTICE '  - Database constraints (UNIQUE, FK) still enforce data integrity';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Note: These are permissive policies.';
  RAISE NOTICE '   Security is now managed at the application layer.';
  RAISE NOTICE '   Future: Implement row-level checks based on session context.';
END $$;

