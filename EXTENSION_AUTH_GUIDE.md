# Chrome 插件 Google 登录集成指南

## 📋 概述

本指南说明如何让 Chrome 插件复用网站的 Google OAuth 登录流程，实现用户数据在插件和网站之间的同步。

---

## 🏗️ 架构说明

### 数据流程

```
插件 → 打开网站登录页 → Google OAuth → 回调页 → postMessage → 插件
```

### 关键组件

1. **ExtensionLogin** (`/auth/extension-login`)
   - 检测来源
   - 检查登录状态
   - 触发 OAuth 或跳转回调

2. **ExtensionCallback** (`/auth/extension-callback`)
   - 接收 OAuth 回调
   - 获取用户数据
   - 发送数据给插件

3. **Extension API** (`src/services/extensionApi.ts`)
   - Token 验证
   - 用户资料获取/更新
   - Token 刷新

---

## 🚀 插件端实现

### 1. 打开登录窗口

```javascript
// 在插件的 background.js 或 popup.js 中
function openLoginWindow() {
  const extensionId = chrome.runtime.id;
  
  // 支持两种 URL 格式（推荐使用第一种）
  // 格式 1: 使用 source 和 ext_id 参数
  const loginUrl = `https://fingnet.xyz/auth/extension-login?source=extension&ext_id=${extensionId}`;
  
  // 格式 2: 只使用 extension_id 参数（兼容）
  // const loginUrl = `https://fingnet.xyz/auth/extension-login?extension_id=${extensionId}`;
  
  // 创建新窗口
  chrome.windows.create({
    url: loginUrl,
    type: 'popup',
    width: 500,
    height: 700,
    focused: true
  }, (window) => {
    console.log('Login window opened:', window.id);
  });
}
```

### 2. 监听登录成功消息

```javascript
// 在插件的 background.js 中
window.addEventListener('message', async (event) => {
  // 安全检查：验证消息来源
  if (event.origin !== 'https://fingnet.xyz') {
    return;
  }

  const { type, session, profile, aiTwin, needsOnboarding, isFirstLogin } = event.data;

  if (type === 'FINGNET_AUTH_SUCCESS') {
    console.log('✅ 登录成功！');
    console.log('用户信息:', profile);
    console.log('需要 Onboarding?', needsOnboarding);
    console.log('AI Twin:', aiTwin);

    // 存储 session 到 chrome.storage
    await chrome.storage.local.set({
      fingnet_session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: session.user
      },
      fingnet_profile: profile,
      fingnet_ai_twin: aiTwin,
      fingnet_needs_onboarding: needsOnboarding
    });

    // 通知插件其他部分登录成功
    chrome.runtime.sendMessage({
      type: 'LOGIN_SUCCESS',
      profile,
      aiTwin,
      needsOnboarding
    });
  } else if (type === 'FINGNET_AUTH_ERROR') {
    console.error('❌ 登录失败:', event.data.error);
    
    // 通知用户
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Login Failed',
      message: event.data.error
    });
  }
});
```

### 3. 检查登录状态

```javascript
// 检查用户是否已登录
async function checkLoginStatus() {
  const data = await chrome.storage.local.get([
    'fingnet_session',
    'fingnet_profile'
  ]);

  if (!data.fingnet_session) {
    return { isLoggedIn: false };
  }

  // 检查 token 是否过期
  const expiresAt = data.fingnet_session.expires_at * 1000; // 转换为毫秒
  const now = Date.now();

  if (now >= expiresAt) {
    // Token 已过期，尝试刷新
    const refreshed = await refreshToken(data.fingnet_session.refresh_token);
    if (!refreshed) {
      return { isLoggedIn: false };
    }
  }

  return {
    isLoggedIn: true,
    profile: data.fingnet_profile
  };
}
```

### 4. 刷新 Token

```javascript
// 刷新过期的 token
async function refreshToken(refreshToken) {
  try {
    const response = await fetch('https://fingnet.xyz/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const { session } = await response.json();

    // 更新存储
    await chrome.storage.local.set({
      fingnet_session: session
    });

    return true;
  } catch (error) {
    console.error('❌ Token 刷新失败:', error);
    
    // 清除过期数据
    await chrome.storage.local.remove([
      'fingnet_session',
      'fingnet_profile',
      'fingnet_ai_twin'
    ]);

    return false;
  }
}
```

### 5. 获取最新用户数据

```javascript
// 从网站获取最新的用户数据
async function syncUserData() {
  const { fingnet_session } = await chrome.storage.local.get('fingnet_session');

  if (!fingnet_session) {
    throw new Error('Not logged in');
  }

  try {
    const response = await fetch('https://fingnet.xyz/api/auth/extension/profile', {
      headers: {
        'Authorization': `Bearer ${fingnet_session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const { data } = await response.json();

    // 更新本地存储
    await chrome.storage.local.set({
      fingnet_profile: data.profile,
      fingnet_ai_twin: data.aiTwin,
      fingnet_needs_onboarding: data.needsOnboarding
    });

    return data;
  } catch (error) {
    console.error('❌ 同步用户数据失败:', error);
    throw error;
  }
}
```

### 6. 更新用户资料

```javascript
// 在插件中更新用户资料
async function updateProfile(updates) {
  const { fingnet_session } = await chrome.storage.local.get('fingnet_session');

  if (!fingnet_session) {
    throw new Error('Not logged in');
  }

  try {
    const response = await fetch('https://fingnet.xyz/api/auth/extension/profile', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${fingnet_session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const { data } = await response.json();

    // 更新本地存储
    await chrome.storage.local.set({
      fingnet_profile: data
    });

    return data;
  } catch (error) {
    console.error('❌ 更新用户资料失败:', error);
    throw error;
  }
}
```

---

## 🔒 安全性考虑

### 1. Origin 验证

```javascript
// ✅ 正确：验证消息来源
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://fingnet.xyz') {
    console.warn('⚠️ 忽略来自未知来源的消息:', event.origin);
    return;
  }
  // 处理消息...
});

// ❌ 错误：不验证来源
window.addEventListener('message', (event) => {
  // 直接处理，不安全！
  handleMessage(event.data);
});
```

### 2. Token 存储

```javascript
// ✅ 正确：使用 chrome.storage.local（加密存储）
await chrome.storage.local.set({
  fingnet_session: session
});

// ❌ 错误：使用 localStorage（不安全）
localStorage.setItem('fingnet_session', JSON.stringify(session));
```

### 3. HTTPS Only

- ✅ 生产环境必须使用 HTTPS
- ✅ 开发环境可以使用 localhost

---

## 📊 数据同步策略

### 场景 1: 用户先在插件登录

```
1. 插件打开登录窗口
2. 用户完成 Google OAuth
3. 网站创建用户记录（基于 Google 数据）
4. 回调页发送数据给插件
5. 插件存储 session 和 profile
6. needsOnboarding = true
7. 插件引导用户完善资料（或跳转到网站完成）
```

### 场景 2: 用户先在网站登录

```
1. 用户在网站完成 Google OAuth
2. 用户完成 onboarding，创建 AI Twin
3. 用户后续在插件登录
4. 插件获取完整的 profile 和 AI Twin
5. needsOnboarding = false
6. 插件直接使用数据
```

### 场景 3: 数据更新同步

```javascript
// 定期检查数据是否需要同步
setInterval(async () => {
  const { fingnet_profile } = await chrome.storage.local.get('fingnet_profile');
  
  if (!fingnet_profile) return;

  // 检查同步状态
  const response = await fetch(
    `https://fingnet.xyz/api/auth/extension/sync-status?user_id=${fingnet_profile.id}`
  );
  
  const { needsSync } = await response.json();

  if (needsSync) {
    console.log('🔄 检测到数据更新，开始同步...');
    await syncUserData();
  }
}, 60000); // 每分钟检查一次
```

---

## 🧪 测试步骤

### 1. 测试首次登录（插件 → 网站）

1. 清空插件存储
2. 点击插件登录按钮
3. 完成 Google OAuth
4. 验证插件收到用户数据
5. 验证 `needsOnboarding = true`

### 2. 测试已有账号登录

1. 在网站完成注册和 onboarding
2. 在插件点击登录
3. 验证插件收到完整数据
4. 验证 `needsOnboarding = false`
5. 验证 AI Twin 数据存在

### 3. 测试 Token 刷新

1. 等待 token 过期（或手动修改过期时间）
2. 触发需要认证的操作
3. 验证自动刷新 token
4. 验证操作成功完成

### 4. 测试数据同步

1. 在网站修改用户资料
2. 在插件触发同步
3. 验证插件数据已更新

---

## 📝 API 端点说明

### 1. 获取用户资料

```
GET /api/auth/extension/profile
Headers:
  Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
    "profile": { ... },
    "aiTwin": { ... },
    "needsOnboarding": false
  }
}
```

### 2. 更新用户资料

```
PATCH /api/auth/extension/profile
Headers:
  Authorization: Bearer <access_token>
  Content-Type: application/json
Body:
{
  "name": "New Name",
  "picture": "https://..."
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### 3. 验证 Token

```
POST /api/auth/extension/verify
Headers:
  Authorization: Bearer <access_token>

Response:
{
  "valid": true,
  "userId": "uuid",
  "expiresAt": 1234567890
}
```

### 4. 刷新 Token

```
POST /api/auth/refresh
Body:
{
  "refresh_token": "..."
}

Response:
{
  "success": true,
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_at": 1234567890
  }
}
```

---

## 🐛 常见问题

### Q1: postMessage 没有收到？

**A:** 检查以下几点：
- 确认 `window.opener` 存在
- 确认 origin 验证正确
- 确认消息监听器已注册
- 检查浏览器控制台是否有错误

### Q2: Token 过期后无法刷新？

**A:** 
- 检查 refresh_token 是否正确存储
- 检查刷新 API 是否正常工作
- 确认 Supabase 配置正确

### Q3: 用户数据不同步？

**A:**
- 检查 `last_synced_at` 字段
- 手动触发同步
- 检查网络请求是否成功

### Q4: 弹窗被浏览器拦截？

**A:**
- 使用 `chrome.windows.create()` 而不是 `window.open()`
- 确保在用户操作（点击）后触发

---

## 📚 相关文件

- `/src/pages/auth/ExtensionLogin.tsx` - 登录页
- `/src/pages/auth/ExtensionCallback.tsx` - 回调页
- `/src/services/extensionApi.ts` - API 服务
- `/database/add_extension_sync_fields.sql` - 数据库 Schema

---

## ✅ 部署清单

- [ ] 在 Supabase 执行 SQL 脚本添加同步字段
- [ ] 部署网站到生产环境
- [ ] 配置 Google OAuth 回调 URL
- [ ] 测试插件登录流程
- [ ] 测试数据同步功能
- [ ] 监控错误日志

---

## 🎉 完成！

现在你的 Chrome 插件可以复用网站的 Google 登录了！用户在任一端登录后，数据会自动同步。
