# Railway 部署设置指南 - 修复 SPA 404 问题

## 🎯 问题

部署到 Railway 后，访问 `/auth/extension-login` 仍然返回 404。

## 🔍 原因

Railway 可能使用了错误的启动命令，或者没有正确配置 SPA fallback。

---

## ✅ 解决方案：Railway 设置步骤

### 步骤 1: 登录 Railway Dashboard

1. 访问 https://railway.app
2. 登录你的账号
3. 选择 `Onlytext` 项目

---

### 步骤 2: 检查并更新环境变量

1. 点击你的服务（Service）
2. 点击 **Variables** 标签
3. 确认以下环境变量存在：

```
PORT=8080
NODE_ENV=production
```

如果不存在，点击 **+ New Variable** 添加。

---

### 步骤 3: 更新启动命令（最重要！）

#### 方法 A: 使用 Railway Dashboard

1. 点击你的服务
2. 点击 **Settings** 标签
3. 找到 **Deploy** 部分
4. 找到 **Start Command** 字段
5. 输入以下命令：

```bash
npx serve dist -s -l $PORT
```

6. 点击 **Save** 或 **Update**

#### 方法 B: 使用 railway.json（已配置）

确认 `railway.json` 文件内容：

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npx serve dist -s -l $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

✅ 这个文件已经正确配置。

---

### 步骤 4: 检查构建命令

1. 在 **Settings** 标签中
2. 找到 **Build Command** 字段
3. 确认是：

```bash
npm run build
```

或者留空（Railway 会自动检测）

---

### 步骤 5: 重新部署

#### 方法 A: 通过 Dashboard

1. 点击 **Deployments** 标签
2. 点击右上角的 **Deploy** 按钮
3. 选择 **Redeploy**

#### 方法 B: 通过 Git Push

```bash
# 提交最新更改
git add .
git commit -m "Add nixpacks.toml for Railway"
git push origin main
```

Railway 会自动检测到新的提交并重新部署。

---

### 步骤 6: 等待部署完成

1. 在 **Deployments** 标签中查看部署进度
2. 等待状态变为 **Success** ✅
3. 通常需要 2-5 分钟

---

### 步骤 7: 验证修复

#### 测试 1: 直接访问子路由

```bash
curl -I https://fingnet.xyz/auth/extension-login
```

**预期结果:** 返回 `200 OK`，不是 `404`

#### 测试 2: 浏览器测试

1. 打开浏览器
2. 访问 `https://fingnet.xyz/auth/extension-login?extension_id=test`
3. **预期结果:** 显示登录页面，不是 "Not Found"

#### 测试 3: 插件测试

1. 从 Chrome 插件打开登录
2. **预期结果:** 正常显示登录页面

---

## 🔧 高级设置（如果上述方法无效）

### 选项 1: 添加自定义 Nginx 配置

如果 Railway 使用 Nginx，创建 `railway-nginx.conf`：

```nginx
server {
    listen $PORT;
    root /app/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 选项 2: 使用自定义 Dockerfile

创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 安装 serve
RUN npm install -g serve

# 暴露端口
EXPOSE 8080

# 启动命令
CMD ["serve", "dist", "-s", "-l", "8080"]
```

然后在 Railway Settings 中：
1. **Build** → **Builder** → 选择 **Dockerfile**

---

## 📊 部署日志检查

### 查看构建日志

1. 点击 **Deployments** 标签
2. 点击最新的部署
3. 查看 **Build Logs**

**应该看到:**
```
✓ 1935 modules transformed.
✓ built in X.XXs
```

### 查看运行日志

1. 点击 **Deployments** 标签
2. 点击 **View Logs**

**应该看到:**
```
INFO: Accepting connections at http://localhost:8080
```

**不应该看到:**
```
Error: Cannot find module 'serve'
```

---

## 🐛 常见问题排查

### 问题 1: 部署后仍然 404

**可能原因:**
- Start Command 没有保存
- 使用了错误的命令
- 缓存问题

**解决方案:**
```bash
# 1. 清除 Railway 缓存
# 在 Settings → 找到 "Clear Cache" 按钮

# 2. 强制重新部署
# 在 Deployments → Redeploy

# 3. 清除浏览器缓存
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)
```

### 问题 2: serve 命令找不到

**错误信息:**
```
serve: command not found
```

**解决方案:**

更新 Start Command 为：
```bash
npx serve dist -s -l $PORT
```

`npx` 会自动下载并运行 `serve`。

### 问题 3: 端口错误

**错误信息:**
```
Error: Port 8080 is already in use
```

**解决方案:**

确认 Start Command 使用 `$PORT` 变量：
```bash
npx serve dist -s -l $PORT
```

不要硬编码端口号！

### 问题 4: dist 目录不存在

**错误信息:**
```
Error: Cannot find directory 'dist'
```

**解决方案:**

1. 确认 Build Command 是 `npm run build`
2. 检查构建日志确认构建成功
3. 确认 `package.json` 中有 build 脚本

---

## 📝 完整的 Railway 配置清单

### 文件清单

- ✅ `railway.json` - Railway 配置
- ✅ `nixpacks.toml` - Nixpacks 构建配置
- ✅ `serve.json` - serve 包配置
- ✅ `package.json` - npm 脚本
- ✅ `public/_redirects` - Netlify 备用配置

### Railway Dashboard 设置

- [ ] **Start Command**: `npx serve dist -s -l $PORT`
- [ ] **Build Command**: `npm run build`
- [ ] **Environment Variables**: `PORT=8080`, `NODE_ENV=production`
- [ ] **Builder**: NIXPACKS 或 Dockerfile

### 验证清单

- [ ] 构建日志显示成功
- [ ] 运行日志显示 "Accepting connections"
- [ ] 直接访问子路由返回 200
- [ ] 浏览器测试正常
- [ ] 插件登录正常

---

## 🎯 快速修复步骤（总结）

### 1. 更新 Start Command

在 Railway Dashboard:
```
Settings → Deploy → Start Command
输入: npx serve dist -s -l $PORT
保存
```

### 2. 提交新配置文件

```bash
git add nixpacks.toml railway.json serve.json
git commit -m "Fix: Add Railway SPA configuration"
git push origin main
```

### 3. 等待重新部署

等待 2-5 分钟，Railway 会自动重新部署。

### 4. 测试

```bash
curl -I https://fingnet.xyz/auth/extension-login
```

应该返回 `200 OK`。

---

## 📞 如果还是不行

### 检查清单

1. **Start Command 是否正确？**
   - 应该是: `npx serve dist -s -l $PORT`
   - 不是: `npm start` 或其他

2. **Build 是否成功？**
   - 查看构建日志
   - 确认 `dist` 目录被创建

3. **serve.json 是否存在？**
   - 应该在项目根目录
   - 内容应该包含 rewrites 配置

4. **缓存是否清除？**
   - Railway 缓存
   - 浏览器缓存

### 最后的手段：使用 Dockerfile

如果所有方法都失败，使用 Dockerfile（见上面的 Dockerfile 示例）。

---

## 🎉 成功标志

当一切正常时，你应该看到：

1. **Railway 日志:**
   ```
   INFO: Accepting connections at http://localhost:8080
   ```

2. **浏览器:**
   - 访问 `https://fingnet.xyz/auth/extension-login`
   - 看到登录页面（不是 404）

3. **插件:**
   - 从插件打开登录
   - 正常显示登录页面
   - 可以完成 OAuth 流程

---

## 📚 相关资源

- [Railway Documentation](https://docs.railway.app/)
- [Nixpacks Documentation](https://nixpacks.com/)
- [serve Package](https://github.com/vercel/serve)

---

**按照这个指南操作后，你的 SPA 路由应该就能正常工作了！** 🚀

## 🔑 关键点

**最重要的是 Start Command！**

确保在 Railway Dashboard 的 Settings 中，Start Command 设置为：

```bash
npx serve dist -s -l $PORT
```

这个命令会：
1. 使用 `npx` 自动安装 `serve`
2. 使用 `-s` 参数启用 SPA fallback
3. 使用 `-l $PORT` 监听 Railway 提供的端口
