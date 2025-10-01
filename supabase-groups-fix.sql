-- 补充脚本：修复 groups 相关表
-- 如果初始SQL执行时groups表创建失败，运行此脚本

-- ============================================
-- 删除已存在的表（如果有）
-- ============================================
DROP TABLE IF EXISTS group_messages CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- ============================================
-- 6. 群组表 (groups)
-- ============================================
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. 群组成员表 (group_members)
-- ============================================
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- ============================================
-- 8. 群组消息表 (group_messages)
-- ============================================
CREATE TABLE group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 索引
-- ============================================
CREATE INDEX idx_group_messages_group ON group_messages(group_id, created_at DESC);
CREATE INDEX idx_group_members_user ON group_members(user_id);

-- ============================================
-- 更新时间触发器
-- ============================================
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS 策略
-- ============================================

-- 启用RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Groups 表策略
DROP POLICY IF EXISTS "Users can view groups they are members of" ON groups;
CREATE POLICY "Users can view groups they are members of"
  ON groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create groups" ON groups;
CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Group creators can update groups" ON groups;
CREATE POLICY "Group creators can update groups"
  ON groups FOR UPDATE
  USING (auth.uid() = created_by);

-- Group Members 表策略
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can join groups" ON group_members;
CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave groups" ON group_members;
CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  USING (auth.uid() = user_id);

-- Group Messages 表策略
DROP POLICY IF EXISTS "Group members can view messages" ON group_messages;
CREATE POLICY "Group members can view messages"
  ON group_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Group members can send messages" ON group_messages;
CREATE POLICY "Group members can send messages"
  ON group_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own messages" ON group_messages;
CREATE POLICY "Users can delete own messages"
  ON group_messages FOR DELETE
  USING (auth.uid() = sender_id);

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Groups tables created successfully!';
  RAISE NOTICE 'Tables: groups, group_members, group_messages';
  RAISE NOTICE 'RLS policies enabled';
END $$;

