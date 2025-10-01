# 🧪 Google登录数据库集成测试指南

## ✅ **已完成的集成**

### **代码修改**
1. ✅ **AuthContext.tsx** - 重构为使用Supabase
2. ✅ **Landing.tsx** - 更新登录流程
3. ✅ **Supabase客户端** - 完整配置
4. ✅ **数据库表** - users表已创建

---

## 🎯 **现在测试**

### **方法1: 本地测试（推荐）**

#### **步骤1: 启动开发服务器**
```bash
npm run dev
```

#### **步骤2: 打开浏览器**
访问: http://localhost:8080

#### **步骤3: 打开开发者工具**
按 `F12` 或 `Cmd+Option+I` (Mac) 打开Console

#### **步骤4: 点击登录**
1. 点击 "Let your Value flow" 按钮
2. 选择你的Google账号
3. 授权应用

#### **步骤5: 观察Console日志**

你应该看到以下日志：

```
🔑 Google OAuth成功，正在获取用户信息...
👤 获取到用户信息: {email: "...", name: "...", sub: "..."}
🔐 开始登录流程... your-email@gmail.com
✅ 用户信息已保存到数据库: {id: "...", email: "...", name: "..."}
✅ 登录成功！用户信息已保存
✅ 登录完成，跳转到onboarding...
```

#### **步骤6: 验证数据库**

1. **打开Supabase Dashboard**
   - https://supabase.com/dashboard
   - 项目: `pyqcvvqnnjljdcmnseux`

2. **进入Table Editor**
   - 点击左侧 📊 **"Table Editor"**
   - 选择 **"users"** 表

3. **查看数据**
   你应该看到一条新记录：
   ```
   ┌──────────────────────────────────────┬──────────────────────┬──────────────┬─────────────────┐
   │ id (UUID)                            │ google_id            │ email        │ name            │
   ├──────────────────────────────────────┼──────────────────────┼──────────────┼─────────────────┤
   │ a1b2c3d4-...                         │ 123456789...         │ your@email   │ Your Name       │
   └──────────────────────────────────────┴──────────────────────┴──────────────┴─────────────────┘
   ```

---

### **方法2: 生产环境测试**

#### **步骤1: 部署到Railway**
```bash
git add -A
git commit -m "feat: Integrate Supabase with Google login"
git push origin main
```

#### **步骤2: 等待部署完成**
访问你的Railway URL

#### **步骤3: 重复方法1的步骤4-6**

---

## 🔍 **如何确认数据已保存**

### **检查清单**

- [ ] Console显示 "✅ 用户信息已保存到数据库"
- [ ] Console显示用户的UUID (id)
- [ ] Supabase Table Editor中users表有新记录
- [ ] 记录包含正确的email和name
- [ ] 记录包含google_id (Google的sub)
- [ ] 登录后成功跳转到onboarding页面

---

## 📊 **数据库字段说明**

### **users表结构**

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | UUID | Supabase用户ID（主键） | `a1b2c3d4-e5f6-...` |
| `google_id` | TEXT | Google用户ID（唯一） | `123456789012345678901` |
| `email` | TEXT | 邮箱地址（唯一） | `your-email@gmail.com` |
| `name` | TEXT | 用户名 | `Your Name` |
| `picture` | TEXT | 头像URL | `https://lh3.google...` |
| `created_at` | TIMESTAMP | 创建时间 | `2025-01-20 10:30:00` |
| `updated_at` | TIMESTAMP | 更新时间 | `2025-01-20 10:30:00` |

---

## 🧪 **测试场景**

### **场景1: 首次登录（新用户）**

**预期行为**:
1. ✅ Console显示 "用户信息已保存到数据库"
2. ✅ Supabase创建新用户记录
3. ✅ 跳转到onboarding页面

**验证方法**:
```sql
-- 在Supabase SQL Editor中执行
SELECT * FROM users WHERE email = 'your-email@gmail.com';
```

### **场景2: 再次登录（已存在用户）**

**预期行为**:
1. ✅ Console显示 "用户信息已保存到数据库"
2. ✅ 返回已存在的用户记录（不创建重复）
3. ✅ 跳转到onboarding页面

**验证方法**:
```sql
-- 确认只有一条记录
SELECT COUNT(*) FROM users WHERE email = 'your-email@gmail.com';
-- 应该返回: 1
```

### **场景3: 不同Google账号登录**

**预期行为**:
1. ✅ 每个Google账号创建独立的用户记录
2. ✅ google_id不同
3. ✅ email不同

**验证方法**:
```sql
-- 查看所有用户
SELECT id, email, name, google_id FROM users ORDER BY created_at DESC;
```

---

## 🐛 **常见问题排查**

### **问题1: Console显示 "数据库操作失败"**

**可能原因**:
- Supabase API Key错误
- 网络连接问题
- users表未创建

**排查步骤**:
1. 检查 `src/lib/supabase.ts` 中的API Key
2. 确认users表已在Supabase中创建
3. 检查浏览器Network标签中的API请求

### **问题2: Supabase中看不到数据**

**可能原因**:
- RLS策略阻止了查看
- 使用了不同的Google账号

**排查步骤**:
1. 在Supabase SQL Editor中执行：
   ```sql
   -- 临时禁用RLS查看所有数据
   SELECT * FROM users;
   ```
2. 检查Console中记录的email是否匹配

### **问题3: 重复登录创建多条记录**

**可能原因**:
- `getOrCreateUser` 函数逻辑错误
- google_id唯一约束未生效

**排查步骤**:
1. 检查users表的唯一约束：
   ```sql
   SELECT constraint_name, constraint_type 
   FROM information_schema.table_constraints 
   WHERE table_name = 'users';
   ```
2. 应该看到 `google_id` 和 `email` 的UNIQUE约束

---

## 📝 **测试日志示例**

### **成功的登录流程**

```
[Landing.tsx:26] 🔑 Google OAuth成功，正在获取用户信息...
[Landing.tsx:37] 👤 获取到用户信息: {
  email: "test@gmail.com",
  name: "Test User",
  sub: "123456789012345678901"
}
[AuthContext.tsx:64] 🔐 开始登录流程... test@gmail.com
[AuthContext.tsx:83] ✅ 用户信息已保存到数据库: {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  email: "test@gmail.com",
  name: "Test User"
}
[AuthContext.tsx:103] ✅ 登录成功！用户信息已保存
[Landing.tsx:52] ✅ 登录完成，跳转到onboarding...
```

---

## 🎯 **下一步功能**

登录功能正常后，接下来将集成：

1. ✅ **AI Twin数据保存**
   - 用户创建的AI Twin信息
   - 保存到 `ai_twins` 表

2. ✅ **Onboarding进度保存**
   - 用户的答案
   - 保存到 `onboarding_progress` 表

3. ✅ **对话历史保存**
   - AI Twin对话记录
   - 保存到 `ai_conversations` 表

4. ✅ **实时功能**
   - 群聊实时消息
   - 邀请实时通知

---

## 📞 **需要帮助？**

### **如果遇到问题**:

1. **检查Console日志**
   - 是否有错误信息？
   - 登录流程走到哪一步？

2. **检查Network标签**
   - Supabase API请求是否成功？
   - 响应状态码是什么？

3. **检查Supabase Dashboard**
   - users表是否存在？
   - 是否有数据？

4. **运行数据库测试**
   ```bash
   npm run test:db
   ```

5. **提供详细信息**
   - Console错误日志
   - Network请求详情
   - 使用的Google账号（邮箱）

---

## ✅ **测试完成标志**

当你看到以下所有情况，说明集成成功：

- ✅ Console显示完整的登录流程日志
- ✅ 没有错误信息
- ✅ Supabase users表中有对应记录
- ✅ 记录包含正确的email、name、google_id
- ✅ 登录后成功跳转到onboarding
- ✅ 刷新页面保持登录状态

---

**准备好测试了吗？**

1. 运行 `npm run dev`
2. 打开 http://localhost:8080
3. 打开Console (F12)
4. 点击登录按钮
5. 观察日志并检查Supabase

**测试完成后告诉我结果！** 🚀

---

**最后更新**: 刚才  
**功能**: Google登录 → Supabase数据库集成  
**状态**: ✅ 就绪

