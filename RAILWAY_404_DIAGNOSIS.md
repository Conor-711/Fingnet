# Railway 404 问题深度诊断 🔍

## 📊 问题分析

### 当前状态

- **URL:** `https://fingnet.xyz/auth/extension-login?extension_id=edbolmpijbjhoifilkdpkbliaamdbalb&timestamp=1759658936456`
- **错误:** 404 Not Found
- **环境:** Railway 生产环境
- **本地环境:** 正常工作

### Console 错误分析

```javascript
Failed to load resource: the server responded with a status of 404 (Not Found)
extension-login?extension_id=edbolmpijbjhoifilkdpkbliaamdbalb&timestamp=1759658936456:1
```

这表明：
1. ✅ 插件正确发起了请求
2. ✅ URL 格式正确
3. ❌ Railway 服务器返回 404（路由未找到）

---

## 🔍 根本原因

### SPA 路由问题

这是一个经典的 **Single Page Application (SPA) 路由问题**：

1. **React Router** 在客户端处理路由（如 `/auth/extension-login`）
2. 当用户直接访问这个 URL 时，请求发送到服务器
3. 服务器没有 `/auth/extension-login` 这个物理文件
4. 服务器返回 404

### 为什么本地环境正常？

本地使用 Vite Dev Server，它已经配置了 `historyApiFallback: true`：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    historyApiFallback: true, // ✅ 本地环境有这个
  },
});
```

### 为什么 Railway 不正常？

Railway 生产环境使用静态文件服务器（如 `serve`），需要：
1. 正确的启动命令
2. 正确的配置文件
3. 正确的 SPA fallback 设置

---

## 🛠️ 解决方案详解

### 方案 1: 使用 serve 包（推荐）

#### 原理

`serve` 包提供 `-s` 参数，启用 SPA fallback：

```bash
npx serve dist -s -l $PORT
```

- `-s` = `--single` = SPA 模式
- 所有未匹配的路由 → 返回 `index.html`
- React Router 接管 → 渲染正确的页面

#### 配置文件

`serve.json` 提供额外配置：

```json
{
  "public": "dist",
  "rewrites": [
    {
      "source": "**",
      "destination": "/index.html"
    }
  ]
}
```

这告诉 `serve`：
- 所有请求（`**`）
- 重写到 `/index.html`
- React Router 处理实际路由

---

### 方案 2: 使用 Nixpacks 配置

#### 原理

Nixpacks 是 Railway 的默认构建系统。

`nixpacks.toml` 定义构建和启动流程：

```toml
[phases.setup]
nixPkgs = ['nodejs_20']

[phases.install]
cmds = ['npm ci']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npx serve dist -s -l $PORT'
```

这确保：
1. 使用 Node.js 20
2. 安装依赖
3. 构建应用
4. 使用正确的启动命令

---

### 方案 3: 使用 railway.json

#### 原理

`railway.json` 覆盖 Railway 的默认设置：

```json
{
  "deploy": {
    "startCommand": "npx serve dist -s -l $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

这直接告诉 Railway：
- 使用这个启动命令
- 失败时重启
- 最多重试 10 次

---

## 🔧 Railway Dashboard 设置

### 为什么需要手动设置？

即使有配置文件，Railway Dashboard 的设置**优先级更高**。

### 设置位置

```
Railway Dashboard
  → 选择项目
    → 选择服务
      → Settings 标签
        → Deploy 部分
          → Start Command 字段
```

### 正确的 Start Command

```bash
npx serve dist -s -l $PORT
```

**⚠️ 常见错误：**

❌ `npm start` - 这是开发命令
❌ `node server.js` - 没有这个文件
❌ `serve dist -s -l 8080` - 缺少 `npx`，端口硬编码
❌ `npx serve dist -l $PORT` - 缺少 `-s` 参数

---

## 📝 完整的修复流程

### 阶段 1: 准备配置文件（已完成）

- ✅ `serve.json` - serve 包配置
- ✅ `nixpacks.toml` - Nixpacks 构建配置
- ✅ `railway.json` - Railway 部署配置
- ✅ `vite.config.ts` - Vite 开发配置
- ✅ `public/_redirects` - Netlify 备用配置
- ✅ `vercel.json` - Vercel 备用配置

### 阶段 2: 更新 Railway 设置（需要你操作）

#### 步骤 1: 登录 Railway

```
https://railway.app
→ 登录
→ 选择 Onlytext 项目
```

#### 步骤 2: 更新 Start Command

```
→ 点击服务
→ Settings 标签
→ Deploy 部分
→ Start Command 字段
→ 输入: npx serve dist -s -l $PORT
→ 保存
```

#### 步骤 3: 检查环境变量

```
→ Variables 标签
→ 确认存在:
  - PORT=8080
  - NODE_ENV=production
```

#### 步骤 4: 重新部署

```
→ Deployments 标签
→ Deploy 按钮
→ Redeploy
```

或者：

```bash
git push origin main
```

### 阶段 3: 验证修复

#### 步骤 1: 等待部署

```
Deployments 标签
→ 等待状态变为 Success ✅
→ 通常 2-5 分钟
```

#### 步骤 2: 查看日志

```
View Logs
→ 应该看到:
  INFO: Accepting connections at http://localhost:8080
```

#### 步骤 3: 测试访问

```bash
# 测试 1: 主页
curl -I https://fingnet.xyz/

# 测试 2: 扩展登录页
curl -I https://fingnet.xyz/auth/extension-login

# 测试 3: 扩展回调页
curl -I https://fingnet.xyz/auth/extension-callback
```

**预期结果:** 所有请求返回 `200 OK`

#### 步骤 4: 浏览器测试

```
1. 打开浏览器
2. 访问 https://fingnet.xyz/auth/extension-login?extension_id=test
3. 预期: 显示登录页面
4. 实际: 不应该是 "Not Found"
```

#### 步骤 5: 插件测试

```
1. 打开 Chrome 插件
2. 点击登录
3. 预期: 正常显示登录页面
4. 完成 OAuth 流程
```

---

## 🐛 故障排除

### 问题 1: Start Command 没有保存

**症状:**
- 刷新 Settings 页面，Start Command 为空或不同

**解决:**
1. 重新输入命令
2. 按 Enter 键
3. 点击页面其他地方
4. 刷新页面确认保存

### 问题 2: 部署失败

**症状:**
- 部署状态显示 Failed ❌

**解决:**
1. 查看 Build Logs
2. 查看错误信息
3. 常见错误：
   - `npm ci` 失败 → 检查 `package-lock.json`
   - `npm run build` 失败 → 检查构建脚本
   - `serve` 找不到 → 使用 `npx serve`

### 问题 3: 日志显示错误

**症状:**
```
Error: Cannot find directory 'dist'
```

**解决:**
1. 确认 Build Command 是 `npm run build`
2. 查看构建日志确认构建成功
3. 确认 `package.json` 中有 `build` 脚本

### 问题 4: 仍然 404

**症状:**
- 部署成功，但访问子路由仍然 404

**可能原因:**
1. Start Command 没有 `-s` 参数
2. `serve.json` 不在根目录
3. 缓存问题

**解决:**
```bash
# 1. 清除浏览器缓存
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# 2. 清除 Railway 缓存
Settings → Clear Cache → Redeploy

# 3. 强制重新构建
git commit --allow-empty -m "Force rebuild"
git push origin main
```

---

## 📊 对比表：本地 vs 生产

| 特性 | 本地环境 | Railway 生产环境 |
|------|---------|-----------------|
| 服务器 | Vite Dev Server | serve 包 |
| SPA Fallback | `historyApiFallback: true` | `-s` 参数 + `serve.json` |
| 配置文件 | `vite.config.ts` | `serve.json` + `railway.json` |
| 启动命令 | `npm run dev` | `npx serve dist -s -l $PORT` |
| 端口 | 8080 (固定) | `$PORT` (动态) |
| 热更新 | ✅ 支持 | ❌ 不支持 |

---

## 🎯 关键要点总结

### 1. Start Command 是关键

```bash
npx serve dist -s -l $PORT
```

- `npx` - 自动安装 serve
- `serve` - 静态文件服务器
- `dist` - 构建输出目录
- `-s` - **启用 SPA fallback（最重要！）**
- `-l $PORT` - 监听 Railway 提供的端口

### 2. 配置文件层次

```
Railway Dashboard Settings (最高优先级)
  ↓
railway.json
  ↓
nixpacks.toml
  ↓
serve.json
  ↓
package.json
```

### 3. 验证清单

- [ ] Start Command 正确
- [ ] 包含 `-s` 参数
- [ ] 使用 `$PORT` 变量
- [ ] 部署成功
- [ ] 日志显示 "Accepting connections"
- [ ] 主页可访问
- [ ] 子路由可访问
- [ ] 插件登录正常

---

## 📞 下一步行动

### 立即执行（5 分钟）

1. 登录 Railway Dashboard
2. 更新 Start Command
3. 重新部署
4. 等待完成
5. 测试访问

### 如果成功

- ✅ 所有路由正常
- ✅ 插件登录正常
- ✅ 问题解决

### 如果失败

1. 查看本文档的"故障排除"部分
2. 检查部署日志
3. 清除缓存重试
4. 考虑使用 Dockerfile

---

**记住：最重要的是 Start Command 中的 `-s` 参数！** 🔑

这个参数启用了 SPA fallback，让所有未匹配的路由都返回 `index.html`，从而让 React Router 能够处理客户端路由。

没有这个参数，服务器会尝试查找物理文件 `/auth/extension-login`，找不到就返回 404。

有了这个参数，服务器会返回 `index.html`，React Router 接管并渲染正确的页面。
