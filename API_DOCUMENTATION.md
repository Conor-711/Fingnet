# Extension API 文档

## 📋 概述

本文档说明如何使用 Extension API 来管理用户认证和数据同步。

---

## 🔗 API 端点

### Base URL
```
开发环境: http://localhost:8080/api/extension
生产环境: https://fingnet.xyz/api/extension
```

---

## 🔐 认证

所有 API 请求都需要在 URL 参数中提供 `token`（access_token）。

```
/api/extension?action=profile&token=YOUR_ACCESS_TOKEN
```

---

## 📚 API 列表

### 1. 验证 Token

验证 access_token 是否有效。

#### 请求
```
GET /api/extension?action=verify&token=YOUR_ACCESS_TOKEN
```

#### 响应
```json
{
  "valid": true,
  "userId": "uuid-string",
  "expiresAt": 1234567890
}
```

#### 错误响应
```json
{
  "valid": false,
  "error": "Invalid token"
}
```

#### 使用示例
```javascript
const response = await fetch(
  `https://fingnet.xyz/api/extension?action=verify&token=${accessToken}`
);
const result = await response.json();

if (result.valid) {
  console.log('Token 有效，用户 ID:', result.userId);
} else {
  console.log('Token 无效:', result.error);
}
```

---

### 2. 获取用户资料

获取用户的完整资料，包括 profile、AI Twin 和 onboarding 状态。

#### 请求
```
GET /api/extension?action=profile&token=YOUR_ACCESS_TOKEN
```

#### 响应
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "picture": "https://...",
      "google_id": "google-id",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    "aiTwin": {
      "id": "uuid",
      "name": "John's AI Twin",
      "avatar": "https://...",
      "personality": "...",
      "goals": ["goal1", "goal2"],
      "offers": ["offer1", "offer2"],
      "lookings": ["looking1", "looking2"]
    },
    "needsOnboarding": false
  }
}
```

#### 错误响应
```json
{
  "success": false,
  "error": "User not found"
}
```

#### 使用示例
```javascript
const response = await fetch(
  `https://fingnet.xyz/api/extension?action=profile&token=${accessToken}`
);
const result = await response.json();

if (result.success) {
  const { profile, aiTwin, needsOnboarding } = result.data;
  
  console.log('用户名:', profile.name);
  console.log('需要 Onboarding?', needsOnboarding);
  
  if (aiTwin) {
    console.log('AI Twin:', aiTwin.name);
  }
} else {
  console.error('获取失败:', result.error);
}
```

---

### 3. 更新用户资料

更新用户的名字或头像。

#### 请求
```
GET /api/extension?action=update&token=YOUR_ACCESS_TOKEN&name=New%20Name&picture=https://...
```

#### 参数
- `token` (必需): Access token
- `name` (可选): 新的用户名
- `picture` (可选): 新的头像 URL

#### 响应
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "New Name",
    "picture": "https://...",
    "google_id": "google-id",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T12:00:00Z",
    "last_synced_at": "2025-01-01T12:00:00Z",
    "sync_source": "extension"
  }
}
```

#### 错误响应
```json
{
  "success": false,
  "error": "Invalid token"
}
```

#### 使用示例
```javascript
const newName = 'John Smith';
const newPicture = 'https://example.com/avatar.jpg';

const response = await fetch(
  `https://fingnet.xyz/api/extension?action=update&token=${accessToken}&name=${encodeURIComponent(newName)}&picture=${encodeURIComponent(newPicture)}`
);
const result = await response.json();

if (result.success) {
  console.log('更新成功:', result.data);
  
  // 更新本地存储
  await chrome.storage.local.set({
    fingnet_profile: result.data
  });
} else {
  console.error('更新失败:', result.error);
}
```

---

### 4. 刷新 Token

使用 refresh_token 获取新的 access_token。

#### 请求
```
GET /api/extension?action=refresh&refresh_token=YOUR_REFRESH_TOKEN
```

#### 响应
```json
{
  "success": true,
  "session": {
    "access_token": "new-access-token",
    "refresh_token": "new-refresh-token",
    "expires_at": 1234567890,
    "expires_in": 3600
  }
}
```

#### 错误响应
```json
{
  "success": false,
  "error": "Failed to refresh token"
}
```

#### 使用示例
```javascript
async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch(
      `https://fingnet.xyz/api/extension?action=refresh&refresh_token=${refreshToken}`
    );
    const result = await response.json();

    if (result.success) {
      const { session } = result;
      
      // 更新存储
      await chrome.storage.local.set({
        fingnet_session: session
      });
      
      console.log('Token 刷新成功');
      return session.access_token;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Token 刷新失败:', error);
    
    // 清除过期数据，要求重新登录
    await chrome.storage.local.remove([
      'fingnet_session',
      'fingnet_profile',
      'fingnet_ai_twin'
    ]);
    
    return null;
  }
}
```

---

## 🔄 完整的 Token 管理流程

### 检查 Token 是否过期

```javascript
async function isTokenExpired() {
  const { fingnet_session } = await chrome.storage.local.get('fingnet_session');
  
  if (!fingnet_session) {
    return true; // 没有 session，视为过期
  }

  const expiresAt = fingnet_session.expires_at * 1000; // 转换为毫秒
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 提前 5 分钟刷新

  return now >= (expiresAt - bufferTime);
}
```

### 自动刷新 Token

```javascript
async function ensureValidToken() {
  const { fingnet_session } = await chrome.storage.local.get('fingnet_session');
  
  if (!fingnet_session) {
    throw new Error('Not logged in');
  }

  // 检查是否需要刷新
  if (await isTokenExpired()) {
    console.log('Token 即将过期，开始刷新...');
    const newAccessToken = await refreshAccessToken(fingnet_session.refresh_token);
    
    if (!newAccessToken) {
      throw new Error('Failed to refresh token');
    }
    
    return newAccessToken;
  }

  return fingnet_session.access_token;
}
```

### 在 API 调用前使用

```javascript
async function callApi(action, params = {}) {
  try {
    // 确保 token 有效
    const accessToken = await ensureValidToken();
    
    // 构建 URL
    const url = new URL('https://fingnet.xyz/api/extension');
    url.searchParams.set('action', action);
    url.searchParams.set('token', accessToken);
    
    // 添加其他参数
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    // 发起请求
    const response = await fetch(url.toString());
    const result = await response.json();

    return result;
  } catch (error) {
    console.error('API 调用失败:', error);
    throw error;
  }
}

// 使用示例
const profile = await callApi('profile');
const updated = await callApi('update', { name: 'New Name' });
```

---

## 🔒 安全最佳实践

### 1. 永远不要在日志中打印完整 Token

```javascript
// ❌ 错误
console.log('Token:', accessToken);

// ✅ 正确
console.log('Token:', accessToken.substring(0, 10) + '...');
```

### 2. 使用 HTTPS

```javascript
// ✅ 生产环境必须使用 HTTPS
const API_BASE = 'https://fingnet.xyz/api/extension';

// ⚠️ 开发环境可以使用 HTTP
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080/api/extension'
  : 'https://fingnet.xyz/api/extension';
```

### 3. 安全存储 Token

```javascript
// ✅ 使用 chrome.storage.local（加密）
await chrome.storage.local.set({
  fingnet_session: session
});

// ❌ 不要使用 localStorage（不安全）
localStorage.setItem('fingnet_session', JSON.stringify(session));
```

### 4. 处理 Token 过期

```javascript
// 监听 API 错误，自动处理 token 过期
async function apiCall(action, params) {
  try {
    const result = await callApi(action, params);
    return result;
  } catch (error) {
    if (error.message.includes('Invalid token')) {
      // Token 无效，尝试刷新
      await refreshAccessToken();
      // 重试
      return callApi(action, params);
    }
    throw error;
  }
}
```

---

## 📊 错误码

| 错误消息 | 原因 | 解决方案 |
|---------|------|---------|
| `Missing token` | 未提供 access_token | 检查 URL 参数 |
| `Invalid token` | Token 无效或过期 | 刷新 token 或重新登录 |
| `User not found` | 用户不存在 | 检查用户 ID |
| `Failed to refresh token` | Refresh token 无效 | 要求用户重新登录 |
| `Invalid action` | 不支持的 action | 检查 action 参数 |

---

## 🧪 测试 API

### 使用测试页面

1. 打开 `test-extension-auth.html`
2. 点击 "Open Login Window" 登录
3. 登录成功后，测试各个 API：
   - Get Profile
   - Update Profile
   - Refresh Token

### 使用 curl

```bash
# 验证 Token
curl "http://localhost:8080/api/extension?action=verify&token=YOUR_TOKEN"

# 获取用户资料
curl "http://localhost:8080/api/extension?action=profile&token=YOUR_TOKEN"

# 更新用户资料
curl "http://localhost:8080/api/extension?action=update&token=YOUR_TOKEN&name=New%20Name"

# 刷新 Token
curl "http://localhost:8080/api/extension?action=refresh&refresh_token=YOUR_REFRESH_TOKEN"
```

---

## 📝 完整示例：插件集成

```javascript
// background.js

// 登录
async function login() {
  chrome.windows.create({
    url: 'https://fingnet.xyz/auth/extension-login?source=extension&ext_id=' + chrome.runtime.id,
    type: 'popup',
    width: 500,
    height: 700
  });
}

// 监听登录成功
window.addEventListener('message', async (event) => {
  if (event.origin !== 'https://fingnet.xyz') return;
  
  if (event.data.type === 'FINGNET_AUTH_SUCCESS') {
    const { session, profile, aiTwin } = event.data;
    
    await chrome.storage.local.set({
      fingnet_session: session,
      fingnet_profile: profile,
      fingnet_ai_twin: aiTwin
    });
    
    console.log('✅ 登录成功');
  }
});

// 获取用户资料
async function getUserProfile() {
  const token = await ensureValidToken();
  const response = await fetch(
    `https://fingnet.xyz/api/extension?action=profile&token=${token}`
  );
  return response.json();
}

// 更新用户资料
async function updateUserProfile(name, picture) {
  const token = await ensureValidToken();
  const url = new URL('https://fingnet.xyz/api/extension');
  url.searchParams.set('action', 'update');
  url.searchParams.set('token', token);
  if (name) url.searchParams.set('name', name);
  if (picture) url.searchParams.set('picture', picture);
  
  const response = await fetch(url.toString());
  return response.json();
}

// Token 管理
async function ensureValidToken() {
  const { fingnet_session } = await chrome.storage.local.get('fingnet_session');
  
  if (!fingnet_session) {
    throw new Error('Not logged in');
  }

  const expiresAt = fingnet_session.expires_at * 1000;
  const now = Date.now();
  
  if (now >= expiresAt - 5 * 60 * 1000) {
    // 刷新 token
    const response = await fetch(
      `https://fingnet.xyz/api/extension?action=refresh&refresh_token=${fingnet_session.refresh_token}`
    );
    const result = await response.json();
    
    if (result.success) {
      await chrome.storage.local.set({
        fingnet_session: result.session
      });
      return result.session.access_token;
    } else {
      throw new Error('Failed to refresh token');
    }
  }

  return fingnet_session.access_token;
}
```

---

## 🎉 完成！

现在你可以在 Chrome 插件中使用这些 API 来管理用户认证和数据同步了！
