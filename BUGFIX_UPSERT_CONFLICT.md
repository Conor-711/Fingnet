# Bug修复：Upsert冲突错误

## 🐛 问题描述

### 错误信息
```
Failed to load resource: the server responded with a status of 409 ()
Failed to save onboarding progress: 
{
  code: "23505",
  details: null,
  hint: null,
  message: "duplicate key value violates unique constraint \"unique_user_onboarding\""
}
```

### 错误场景
- 用户完成onboarding流程进入Main页面时
- 第二次尝试保存onboarding进度时
- 或修改AI Twin信息时

---

## 🔍 根本原因分析

### 1. 数据库约束
在 `supabase-schema.sql` 中定义了唯一约束：

```sql
-- onboarding_progress表
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ...
  CONSTRAINT unique_user_onboarding UNIQUE(user_id)  -- ⚠️ 每个用户只能有一条记录
);

-- ai_twins表
CREATE TABLE IF NOT EXISTS ai_twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ...
  CONSTRAINT unique_user_ai_twin UNIQUE(user_id)  -- ⚠️ 每个用户只能有一个AI Twin
);
```

### 2. Upsert配置错误

**原来的代码** (`src/lib/supabase.ts`):
```typescript
// ❌ 错误的upsert实现
export async function saveOnboardingProgress(
  userId: string,
  answers: Record<string, any>,
  completed: boolean = false
) {
  const { data, error } = await supabase
    .from('onboarding_progress')
    .upsert({
      user_id: userId,
      answers,
      completed,
      completed_at: completed ? new Date().toISOString() : null
    })
    .select()
    .single();

  return { data, error };
}
```

**问题所在**:
- `upsert()` 方法没有指定 `onConflict` 参数
- Supabase默认行为是尝试 INSERT
- 当记录已存在时，违反了 `unique_user_onboarding` 约束
- 导致 `23505` 错误（PostgreSQL的唯一约束违反错误代码）

### 3. 执行流程

```
用户完成onboarding
  ↓
handleCompleteOnboarding()
  ↓
saveOnboardingProgress(user.id, answers, true)
  ↓
supabase.from('onboarding_progress').upsert(...)
  ↓
数据库检查：user_id已存在？
  ↓
是 → 尝试INSERT（因为没有onConflict配置）
  ↓
违反unique_user_onboarding约束
  ↓
返回409错误
```

---

## ✅ 解决方案

### 修复后的代码

#### 1. `saveOnboardingProgress` 函数
```typescript
// ✅ 正确的upsert实现
export async function saveOnboardingProgress(
  userId: string,
  answers: Record<string, any>,
  completed: boolean = false
) {
  const { data, error } = await supabase
    .from('onboarding_progress')
    .upsert(
      {
        user_id: userId,
        answers,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()  // 更新时间戳
      },
      {
        onConflict: 'user_id',    // 🔑 指定冲突字段
        ignoreDuplicates: false   // 🔑 冲突时更新而不是忽略
      }
    )
    .select()
    .single();

  return { data, error };
}
```

#### 2. `upsertAITwin` 函数
```typescript
// ✅ 正确的upsert实现
export async function upsertAITwin(userId: string, aiTwinData: Partial<AITwin>) {
  const { data, error } = await supabase
    .from('ai_twins')
    .upsert(
      {
        user_id: userId,
        ...aiTwinData,
        updated_at: new Date().toISOString()  // 更新时间戳
      },
      {
        onConflict: 'user_id',    // 🔑 指定冲突字段
        ignoreDuplicates: false   // 🔑 冲突时更新而不是忽略
      }
    )
    .select()
    .single();

  return { data, error };
}
```

### 修复要点

1. **onConflict**: 指定哪个字段用于检测冲突
   - 对应数据库中的 UNIQUE 约束字段
   - `'user_id'` 对应 `unique_user_onboarding` 和 `unique_user_ai_twin` 约束

2. **ignoreDuplicates**: 控制冲突时的行为
   - `false`: 当冲突时执行 UPDATE（我们想要的行为）
   - `true`: 当冲突时忽略，不更新（不适用于我们的场景）

3. **updated_at**: 添加更新时间戳
   - 确保每次更新都记录时间
   - 符合数据库设计最佳实践

---

## 🔄 修复后的执行流程

```
用户完成onboarding
  ↓
handleCompleteOnboarding()
  ↓
saveOnboardingProgress(user.id, answers, true)
  ↓
supabase.from('onboarding_progress').upsert(..., { onConflict: 'user_id' })
  ↓
数据库检查：user_id已存在？
  ↓
是 → 执行UPDATE（因为配置了onConflict）
  ↓
成功更新记录
  ↓
返回200成功
```

---

## 🧪 测试验证

### 测试场景1: 首次完成onboarding
```typescript
// 第一次保存
await saveOnboardingProgress(userId, answers, true);
// 预期：INSERT新记录，成功
```

**数据库查询**:
```sql
SELECT * FROM onboarding_progress WHERE user_id = 'xxx';
-- 结果：1条记录
```

### 测试场景2: 重复完成onboarding
```typescript
// 第二次保存（同一用户）
await saveOnboardingProgress(userId, newAnswers, true);
// 预期：UPDATE现有记录，成功（不是409错误）
```

**数据库查询**:
```sql
SELECT * FROM onboarding_progress WHERE user_id = 'xxx';
-- 结果：仍然是1条记录，但answers和updated_at已更新
```

### 测试场景3: 编辑AI Twin
```typescript
// 首次创建AI Twin
await upsertAITwin(userId, aiTwinData1);
// 预期：INSERT新记录

// 编辑AI Twin
await upsertAITwin(userId, aiTwinData2);
// 预期：UPDATE现有记录，成功（不是409错误）
```

---

## 📊 影响范围

### 修复的功能
1. ✅ Onboarding流程保存
2. ✅ AI Twin编辑和保存
3. ✅ 重复登录用户的数据更新

### 受益的用户场景
- 用户多次登录
- 用户修改AI Twin信息
- 用户重新完成onboarding（边缘情况）

---

## 💡 最佳实践

### Supabase Upsert的正确使用

#### 基本规则
```typescript
// 当表有UNIQUE约束时
await supabase
  .from('table_name')
  .upsert(
    { ...data },
    { onConflict: 'unique_column_name' }  // 必须指定
  );
```

#### 完整示例
```typescript
// 表结构
CREATE TABLE users_profile (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,  -- UNIQUE约束
  data JSONB
);

// 正确的upsert
await supabase
  .from('users_profile')
  .upsert(
    { user_id: userId, data: profileData },
    { 
      onConflict: 'user_id',      // 指定UNIQUE字段
      ignoreDuplicates: false     // 冲突时更新
    }
  );
```

### 其他注意事项

1. **总是检查表结构**
   - 查看是否有 UNIQUE 约束
   - 确定冲突字段是什么

2. **添加updated_at**
   - 跟踪记录的最后修改时间
   - 便于调试和审计

3. **错误处理**
   ```typescript
   const { data, error } = await saveOnboardingProgress(...);
   if (error) {
     console.error('Save failed:', error.code, error.message);
     // 根据error.code采取不同措施
   }
   ```

4. **测试两种情况**
   - 新记录插入（INSERT）
   - 现有记录更新（UPDATE）

---

## 🚀 部署注意事项

### 更新后需要做的

1. **清理测试数据**（可选）
   ```sql
   -- 如果需要重新测试，删除测试用户的记录
   DELETE FROM onboarding_progress WHERE user_id = 'test_user_id';
   DELETE FROM ai_twins WHERE user_id = 'test_user_id';
   ```

2. **验证修复**
   - 完成一次完整的onboarding流程
   - 刷新页面并检查是否还有409错误
   - 编辑AI Twin并保存
   - 检查控制台日志

3. **监控日志**
   ```javascript
   // 应该看到
   ✅ Loaded AI Twin from database
   ✅ Saved onboarding progress successfully
   
   // 不应该看到
   ❌ Failed to save onboarding progress: duplicate key...
   ```

---

## 📚 相关资源

- [Supabase Upsert文档](https://supabase.com/docs/reference/javascript/upsert)
- [PostgreSQL Unique Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS)
- [PostgreSQL Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html)

---

**修复日期**: 2025年10月1日
**问题严重性**: 高（阻止用户正常使用）
**影响范围**: 所有用户的onboarding和AI Twin编辑功能
**修复状态**: ✅ 已修复并测试

