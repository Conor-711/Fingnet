# Google 登录问题修复文档 🔧

## 🐛 问题描述

### 错误信息

```
GET https://pyqcvvqnnjljdcmnseux.supabase.co/rest/v1/users?select=*&google_id=eq.106183204863329408121 
406 (Not Acceptable)

POST https://pyqcvvqnnjljdcmnseux.supabase.co/rest/v1/users?select=* 
409 (Conflict)

❌ 数据库操作失败: {
  code: '23505', 
  details: null, 
  hint: null, 
  message: 'duplicate key value violates unique constraint "users_email_key"'
}
```

### 问题分析

1. **406 错误** - 查询 `google_id` 时返回 406 Not Acceptable
   - **原因:** `google_id` 列可能不存在，或者查询返回多个结果
   - **旧代码使用:** `.single()` 方法，要求必须返回一个结果

2. **409 冲突** - 尝试插入用户时，`email` 已存在
   - **原因:** 用户之前使用测试账号或其他方式创建过账号
   - **旧逻辑:** 只查 `google_id`，找不到就直接创建新用户，导致 `email` 重复

### 场景重现

```
用户操作流程:
1. 用户之前使用测试账号创建了账号 (email: zfy3712z@gmail.com)
2. 该用户记录没有 google_id 字段（因为是测试账号）
3. 用户现在尝试用 Google 账号登录 (email: zfy3712z@gmail.com)
4. 系统查询 google_id → 找不到（406 或空）
5. 系统尝试创建新用户 → email 冲突（409）
6. 登录失败 ❌
```

---

## ✅ 解决方案

### 修复策略

使用**三层查找逻辑**：

1. **第一层:** 通过 `google_id` 查找
   - 如果找到 → 直接返回用户
   
2. **第二层:** 通过 `email` 查找
   - 如果找到 → 更新该用户的 `google_id`，并返回
   
3. **第三层:** 创建新用户
   - 如果都找不到 → 创建新用户

### 代码修复

#### 修复前（旧代码）

```typescript
export async function getOrCreateUser(googleUser: {
  sub: string;
  email: string;
  name: string;
  picture: string;
}) {
  // 先尝试查找用户
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('google_id', googleUser.sub)
    .single(); // ❌ 问题：要求必须返回一个结果，否则抛出错误

  if (existingUser) {
    return { user: existingUser, error: null };
  }

  // 用户不存在，创建新用户
  // ❌ 问题：没有检查 email 是否已存在
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      google_id: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture
    })
    .select()
    .single();

  return { user: newUser, error: createError };
}
```

#### 修复后（新代码）

```typescript
export async function getOrCreateUser(googleUser: {
  sub: string;
  email: string;
  name: string;
  picture: string;
}) {
  // 1. 先尝试通过 google_id 查找用户
  const { data: userByGoogleId, error: googleIdError } = await supabase
    .from('users')
    .select('*')
    .eq('google_id', googleUser.sub)
    .maybeSingle(); // ✅ 修复：允许返回 null，不抛出错误

  if (userByGoogleId) {
    console.log('✅ 通过 google_id 找到用户:', userByGoogleId.email);
    return { user: userByGoogleId, error: null };
  }

  // 2. 如果通过 google_id 没找到，尝试通过 email 查找
  const { data: userByEmail, error: emailError } = await supabase
    .from('users')
    .select('*')
    .eq('email', googleUser.email)
    .maybeSingle(); // ✅ 修复：允许返回 null，不抛出错误

  if (userByEmail) {
    console.log('✅ 通过 email 找到用户，更新 google_id:', userByEmail.email);
    
    // ✅ 新增：找到了用户，但是没有 google_id，更新它
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        google_id: googleUser.sub,
        name: googleUser.name, // 同时更新名称
        picture: googleUser.picture // 同时更新头像
      })
      .eq('id', userByEmail.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ 更新用户 google_id 失败:', updateError);
      return { user: null, error: updateError };
    }

    return { user: updatedUser, error: null };
  }

  // 3. 用户完全不存在，创建新用户
  console.log('📝 创建新用户:', googleUser.email);
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      google_id: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture
    })
    .select()
    .single();

  if (createError) {
    console.error('❌ 创建用户失败:', createError);
    return { user: null, error: createError };
  }

  return { user: newUser, error: null };
}
```

---

## 🔑 关键修复点

### 1. 使用 `maybeSingle()` 替代 `single()`

```typescript
// ❌ 旧代码
.single(); // 要求必须返回一个结果，否则抛出错误

// ✅ 新代码
.maybeSingle(); // 允许返回 null，不抛出错误
```

**原因:**
- `single()` 在没有匹配结果时会抛出错误
- `maybeSingle()` 在没有匹配结果时返回 `null`，不抛出错误

### 2. 添加 Email 查找逻辑

```typescript
// ✅ 新增逻辑
const { data: userByEmail } = await supabase
  .from('users')
  .select('*')
  .eq('email', googleUser.email)
  .maybeSingle();

if (userByEmail) {
  // 更新该用户的 google_id
  // ...
}
```

**原因:**
- 用户可能之前用测试账号创建了账号（只有 email，没有 google_id）
- 现在用 Google 登录时，应该**关联**到现有账号，而不是创建新账号

### 3. 更新现有用户的 google_id

```typescript
// ✅ 新增更新逻辑
const { data: updatedUser } = await supabase
  .from('users')
  .update({
    google_id: googleUser.sub,
    name: googleUser.name,
    picture: googleUser.picture
  })
  .eq('id', userByEmail.id)
  .select()
  .single();
```

**原因:**
- 将 Google 账号与现有账号关联
- 同时更新用户的名称和头像（来自 Google）
- 下次用 Google 登录时，可以通过 `google_id` 直接找到

---

## 🎯 修复后的流程

### 场景 1: 新用户首次用 Google 登录

```
1. 查询 google_id → 找不到
2. 查询 email → 找不到
3. 创建新用户（包含 google_id 和 email）
4. 返回新用户 ✅
```

### 场景 2: 测试账号用户改用 Google 登录

```
1. 查询 google_id → 找不到
2. 查询 email → 找到！（测试账号创建的）
3. 更新该用户的 google_id
4. 返回更新后的用户 ✅
```

### 场景 3: 已有 Google 登录记录的用户

```
1. 查询 google_id → 找到！
2. 直接返回用户 ✅
```

---

## 📊 影响范围

### 修改的文件

- ✅ `src/lib/supabase.ts` - `getOrCreateUser()` 函数

### 影响的功能

- ✅ Google OAuth 登录（Landing 页面）
- ✅ Chrome 插件 Google 登录（ExtensionCallback 页面）

### 数据库影响

- ✅ 会更新现有用户的 `google_id` 字段
- ✅ 不会创建重复的用户记录
- ✅ 保持用户的所有现有数据（AI Twin、Onboarding 进度等）

---

## 🧪 测试场景

### 测试 1: 新用户 Google 登录

1. 使用一个全新的 Google 账号登录
2. **预期:** 创建新用户记录，包含 `google_id` 和 `email`
3. **预期:** 跳转到 Onboarding 流程

### 测试 2: 测试账号改用 Google 登录

1. 之前使用测试账号登录（email: test@example.com）
2. 现在使用相同 email 的 Google 账号登录
3. **预期:** 更新现有用户的 `google_id`
4. **预期:** 保留所有现有数据（AI Twin、聊天记录等）
5. **预期:** 如果已完成 Onboarding，跳转到主页

### 测试 3: 已有 Google 登录记录的用户

1. 之前已经用 Google 登录过
2. 再次使用 Google 登录
3. **预期:** 直接通过 `google_id` 找到用户
4. **预期:** 登录成功，跳转到主页（如果已完成 Onboarding）

---

## 🔍 验证方法

### 1. 查看浏览器 Console

成功的登录流程应该显示：

```javascript
// 场景 1: 新用户
📝 创建新用户: user@example.com
✅ 用户信息已保存到数据库

// 场景 2: 测试账号改用 Google
✅ 通过 email 找到用户，更新 google_id: user@example.com
✅ 用户信息已保存到数据库

// 场景 3: 已有 Google 记录
✅ 通过 google_id 找到用户: user@example.com
✅ 用户信息已保存到数据库
```

### 2. 检查数据库

在 Supabase Dashboard 中查看 `users` 表：

```sql
SELECT id, email, google_id, name, picture
FROM users
WHERE email = 'your-email@example.com';
```

**预期结果:**
- `email` 字段有值
- `google_id` 字段有值（Google OAuth sub）
- `name` 和 `picture` 字段更新为 Google 账号的信息
- 只有一条记录（没有重复）

---

## 📝 注意事项

### 1. google_id 列必须存在

确保数据库中的 `users` 表有 `google_id` 列：

```sql
-- 检查列是否存在
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'google_id';

-- 如果不存在，执行迁移脚本
-- 文件: database/add_extension_sync_fields.sql
```

### 2. RLS 策略

确保 Supabase 的 Row Level Security (RLS) 策略允许：
- 查询用户记录（通过 `google_id` 和 `email`）
- 更新用户记录（更新 `google_id`）
- 插入新用户记录

### 3. 日志监控

修复后，密切关注生产环境的日志：
- 是否有 406 或 409 错误
- 是否有用户登录失败
- 是否有数据库更新错误

---

## 🎉 预期结果

修复后，所有 Google 登录场景都应该正常工作：

- ✅ 新用户可以用 Google 登录并创建账号
- ✅ 测试账号用户可以改用 Google 登录，保留所有数据
- ✅ 已有 Google 登录的用户可以正常登录
- ✅ 不会出现 406 或 409 错误
- ✅ 不会创建重复的用户记录

---

## 🔗 相关文件

- `src/lib/supabase.ts` - `getOrCreateUser()` 函数
- `src/contexts/AuthContext.tsx` - `login()` 函数
- `src/pages/Landing.tsx` - Google OAuth 集成
- `database/add_extension_sync_fields.sql` - 数据库迁移脚本

---

**修复完成！现在可以在生产环境测试 Google 登录了。** 🚀
