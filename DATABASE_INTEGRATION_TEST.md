# 数据库集成测试指南

## ✅ 已完成的数据库集成

### 1. Onboarding流程 → 数据库保存
**文件**: `src/components/Onboarding.tsx`

**功能**:
- 用户完成onboarding后，自动保存以下数据到Supabase：
  - `onboarding_progress` 表：保存用户的onboarding答案和完成状态
  - `ai_twins` 表：保存用户的AI Twin信息（名称、头像、profile、goals、offers、lookings）

**触发时机**: 
- 用户点击 Connect 页面的 "Complete Onboarding" 按钮

**数据流**:
```
用户完成onboarding 
  → handleCompleteOnboarding()
  → saveOnboardingProgress(user.id, answers, true)
  → upsertAITwin(user.id, aiTwinData)
  → 成功提示 "所有数据已成功保存！"
  → 导航到 /main
```

---

### 2. Main页面 → 从数据库加载AI Twin
**文件**: `src/pages/Main.tsx`

**功能**:
- 页面加载时，从Supabase读取用户的AI Twin数据
- 将数据库数据同步到Context，确保UI显示最新信息

**触发时机**: 
- Main 页面挂载时（useEffect依赖user）

**数据流**:
```
Main页面加载
  → loadAITwinFromDatabase()
  → getAITwin(user.id)
  → 同步到 OnboardingContext
  → UI显示数据库中的AI Twin信息
```

---

### 3. Main页面 → 保存AI生成的对话
**文件**: `src/pages/Main.tsx`

**功能**:
- 为每个AI Twin生成对话后，自动保存到数据库
- 保存对话内容、匹配评分、总结和推荐状态

**触发时机**: 
- AI Twin加载完成后，自动生成对话（useEffect依赖aiTwinProfile）
- 每个对话生成成功后立即保存

**数据流**:
```
AI Twin Profile可用
  → generateConversationsForAllChats()
  → 为每个AI Twin调用 generateAITwinConversation()
  → saveConversation(conversationData)
  → 控制台输出 "✅ Saved conversation for {twinId} to database"
```

**保存的数据**:
- `user_id`: 当前用户ID
- `partner_twin_id`: 对方AI Twin的ID（mock数据为null）
- `partner_name`: 对方AI Twin的名称
- `messages`: 对话消息数组
- `matching_scores`: 匹配评分（compatibility, valueAlignment, goalSynergy, overall, reasoning）
- `summary`: 对话总结
- `recommended`: 是否推荐（基于平均评分 >= 8）

---

### 4. Main页面 → 保存AI Twin编辑
**文件**: `src/pages/Main.tsx`

**功能**:
- 用户编辑AI Twin资料后，保存到数据库
- 同时更新Context和localStorage

**触发时机**: 
- 用户在编辑模态框中点击 "Save" 按钮

**数据流**:
```
用户点击 Edit
  → handleEditProfile()
  → 编辑modal显示
  → 用户修改资料
  → 点击Save
  → handleSaveProfile()
  → upsertAITwin(user.id, cleanedProfile)
  → 成功提示 "AI Twin资料已更新"
  → 更新Context
```

---

## 🧪 测试流程

### 步骤 1: 准备环境

1. **确保RLS策略已修复**
   ```bash
   # 在Supabase SQL Editor中执行
   # 选择并运行 fix-all-rls-policies.sql
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **打开浏览器控制台**
   - 打开 Chrome DevTools (F12)
   - 切换到 Console 标签
   - 监控数据库操作的日志输出

---

### 步骤 2: 测试完整流程

#### 2.1 Google登录
- 访问 `http://localhost:8081`
- 点击 "Let your Value flow"
- 使用Google账号登录

**预期结果**:
- 成功登录后重定向到 `/onboarding`
- 控制台应该显示：`✅ User logged in: {email}`

**数据库验证**:
```sql
-- 在Supabase SQL Editor中查询
SELECT * FROM users ORDER BY created_at DESC LIMIT 1;
```
应该看到新创建的用户记录。

---

#### 2.2 完成Onboarding流程

**步骤**:
1. AI Twin 页面：设置名称和头像
2. Choice Made 页面：回答所有问题
3. Goal Input 页面：与AI Twin聊天（自动问9个问题）
4. Create Twin 页面：查看AI Twin信息
5. Network 页面：了解网络
6. Connect 页面：点击 "Complete Onboarding"

**预期结果**:
- 控制台应该显示：
  ```
  ✅ AI Twin profile updated successfully
  所有数据已成功保存！
  ```
- 自动导航到 `/main`

**数据库验证**:
```sql
-- 1. 检查onboarding_progress表
SELECT * FROM onboarding_progress 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC LIMIT 1;

-- 2. 检查ai_twins表
SELECT * FROM ai_twins 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC LIMIT 1;
```

**应该看到**:
- `onboarding_progress`:
  - `completed = true`
  - `answers` 包含Choice Made的所有答案（JSON格式）
  
- `ai_twins`:
  - `name`: 用户设置的AI Twin名称
  - `avatar`: 用户选择的头像路径
  - `profile`: {gender, age, occupation, location}
  - `goals`: 数组，包含Goal Recently
  - `offers`: 数组，包含Value Offered
  - `lookings`: 数组，包含Value Desired
  - `memories`: 空数组

---

#### 2.3 Main页面 - 加载AI Twin数据

**步骤**:
- 页面应该自动加载（从上一步自动跳转）

**预期结果**:
- 控制台应该显示：
  ```
  ✅ Loaded AI Twin from database: {AI Twin data}
  ```
- 左侧 "Your AI Twin Profile" 显示从数据库加载的信息

---

#### 2.4 Main页面 - 生成并保存对话

**步骤**:
- 等待"Conversation History"区域显示AI Twin连接动画
- 等待对话生成完成（可能需要1-2分钟）

**预期结果**:
- 控制台应该显示（为每个AI Twin）：
  ```
  ✅ Saved conversation for {twinId} to database
  ```
- "Conversation History" 显示生成的聊天记录卡片

**数据库验证**:
```sql
-- 检查ai_conversations表
SELECT * FROM ai_conversations 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC;
```

**应该看到**:
- 多条conversation记录（每个mock AI Twin一条）
- 每条记录包含：
  - `partner_name`: 对方AI Twin名称
  - `messages`: 对话消息数组
  - `matching_scores`: 评分对象
  - `summary`: 对话总结
  - `recommended`: true/false

---

#### 2.5 编辑AI Twin资料

**步骤**:
1. 在Main页面，点击 "Your AI Twin Profile" 卡片右上角的 "Edit" 按钮
2. 修改任意字段（例如：添加新的Goal）
3. 点击 "Save" 按钮

**预期结果**:
- 控制台应该显示：
  ```
  ✅ AI Twin profile updated successfully
  ```
- Toast提示："AI Twin资料已更新"
- Modal关闭，UI立即更新

**数据库验证**:
```sql
-- 再次查询ai_twins表
SELECT * FROM ai_twins 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY updated_at DESC LIMIT 1;
```

**应该看到**:
- `updated_at` 时间戳更新
- 修改的字段反映了新数据

---

## 🔍 常见问题排查

### 问题 1: RLS Policy错误
**错误信息**: `new row violates row-level security policy for table "users"`

**解决方案**:
1. 在Supabase Dashboard → SQL Editor
2. 执行 `fix-all-rls-policies.sql`
3. 刷新页面重新测试

---

### 问题 2: AI Twin未加载
**症状**: Main页面显示 "Complete onboarding to create your AI Twin"

**排查步骤**:
1. 检查控制台是否有错误
2. 检查数据库中是否有`ai_twins`记录
3. 检查localStorage中的`onlymsg_ai_twin_profile`

**可能原因**:
- Onboarding未完成
- 数据库保存失败
- Context未正确更新

---

### 问题 3: 对话未保存到数据库
**症状**: 控制台没有 "✅ Saved conversation" 日志

**排查步骤**:
1. 检查是否有网络错误
2. 检查Supabase连接是否正常
3. 检查`ai_conversations`表的RLS策略

**验证Supabase连接**:
```javascript
// 在浏览器控制台执行
import { supabase } from '@/lib/supabase';
const { data, error } = await supabase.from('ai_twins').select('count');
console.log({ data, error });
```

---

### 问题 4: OpenAI API调用失败
**症状**: 对话生成很慢或使用fallback数据

**排查步骤**:
1. 检查`.env.local`中的`VITE_OPENAI_API_KEY`是否正确
2. 检查网络是否能访问OpenAI API
3. 检查OpenAI账户余额

---

## 📊 数据库表结构总结

### `users` 表
- `id`: UUID (Primary Key)
- `google_id`: String (Unique)
- `email`: String
- `name`: String
- `picture`: String (头像URL)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### `onboarding_progress` 表
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → users.id)
- `answers`: JSONB
- `completed`: Boolean
- `completed_at`: Timestamp (nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### `ai_twins` 表
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → users.id, Unique)
- `name`: String
- `avatar`: String (nullable)
- `profile`: JSONB {gender, age, occupation, location}
- `goals`: Text[] (数组)
- `offers`: Text[] (数组)
- `lookings`: Text[] (数组)
- `memories`: JSONB[] (数组)
- `goal_recently`: String (nullable, 向后兼容)
- `value_offered`: String (nullable, 向后兼容)
- `value_desired`: String (nullable, 向后兼容)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### `ai_conversations` 表
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → users.id)
- `partner_twin_id`: UUID (nullable, Foreign Key → ai_twins.id)
- `partner_name`: String (nullable)
- `messages`: JSONB[] (数组)
- `matching_scores`: JSONB (nullable)
- `summary`: Text (nullable)
- `recommended`: Boolean (默认false)
- `created_at`: Timestamp
- `updated_at`: Timestamp

---

## ⏭️ 后续待开发功能

1. **Profile页面集成邀请功能**
   - 发送邀请时保存到`invitations`表
   - 实时更新邀请状态

2. **Main页面集成群组功能**
   - 从`groups`, `group_members`, `group_messages`表读取数据
   - 实现实时群聊消息订阅

3. **完整的用户匹配系统**
   - 基于数据库中的真实AI Twin数据进行匹配
   - 替换当前的mock数据

---

## 📝 注意事项

1. **环境变量**: 确保所有必需的环境变量都已配置
   - `VITE_OPENAI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. **RLS策略**: 务必确保RLS策略已正确配置，否则会导致权限错误

3. **错误处理**: 所有数据库操作都包含错误处理和用户友好的提示

4. **日志输出**: 开发环境下会在控制台输出详细的数据库操作日志

5. **数据同步**: localStorage和Supabase数据会保持同步，但数据库是唯一真实来源

