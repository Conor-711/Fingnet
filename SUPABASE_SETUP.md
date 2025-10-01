# Supabase 数据库设置指南

## 📋 **快速开始**

### **步骤1：访问Supabase SQL Editor**

1. 登录 Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目：`pyqcvvqnnjljdcmnseux`
3. 点击左侧菜单的 **"SQL Editor"** 图标 ⚡

### **步骤2：执行数据库Schema**

1. 在SQL Editor中，点击 **"New query"** 创建新查询
2. 打开项目根目录的 `supabase-schema.sql` 文件
3. **复制全部内容** (Ctrl/Cmd + A, Ctrl/Cmd + C)
4. **粘贴到SQL Editor** (Ctrl/Cmd + V)
5. 点击右下角的 **"Run"** 按钮 ▶️ 或按 `Ctrl/Cmd + Enter`

### **步骤3：验证创建成功**

执行成功后，你应该看到：

```
✅ Database schema created successfully!
✅ Tables created: users, ai_twins, onboarding_progress, ai_conversations, invitations, groups, group_members, group_messages
✅ RLS policies enabled and configured for data isolation
✅ Ready to integrate with your React application!
```

在左侧 **"Table Editor"** 中，你应该能看到以下8个表：
- ✅ users
- ✅ ai_twins
- ✅ onboarding_progress
- ✅ ai_conversations
- ✅ invitations
- ✅ groups
- ✅ group_members
- ✅ group_messages

---

## 🔐 **配置Google OAuth (可选 - 如果使用Supabase Auth)**

如果你想使用Supabase内置的Google OAuth（推荐）：

### **在Supabase Dashboard中配置**

1. 点击左侧菜单的 **"Authentication"** → **"Providers"**
2. 找到 **"Google"** 并点击展开
3. 启用 Google Provider
4. 填入你的Google凭证：
   ```
   Client ID: 204020224662-g7ce4b6pr0n55fe4ukiv6cd1g37199c5.apps.googleusercontent.com
   Client Secret: [从Google Cloud Console获取]
   ```
5. 点击 **"Save"**

### **在Google Cloud Console中配置**

1. 访问 https://console.cloud.google.com/
2. 进入你的项目
3. 导航到 **APIs & Services** → **Credentials**
4. 点击你的OAuth 2.0 Client ID
5. 在 **Authorized redirect URIs** 中添加：
   ```
   https://pyqcvvqnnjljdcmnseux.supabase.co/auth/v1/callback
   ```
6. 保存更改

---

## 📊 **数据库表结构说明**

### **1. users (用户表)**
存储Google登录用户的基本信息
- `id`: UUID主键
- `google_id`: Google用户ID (唯一)
- `email`: 邮箱
- `name`: 用户名
- `picture`: 头像URL

### **2. ai_twins (AI Twin配置表)**
存储每个用户的AI Twin信息
- `user_id`: 关联到users表
- `name`: AI Twin名称
- `avatar`: 头像
- `profile`: JSON对象 {gender, age, occupation, location}
- `goals[]`: 目标数组
- `offers[]`: 提供的价值数组
- `lookings[]`: 寻求的价值数组
- `memories[]`: 记忆数组

### **3. onboarding_progress (入职进度表)**
跟踪用户的onboarding完成状态
- `user_id`: 关联到users表
- `answers`: JSON对象，存储所有问题的答案
- `completed`: 是否完成
- `completed_at`: 完成时间

### **4. ai_conversations (AI对话表)**
存储AI Twin之间的对话记录
- `user_id`: 用户ID
- `partner_twin_id`: 对话伙伴的AI Twin ID
- `messages[]`: 消息数组
- `matching_scores`: 匹配分数
- `summary`: 对话摘要
- `recommended`: 是否推荐

### **5. invitations (邀请表)**
管理用户之间的连接邀请
- `sender_id`: 发送者用户ID
- `recipient_id`: 接收者用户ID
- `status`: pending | accepted | declined
- `message`: 邀请消息

### **6. groups (群组表)**
存储聊天群组信息
- `name`: 群组名称
- `avatar`: 群组头像
- `created_by`: 创建者用户ID

### **7. group_members (群组成员表)**
管理群组成员关系
- `group_id`: 群组ID
- `user_id`: 用户ID

### **8. group_messages (群组消息表)**
存储群聊消息
- `group_id`: 群组ID
- `sender_id`: 发送者ID
- `sender_name`: 发送者名称
- `content`: 消息内容

---

## 🛡️ **Row Level Security (RLS) 说明**

所有表都启用了RLS，确保：
- ✅ 用户只能访问自己的数据
- ✅ AI Twins可被所有人查看（用于匹配）
- ✅ 群组成员只能访问自己参与的群组
- ✅ 邀请发送者和接收者都可以查看

### **测试RLS是否生效**

1. 在SQL Editor中执行：
```sql
SELECT * FROM ai_twins;  -- 应该只返回你自己的AI Twin（如果已创建）
```

2. 如果返回错误或空结果，RLS正常工作！

---

## 🔄 **实时功能配置**

Supabase自动启用Realtime，无需额外配置。

### **确认Realtime已启用**

1. 点击左侧 **"Database"** → **"Replication"**
2. 确保 `group_messages` 表的Realtime已启用
3. 如果未启用，点击表名旁的开关

---

## 🧪 **测试数据库连接**

### **方法1：在Supabase Dashboard测试**

在SQL Editor中执行：
```sql
-- 测试插入用户
INSERT INTO users (google_id, email, name, picture)
VALUES ('test123', 'test@example.com', 'Test User', 'https://example.com/pic.jpg')
RETURNING *;

-- 查看用户
SELECT * FROM users;

-- 清理测试数据
DELETE FROM users WHERE google_id = 'test123';
```

### **方法2：在应用中测试**

启动开发服务器：
```bash
npm run dev
```

打开浏览器Console，执行：
```javascript
import { supabase } from './src/lib/supabase';

// 测试连接
const { data, error } = await supabase.from('users').select('count');
console.log('Connection test:', { data, error });
```

---

## 📈 **查看数据库使用情况**

1. 点击左侧 **"Database"** → **"Usage"**
2. 查看：
   - 数据库大小
   - 活跃连接数
   - 查询次数

免费计划限制：
- ✅ 500MB 数据库存储
- ✅ 2GB 数据传输/月
- ✅ 500,000 次读取/月
- ✅ 100,000 次写入/月

---

## 🚨 **常见问题**

### **Q: SQL执行失败，显示权限错误**
**A:** 确保你以项目管理员身份登录Supabase Dashboard

### **Q: RLS策略阻止了我的查询**
**A:** 在开发阶段，你可以暂时禁用特定表的RLS：
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```
⚠️ **不要在生产环境禁用RLS！**

### **Q: 如何重置数据库？**
**A:** 在SQL Editor中执行：
```sql
-- 谨慎！这将删除所有数据
DROP TABLE IF EXISTS group_messages CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS onboarding_progress CASCADE;
DROP TABLE IF EXISTS ai_twins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 然后重新执行 supabase-schema.sql
```

### **Q: 如何备份数据库？**
**A:** 
1. 点击 **"Database"** → **"Backups"**
2. 免费计划提供7天自动备份
3. 点击 **"Create backup"** 手动创建备份点

---

## ✅ **完成检查清单**

完成以下步骤后，你的Supabase数据库就配置好了：

- [ ] 执行 `supabase-schema.sql` 创建表
- [ ] 验证8个表都已创建
- [ ] 确认RLS策略已启用
- [ ] （可选）配置Google OAuth
- [ ] 测试数据库连接
- [ ] 验证实时功能

---

## 📚 **下一步**

数据库配置完成后：
1. ✅ 重构 `AuthContext` 使用Supabase Auth
2. ✅ 更新 `OnboardingContext` 保存数据到Supabase
3. ✅ 创建自定义Hooks (`useAITwin`, `useConversations`, etc.)
4. ✅ 实现实时聊天功能
5. ✅ 部署到Railway

---

## 🆘 **需要帮助？**

- 📖 Supabase文档: https://supabase.com/docs
- 💬 Supabase Discord: https://discord.supabase.com
- 🐛 问题追踪: https://github.com/supabase/supabase/issues

---

**最后更新**: 2025-01-20  
**项目**: OnlyMsg (Fingnet)  
**Supabase Project**: pyqcvvqnnjljdcmnseux

