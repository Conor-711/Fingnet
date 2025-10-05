# Railway 404 问题快速修复 🚀

## 🎯 问题
访问 `https://fingnet.xyz/auth/extension-login` 返回 404

## ✅ 解决方案（按顺序执行）

---

### 步骤 1: 更新 Railway Start Command（最重要！）

1. 登录 Railway Dashboard: https://railway.app
2. 选择你的 `Onlytext` 项目
3. 点击你的服务
4. 点击 **Settings** 标签
5. 向下滚动找到 **Deploy** 部分
6. 找到 **Start Command** 字段
7. **输入以下命令（精确复制）：**

```bash
npx serve dist -s -l $PORT
```

8. 点击保存

**⚠️ 注意事项：**
- 必须使用 `$PORT` 变量（不是 `8080`）
- 必须包含 `-s` 参数（启用 SPA fallback）
- 使用 `npx` 而不是 `npm`

---

### 步骤 2: 检查环境变量

在 **Variables** 标签中，确认存在：

```
PORT=8080
NODE_ENV=production
```

如果没有，点击 **+ New Variable** 添加。

---

### 步骤 3: 提交新配置文件

在你的本地终端运行：

```bash
git add nixpacks.toml railway.json serve.json
git commit -m "Fix: Add Railway SPA configuration"
git push origin main
```

---

### 步骤 4: 重新部署

#### 方法 A: 自动部署（推荐）

Git push 后，Railway 会自动重新部署（等待 2-5 分钟）

#### 方法 B: 手动部署

1. 在 Railway Dashboard 点击 **Deployments** 标签
2. 点击右上角的 **Deploy** 按钮
3. 选择 **Redeploy**

---

### 步骤 5: 等待并验证

#### 等待部署完成

在 **Deployments** 标签中：
- 等待状态变为 **Success** ✅
- 通常需要 2-5 分钟

#### 查看日志

点击 **View Logs**，应该看到：

```
INFO: Accepting connections at http://localhost:8080
```

或类似的成功消息。

#### 测试访问

在浏览器中访问：

```
https://fingnet.xyz/auth/extension-login?extension_id=test
```

**预期结果：** 显示登录页面，不是 "Not Found"

---

## 🐛 如果还是 404

### 检查清单

- [ ] Start Command 是否正确保存？（刷新页面确认）
- [ ] 部署是否完成？（状态是 Success）
- [ ] 日志是否显示 "Accepting connections"？
- [ ] 浏览器缓存是否清除？（Ctrl+Shift+R / Cmd+Shift+R）

### 额外步骤

#### 1. 清除 Railway 缓存

在 **Settings** 标签中：
- 找到 "Clear Cache" 或 "Reset" 按钮
- 点击清除缓存
- 重新部署

#### 2. 检查 Build Command

在 **Settings** → **Build Command**：
- 应该是 `npm run build` 或留空
- 不要使用其他命令

#### 3. 查看构建日志

在 **Deployments** → 点击最新部署 → **Build Logs**：
- 确认看到 `✓ built in X.XXs`
- 确认没有错误

---

## 📞 仍然无法解决？

### 最后的方法：使用 Dockerfile

1. 在 Railway Settings 中
2. **Build** → **Builder** → 选择 **Dockerfile**
3. 保存并重新部署

项目中已经有 Dockerfile 配置（在 `nixpacks.toml` 中）。

---

## 🎉 成功标志

当修复成功后，你会看到：

1. **Railway 日志显示：**
   ```
   INFO: Accepting connections at http://localhost:8080
   ```

2. **浏览器访问正常：**
   - `https://fingnet.xyz/` → 正常
   - `https://fingnet.xyz/auth/extension-login` → 正常（不是 404）
   - `https://fingnet.xyz/auth/extension-callback` → 正常（不是 404）

3. **插件登录正常：**
   - 从插件打开登录
   - 显示登录页面
   - 可以完成 OAuth 流程

---

## 📝 关键命令总结

### Railway Start Command（最重要！）

```bash
npx serve dist -s -l $PORT
```

### 本地 Git 提交

```bash
git add nixpacks.toml railway.json serve.json
git commit -m "Fix: Add Railway SPA configuration"
git push origin main
```

---

**按照这个步骤操作后，问题应该就解决了！** 🚀

如果还有问题，请查看完整的 `RAILWAY_SETUP_GUIDE.md` 文档。
