# Railway 部署指南 / Railway Deployment Guide

## 环境变量配置 / Environment Variables

在Railway部署时，需要配置以下环境变量：

### Required Environment Variables

#### 1. VITE_OPENAI_API_KEY
- **用途 / Purpose**: OpenAI API密钥，用于AI功能（对话生成、问题生成等）
- **获取方法 / How to get**: 
  1. 访问 https://platform.openai.com/api-keys
  2. 创建新的API密钥
  3. 复制密钥（只会显示一次）

---

## Railway部署步骤 / Deployment Steps

### 1. 连接GitHub仓库 / Connect GitHub Repository
1. 登录 Railway (https://railway.app)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择 `Conor-711/OnlyMsg` 仓库

### 2. 配置环境变量 / Configure Environment Variables
1. 在Railway项目中，点击项目名称
2. 进入 "Variables" 标签
3. 添加以下环境变量：

```bash
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**重要提示 / Important**: 
- ✅ 使用你自己的OpenAI API密钥
- ✅ 确保密钥有效且有足够的额度
- ❌ 不要在代码中硬编码API密钥
- ❌ 不要将`.env.local`文件提交到Git

### 3. 部署配置文件 / Deployment Configuration

项目已包含以下配置文件，无需修改：

- **railway.json** - Railway构建和部署配置
- **nixpacks.toml** - Node.js环境配置
- **.nvmrc** - Node.js版本指定
- **Procfile** - 启动命令配置

### 4. 触发部署 / Trigger Deployment

保存环境变量后，Railway会自动：
1. 安装依赖 (`npm ci`)
2. 构建项目 (`npm run build`)
3. 启动服务 (`npm start`)

---

## 验证部署 / Verify Deployment

### 检查清单 / Checklist

部署成功后，验证以下功能：

#### 基础功能 / Basic Features
- [ ] Landing页面正常显示
- [ ] 背景动画和所有图片正常加载

#### AI功能 / AI Features
- [ ] Goal Input页面AI对话正常工作
- [ ] AI Twin能够生成追问
- [ ] Create Twin页面能整合用户回答
- [ ] Main页面能生成AI Twin对话

#### 图片资源 / Image Assets
- [ ] AI Twin头像正常显示
- [ ] 名人头像正常显示  
- [ ] 工具图标正常显示
- [ ] 所有动画中的头像正常显示

---

## 常见问题 / Troubleshooting

### 1. OpenAI API Key错误

**症状**: Console显示 "OpenAI API key not found"

**解决方案**:
1. 检查Railway环境变量中是否正确设置了 `VITE_OPENAI_API_KEY`
2. 确保变量名前缀是 `VITE_` (Vite要求)
3. 重新部署项目

### 2. 图片无法加载

**症状**: 图片显示404错误

**解决方案**:
- 所有图片应该在 `public/` 目录下
- 图片路径格式: `/avatars/*.png`, `/cele/*.png`, `/tools/*.png`
- 不要使用 `/src/assets/` 路径

### 3. 构建失败

**症状**: "npm: command not found"

**解决方案**:
- 确保 `railway.json`, `nixpacks.toml`, `.nvmrc` 文件存在
- 检查Node.js版本是否为20

### 4. AI功能不工作但没有报错

**症状**: AI对话无响应

**可能原因**:
1. OpenAI API密钥额度不足
2. API密钥权限不足
3. 网络连接问题

**解决方案**:
1. 检查OpenAI账户余额
2. 创建新的API密钥
3. 查看Railway部署日志

---

## 环境变量安全 / Environment Variable Security

### ✅ 正确做法 / Best Practices
- 在Railway平台上配置环境变量
- 使用`.env.local`文件在本地开发
- 将`.env.local`添加到`.gitignore`
- 使用`.env.example`说明需要的变量

### ❌ 错误做法 / Bad Practices
- 不要在代码中硬编码API密钥
- 不要将`.env.local`提交到Git
- 不要在公开的README中暴露密钥
- 不要在前端代码中直接暴露敏感信息

---

## 性能优化建议 / Performance Optimization

### 当前状态
- Bundle大小: ~620 KB (gzipped: ~177 KB)
- 警告: 某些chunk超过500 KB

### 未来优化方向
1. 使用动态导入(`import()`)进行代码分割
2. 配置手动chunk分割
3. 延迟加载非关键组件
4. 优化图片资源大小

---

## 联系支持 / Support

如果遇到问题：
1. 查看Railway部署日志
2. 检查浏览器Console错误
3. 验证环境变量配置
4. 查看本文档的常见问题部分

---

**最后更新 / Last Updated**: 2024-03-20
**项目 / Project**: OnlyMsg (Fingnet)
**部署平台 / Platform**: Railway
