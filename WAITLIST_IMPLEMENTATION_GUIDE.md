# Waitlist 功能实施指南 📋

## ✅ 已完成的工作

### 1. 数据库设计
- ✅ 创建了 `database/create_waitlist_table.sql`
- ✅ 定义了 `waitlist` 表结构（id, email, status, source, timestamps）
- ✅ 添加了必要的索引（email, status, created_at）
- ✅ 配置了 RLS 策略（允许公开插入，仅认证用户可查询）

### 2. TypeScript 类型定义
- ✅ 在 `src/lib/supabase.ts` 中添加了 `WaitlistEntry` 接口
- ✅ 实现了 `submitToWaitlist()` 函数
- ✅ 实现了 `checkEmailInWaitlist()` 函数

### 3. WaitlistForm 组件
- ✅ 创建了 `src/components/WaitlistForm.tsx`
- ✅ 实现了 email 验证（前端正则表达式）
- ✅ 实现了重复提交检测
- ✅ 实现了成功/错误状态处理
- ✅ 添加了用户友好的 UI 反馈

### 4. Landing 页面集成
- ✅ 在 `src/pages/Landing.tsx` 中导入了 `WaitlistForm`
- ✅ 在页面底部（footer 之前）添加了 Waitlist section
- ✅ 使用了统一的设计风格（Tailwind CSS）

### 5. 代码质量
- ✅ 所有文件通过了 linter 检查（无错误）
- ✅ 代码已提交到 Git
- ✅ 已推送到 GitHub
- ✅ Railway 将自动部署更新

---

## 🎯 下一步：数据库设置

### 步骤 1: 登录 Supabase Dashboard

1. 访问 https://supabase.com
2. 登录你的账号
3. 选择你的项目（pyqcvvqnnjljdcmnseux）

### 步骤 2: 执行 SQL 脚本

1. 在左侧菜单中点击 **SQL Editor**
2. 点击 **New Query**
3. 复制 `database/create_waitlist_table.sql` 的内容
4. 粘贴到 SQL Editor 中
5. 点击 **Run** 按钮执行

### 步骤 3: 验证表创建

1. 在左侧菜单中点击 **Table Editor**
2. 找到 `waitlist` 表
3. 确认以下字段存在：
   - `id` (UUID, Primary Key)
   - `email` (TEXT, UNIQUE)
   - `status` (TEXT, Default: 'pending')
   - `source` (TEXT, Default: 'landing_page')
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

### 步骤 4: 验证 RLS 策略

1. 在 Table Editor 中选择 `waitlist` 表
2. 点击右上角的 **RLS** 图标
3. 确认 RLS 已启用（Enabled）
4. 确认存在以下策略：
   - `Allow public insert` - 允许任何人插入
   - `Allow authenticated select` - 仅认证用户可查询

---

## 🧪 测试场景

### 场景 1: 提交有效 Email

1. 访问 Landing 页面（http://localhost:8080 或生产环境）
2. 滚动到 "Join the Waitlist" section
3. 输入有效的 email（例如：test@example.com）
4. 点击 "Join Waitlist"

**预期结果:**
- ✅ 显示成功消息："Successfully joined the waitlist!"
- ✅ 显示绿色成功卡片："You're on the list!"
- ✅ 数据保存到 Supabase `waitlist` 表

### 场景 2: 提交重复 Email

1. 使用相同的 email 再次提交
2. 点击 "Join Waitlist"

**预期结果:**
- ✅ 显示信息提示："You are already on the waitlist!"
- ✅ 显示绿色成功卡片（不会创建重复记录）

### 场景 3: 提交无效 Email

1. 输入无效的 email（例如：invalid-email）
2. 点击 "Join Waitlist"

**预期结果:**
- ✅ 显示错误消息："Please enter a valid email address"
- ✅ 不提交到数据库

### 场景 4: 提交空 Email

1. 不输入任何内容
2. 点击 "Join Waitlist"

**预期结果:**
- ✅ 显示错误消息："Please enter your email"
- ✅ 不提交到数据库

### 场景 5: 验证数据保存

1. 在 Supabase Dashboard 中打开 Table Editor
2. 选择 `waitlist` 表
3. 查看数据

**预期结果:**
- ✅ 看到提交的 email 记录
- ✅ `status` 为 'pending'
- ✅ `source` 为 'landing_page'
- ✅ `created_at` 和 `updated_at` 有时间戳

---

## 📊 数据库查询示例

### 查看所有 Waitlist 条目

```sql
SELECT * FROM waitlist
ORDER BY created_at DESC;
```

### 统计 Waitlist 数量

```sql
SELECT 
  status, 
  COUNT(*) as count
FROM waitlist
GROUP BY status;
```

### 查找特定 Email

```sql
SELECT * FROM waitlist
WHERE email = 'test@example.com';
```

### 更新 Waitlist 状态

```sql
UPDATE waitlist
SET status = 'approved', updated_at = NOW()
WHERE email = 'test@example.com';
```

---

## 🎨 UI 设计说明

### Waitlist Section 位置
- 位于 Landing 页面底部
- 在主内容（Google 登录按钮）之后
- 在 Footer 之前

### 视觉设计
- 背景色：浅灰色 (`bg-gray-50`)
- 标题：大号粗体字体（`font-outfit`）
- 表单：居中显示，最大宽度 `max-w-md`
- 输入框：带 Mail 图标，高度 48px
- 按钮：深灰色背景，悬停时变深

### 成功状态卡片
- 绿色主题（`bg-green-50`, `border-green-200`）
- 显示勾选图标（`CheckCircle2`）
- 友好的成功消息
- 可选择提交另一个 email

---

## 🔐 安全考虑

### 1. RLS 策略
- ✅ 公开插入：允许任何人提交 email
- ✅ 认证查询：只有登录用户（管理员）可查看 waitlist

### 2. Email 验证
- ✅ 前端验证：正则表达式
- ✅ 格式化：自动转小写并去除空格
- ✅ 唯一性：数据库 UNIQUE 约束

### 3. 错误处理
- ✅ 所有数据库操作都有错误处理
- ✅ 用户友好的错误消息
- ✅ Console 日志记录详细错误信息

---

## 📝 代码文件清单

### 新建文件
1. `database/create_waitlist_table.sql` - 数据库表创建脚本
2. `src/components/WaitlistForm.tsx` - Waitlist 表单组件

### 修改文件
1. `src/lib/supabase.ts` - 添加类型定义和辅助函数
2. `src/pages/Landing.tsx` - 集成 Waitlist section

---

## 🚀 部署状态

### 代码部署
- ✅ 代码已提交到 Git
- ✅ 已推送到 GitHub
- ✅ Railway 自动部署中

### 数据库设置
- ⏳ 待执行：在 Supabase Dashboard 执行 SQL 脚本

---

## 🎯 待办事项

### 立即执行
1. [ ] 在 Supabase Dashboard 执行 `database/create_waitlist_table.sql`
2. [ ] 验证 `waitlist` 表和 RLS 策略创建成功
3. [ ] 测试所有提交场景（有效、无效、重复、空）
4. [ ] 验证数据正确保存到数据库

### 可选增强（未来）
- [ ] 添加邮件通知（当用户加入 waitlist 时）
- [ ] 创建管理界面查看和管理 waitlist
- [ ] 添加批量导出 waitlist 功能
- [ ] 添加邀请码生成功能（当 waitlist 用户被批准时）

---

## 📞 问题排查

### 问题 1: 提交失败，显示 "Failed to join waitlist"

**可能原因:**
- Supabase SQL 脚本未执行
- `waitlist` 表不存在
- RLS 策略配置错误

**解决方案:**
1. 检查 Supabase Table Editor 中是否有 `waitlist` 表
2. 重新执行 SQL 脚本
3. 检查浏览器 Console 的详细错误信息

### 问题 2: 提交成功但数据未保存

**可能原因:**
- RLS 策略阻止了插入操作

**解决方案:**
1. 检查 RLS 策略是否包含 "Allow public insert"
2. 确认策略的 `WITH CHECK` 条件为 `true`

### 问题 3: 无法查询 waitlist 数据

**可能原因:**
- RLS 策略限制了查询权限

**解决方案:**
1. 使用 Supabase 认证的管理员账号查询
2. 或在 SQL Editor 中直接查询（绕过 RLS）

---

**Waitlist 功能已完成实现！执行数据库脚本后即可使用。** 🎉
