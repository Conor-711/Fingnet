# Railway Dashboard 检查清单 ✅

## 🎯 目标

确保 Railway 使用正确的启动命令来支持 SPA 路由。

---

## 📋 详细检查步骤

### 步骤 1: 登录 Railway

1. 访问 https://railway.app
2. 使用你的账号登录
3. 你应该看到你的项目列表

### 步骤 2: 选择项目和服务

1. 找到并点击 `Onlytext` 项目（或你的项目名称）
2. 你会看到项目的服务列表
3. 点击你的 Web 服务（通常名为 `web` 或显示你的仓库名）

### 步骤 3: 检查 Settings

点击顶部的 **Settings** 标签。

---

## 🔍 关键设置检查

### 检查项 1: Start Command

#### 位置
```
Settings → Deploy 部分 → Start Command 字段
```

#### 应该是什么？

**选项 A（推荐）:** 留空

让 Railway 使用 `Procfile` 或配置文件。

**选项 B:** 手动设置

```bash
npx serve dist -s -l $PORT
```

#### ⚠️ 常见错误

❌ `npm start`
❌ `node server.js`
❌ `npx serve dist -l $PORT`（缺少 `-s`）
❌ `npx serve dist -s -l 8080`（硬编码端口）

#### 如何修复？

1. 如果字段有错误的命令，删除它或改为正确的命令
2. 点击字段外的地方保存
3. 刷新页面确认保存成功

---

### 检查项 2: Build Command

#### 位置
```
Settings → Build 部分 → Build Command 字段
```

#### 应该是什么？

**选项 A（推荐）:** 留空

让 Railway 自动检测（会使用 `npm run build`）。

**选项 B:** 手动设置

```bash
npm run build
```

#### ⚠️ 常见错误

❌ `npm start`
❌ `vite build`（应该通过 npm script 调用）

---

### 检查项 3: Root Directory

#### 位置
```
Settings → Build 部分 → Root Directory 字段
```

#### 应该是什么？

留空或 `/`

#### ⚠️ 常见错误

❌ `/dist`
❌ `/src`
❌ 其他路径

---

### 检查项 4: Builder

#### 位置
```
Settings → Build 部分 → Builder 下拉菜单
```

#### 应该是什么？

**选项 A（推荐）:** `NIXPACKS`

Railway 的默认构建系统，会使用 `nixpacks.toml`。

**选项 B:** `DOCKERFILE`

如果你想使用自定义 Dockerfile。

#### ⚠️ 注意

如果选择 `DOCKERFILE`，确保项目根目录有 `Dockerfile`。

---

### 检查项 5: Environment Variables

#### 位置
```
点击顶部的 Variables 标签
```

#### 应该有什么？

Railway 会自动设置以下变量：

- `PORT` - Railway 分配的端口（自动）
- `RAILWAY_ENVIRONMENT` - 环境名称（自动）

你可以添加：

- `NODE_ENV=production`

#### ⚠️ 注意

**不要**手动设置 `PORT` 变量，让 Railway 自动管理。

---

## 📊 部署日志检查

### 步骤 1: 查看部署列表

点击顶部的 **Deployments** 标签。

### 步骤 2: 选择最新部署

点击列表中最上面的部署（最新的）。

### 步骤 3: 查看 Build Logs

#### 应该看到：

```
Installing dependencies...
✓ npm ci completed

Building application...
vite v5.x.x building for production...
transforming...
✓ 1935 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.XX kB │ gzip: 0.XX kB
dist/assets/index-XXXXX.css      XX.XX kB │ gzip: XX.XX kB
dist/assets/index-XXXXX.js      XXX.XX kB │ gzip: XX.XX kB
✓ built in X.XXs
```

#### 不应该看到：

```
❌ Error: Cannot find module
❌ Build failed
❌ npm ERR!
```

### 步骤 4: 查看 Deploy Logs

点击 **Deploy Logs** 或 **View Logs**。

#### 应该看到：

```
Starting application...
npx: installed X packages in Xs

   ┌────────────────────────────────────────┐
   │                                        │
   │   Serving!                             │
   │                                        │
   │   - Local:    http://localhost:XXXX   │
   │   - Network:  http://0.0.0.0:XXXX     │
   │                                        │
   │   Copied local address to clipboard!   │
   │                                        │
   └────────────────────────────────────────┘

INFO: Accepting connections at http://localhost:XXXX
```

或类似的成功消息。

#### 不应该看到：

```
❌ Error: Cannot find module 'serve'
❌ Error: Cannot find directory 'dist'
❌ Error: ENOENT: no such file or directory
❌ Error: Port XXXX is already in use
```

---

## 🐛 常见问题诊断

### 问题 1: Build Logs 显示构建失败

**可能原因:**
- 依赖安装失败
- TypeScript 编译错误
- Vite 构建错误

**解决方案:**
1. 在本地运行 `npm run build` 确认可以构建
2. 检查 `package.json` 和 `package-lock.json`
3. 确认所有依赖都在 `dependencies` 或 `devDependencies` 中

### 问题 2: Deploy Logs 显示 "Cannot find module 'serve'"

**可能原因:**
- 启动命令没有使用 `npx`

**解决方案:**
确认启动命令是：
```bash
npx serve dist -s -l $PORT
```

不是：
```bash
serve dist -s -l $PORT  # ❌ 缺少 npx
```

### 问题 3: Deploy Logs 显示 "Cannot find directory 'dist'"

**可能原因:**
- 构建失败
- 输出目录路径错误

**解决方案:**
1. 检查 Build Logs 确认构建成功
2. 确认 `vite.config.ts` 中 `build.outDir` 是 `dist`
3. 确认 Root Directory 设置正确

### 问题 4: 部署成功但访问 404

**可能原因:**
- 启动命令缺少 `-s` 参数

**解决方案:**
确认启动命令包含 `-s` 参数：
```bash
npx serve dist -s -l $PORT
```

### 问题 5: 主页正常，子路由 404

**可能原因:**
- 同上，缺少 `-s` 参数

**解决方案:**
添加 `-s` 参数启用 SPA fallback。

---

## 🔄 强制重新部署

如果修改了设置，需要重新部署：

### 方法 1: 通过 Dashboard

1. 在 **Deployments** 标签中
2. 点击右上角的 **Deploy** 按钮
3. 选择 **Redeploy**

### 方法 2: 通过 Git

```bash
git commit --allow-empty -m "Trigger Railway redeploy"
git push origin main
```

### 方法 3: 清除缓存后重新部署

1. 在 **Settings** 标签中
2. 向下滚动到底部
3. 找到 **Clear Cache** 或 **Reset** 按钮
4. 点击清除缓存
5. 然后重新部署

---

## ✅ 成功标志

当一切正常时，你应该看到：

### 1. Settings 正确

- ✅ Start Command 是空的或正确的
- ✅ Build Command 是空的或 `npm run build`
- ✅ Root Directory 是空的或 `/`
- ✅ Builder 是 `NIXPACKS`

### 2. Build Logs 成功

- ✅ 看到 `✓ built in X.XXs`
- ✅ 看到 `dist/` 目录被创建
- ✅ 没有错误信息

### 3. Deploy Logs 成功

- ✅ 看到 `Serving!` 或 `Accepting connections`
- ✅ 没有错误信息

### 4. 网站访问正常

- ✅ `https://fingnet.xyz/` → 显示主页
- ✅ `https://fingnet.xyz/auth/extension-login` → 显示登录页（不是 404）
- ✅ `https://fingnet.xyz/auth/extension-callback` → 显示回调页（不是 404）

### 5. 插件登录正常

- ✅ 从插件打开登录 → 显示登录页面
- ✅ 完成 OAuth 流程 → 正常
- ✅ 回调成功 → 数据传回插件

---

## 📝 完整的检查清单（打印版）

打印这个清单，逐项检查：

```
Railway Dashboard 检查清单

□ 1. 登录 Railway (https://railway.app)
□ 2. 选择 Onlytext 项目
□ 3. 点击 Web 服务
□ 4. 进入 Settings 标签

Settings 检查：
□ 5. Start Command: 空的或 "npx serve dist -s -l $PORT"
□ 6. Build Command: 空的或 "npm run build"
□ 7. Root Directory: 空的或 "/"
□ 8. Builder: NIXPACKS

□ 9. 进入 Variables 标签
□ 10. 确认 PORT 变量存在（自动）
□ 11. 添加 NODE_ENV=production（可选）

□ 12. 进入 Deployments 标签
□ 13. 点击最新部署
□ 14. 查看 Build Logs - 确认构建成功
□ 15. 查看 Deploy Logs - 确认启动成功

□ 16. 如果有修改，点击 Redeploy
□ 17. 等待部署完成（2-5 分钟）

测试：
□ 18. 访问 https://fingnet.xyz/ - 正常
□ 19. 访问 https://fingnet.xyz/auth/extension-login - 正常
□ 20. 从插件登录 - 正常

✅ 全部完成！
```

---

## 📞 如果还是不行

### 1. 截图发送

请截图以下内容：

- Settings → Deploy 部分（显示 Start Command）
- Settings → Build 部分（显示 Build Command 和 Builder）
- Deployments → 最新部署 → Build Logs（最后 50 行）
- Deployments → 最新部署 → Deploy Logs（最后 50 行）

### 2. 尝试 Dockerfile

如果所有方法都失败，使用 Dockerfile：

1. 在 Settings → Build → Builder
2. 选择 **DOCKERFILE**
3. 保存并重新部署

项目中已经有 Dockerfile 配置（在 `nixpacks.toml` 中定义）。

### 3. 联系 Railway 支持

如果问题仍然存在，可能是 Railway 平台的问题。

访问 Railway Discord 或支持页面寻求帮助。

---

**记住：最重要的是 Start Command 中的 `-s` 参数！** 🔑

这个参数启用 SPA fallback，让 React Router 能够处理客户端路由。
