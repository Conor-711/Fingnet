# Railway 紧急修复指南 🚨

## 🔴 问题现状

即使更新了配置文件，访问 `https://fingnet.xyz/auth/extension-login` 仍然返回 404。

## 🔍 可能的原因

### 原因 1: Railway Dashboard 设置覆盖了配置文件

**Railway 的优先级顺序：**
```
Railway Dashboard Settings (最高优先级)
  ↓
railway.json
  ↓
nixpacks.toml
```

如果 Railway Dashboard 中有设置，它会**覆盖**配置文件！

### 原因 2: 部署没有使用正确的启动命令

即使配置文件正确，Railway 可能仍在使用旧的启动命令。

### 原因 3: 构建产物路径问题

Railway 可能找不到 `dist` 目录。

---

## ✅ 立即执行的修复步骤

### 步骤 1: 检查 Railway Dashboard 设置（最重要！）

1. 登录 Railway: https://railway.app
2. 选择 `Onlytext` 项目
3. 点击你的服务
4. 点击 **Settings** 标签
5. 找到 **Deploy** 部分
6. 找到 **Start Command** 字段

#### 如果 Start Command 字段有内容：

**删除它！** 或者将它改为：

```bash
npx serve dist -s -l $PORT
```

#### 如果 Start Command 字段为空：

这是好的，Railway 会使用配置文件。

### 步骤 2: 检查 Build Command

在同一个 **Settings** 页面：

1. 找到 **Build Command** 字段
2. 确认是 `npm run build` 或留空
3. **不要**使用其他命令

### 步骤 3: 检查 Root Directory

在 **Settings** 页面：

1. 找到 **Root Directory** 字段
2. 应该是 `/` 或留空
3. **不要**设置为其他路径

### 步骤 4: 强制重新部署

#### 方法 A: 清除缓存并重新部署

1. 在 **Settings** 标签中
2. 向下滚动找到 **Danger Zone** 或类似部分
3. 找到 **Clear Cache** 或 **Reset** 按钮
4. 点击清除缓存
5. 然后在 **Deployments** 标签中点击 **Redeploy**

#### 方法 B: 通过 Git 强制重新部署

在本地终端运行：

```bash
git commit --allow-empty -m "Force Railway rebuild"
git push origin main
```

### 步骤 5: 查看部署日志（关键！）

1. 在 **Deployments** 标签中
2. 点击最新的部署
3. 查看 **Build Logs**

#### 应该看到：

```
✓ 1935 modules transformed.
✓ built in X.XXs
```

4. 查看 **Deploy Logs** 或 **Runtime Logs**

#### 应该看到：

```
INFO: Accepting connections at http://localhost:XXXX
```

或类似的消息。

#### 不应该看到：

```
Error: Cannot find module 'serve'
Error: Cannot find directory 'dist'
Error: ENOENT: no such file or directory
```

---

## 🔧 高级诊断

### 诊断 1: 检查构建产物

在 **Deployments** → **Build Logs** 中，搜索：

```
dist
```

应该看到类似：

```
dist/index.html
dist/assets/
```

如果没有，说明构建失败或输出路径错误。

### 诊断 2: 检查启动命令

在 **Deploy Logs** 或 **Runtime Logs** 中，搜索：

```
serve
```

应该看到类似：

```
npx serve dist -s -l 8080
```

或

```
npx serve dist -s -l $PORT
```

如果看到其他命令（如 `npm start`），说明启动命令错误。

### 诊断 3: 检查端口

在 **Runtime Logs** 中，应该看到：

```
Accepting connections at http://localhost:XXXX
```

其中 `XXXX` 应该是 Railway 分配的端口（通常是 8080 或其他）。

---

## 🚀 终极解决方案：使用 Procfile

如果上述方法都不行，创建一个 `Procfile`（Railway 会优先使用它）：

### 创建 Procfile

在项目根目录创建 `Procfile` 文件（无扩展名）：

```
web: npx serve dist -s -l $PORT
```

**注意：**
- 文件名是 `Procfile`（大写 P，无扩展名）
- 内容格式是 `web: 命令`
- 必须使用 `$PORT` 变量

### 提交并推送

```bash
git add Procfile
git commit -m "Add Procfile for Railway"
git push origin main
```

---

## 🐛 常见问题和解决方案

### 问题 1: 404 但日志显示 "Accepting connections"

**原因:** 启动命令缺少 `-s` 参数

**解决:**
确认启动命令是：
```bash
npx serve dist -s -l $PORT
```

**不是：**
```bash
npx serve dist -l $PORT  # ❌ 缺少 -s
```

### 问题 2: 主页正常，子路由 404

**原因:** 同上，缺少 `-s` 参数

**解决:** 添加 `-s` 参数

### 问题 3: 所有页面都 404

**原因:** 
- `dist` 目录不存在
- 构建失败
- 路径错误

**解决:**
1. 检查 Build Logs 确认构建成功
2. 确认 Build Command 是 `npm run build`
3. 确认 `package.json` 中有 `build` 脚本

### 问题 4: 端口错误

**错误信息:**
```
Error: Port 8080 is already in use
```

**解决:**
使用 `$PORT` 变量而不是硬编码端口：
```bash
npx serve dist -s -l $PORT
```

---

## 📝 完整的检查清单

在 Railway Dashboard 中检查：

- [ ] **Settings → Deploy → Start Command**
  - 应该是空的（使用配置文件）
  - 或者是 `npx serve dist -s -l $PORT`
  
- [ ] **Settings → Build → Build Command**
  - 应该是 `npm run build` 或空的
  
- [ ] **Settings → Build → Root Directory**
  - 应该是 `/` 或空的
  
- [ ] **Variables → Environment Variables**
  - `PORT` 应该存在（Railway 自动设置）
  - `NODE_ENV=production` 应该存在

在部署日志中检查：

- [ ] **Build Logs**
  - 看到 `✓ built in X.XXs`
  - 看到 `dist/` 目录被创建
  
- [ ] **Deploy Logs / Runtime Logs**
  - 看到 `Accepting connections at http://localhost:XXXX`
  - 没有错误信息

在浏览器中测试：

- [ ] `https://fingnet.xyz/` → 正常
- [ ] `https://fingnet.xyz/auth/extension-login` → 正常（不是 404）

---

## 🎯 如果还是不行：使用 Dockerfile

### 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 使用 Node.js 20
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 全局安装 serve
RUN npm install -g serve

# 暴露端口（Railway 会自动设置 PORT 环境变量）
EXPOSE 8080

# 启动命令
CMD ["sh", "-c", "serve dist -s -l $PORT"]
```

### 更新 Railway 设置

1. 在 Railway Dashboard
2. **Settings** → **Build** → **Builder**
3. 选择 **Dockerfile**
4. 保存
5. 重新部署

---

## 📞 立即行动步骤（总结）

### 1. 检查 Railway Dashboard

登录并检查 **Start Command** 是否正确或为空。

### 2. 清除缓存

在 Settings 中清除缓存。

### 3. 强制重新部署

```bash
git commit --allow-empty -m "Force rebuild"
git push origin main
```

### 4. 查看日志

检查 Build Logs 和 Runtime Logs，找出具体错误。

### 5. 如果还是不行

创建 `Procfile` 或 `Dockerfile`。

---

## 🔑 关键命令

### 正确的启动命令

```bash
npx serve dist -s -l $PORT
```

### Procfile 内容

```
web: npx serve dist -s -l $PORT
```

### Dockerfile CMD

```dockerfile
CMD ["sh", "-c", "serve dist -s -l $PORT"]
```

---

**最重要的是检查 Railway Dashboard 的 Settings！配置文件可能被覆盖了！** 🔑
