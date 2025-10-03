# OnlyText Onboarding Flow Documentation

landing page => ai twin page => basic info page => goal input page => choice made page

## 流程概述

OnlyText的onboarding流程是用户首次使用产品时的引导体验，旨在了解用户并为其提供个性化的服务。整个流程包含4个主要环节，每个环节都有明确的目的和功能。

## 流程环节定义

### 1. AI Twin页面
- **环节名称**: AI Twin自我介绍环节
- **页面标识**: `showAIIntro = true`
- **主要目的**: 将AI Twin和后续的流程介绍给用户
- **功能描述**: 
  - AI Twin进行自我介绍，建立与用户的情感连接
  - 说明即将开始的onboarding流程内容和目的
  - 营造友好、个性化的产品氛围
- **用户操作**: 点击"Let's Get Started!"按钮进入下一环节
- **设计特色**: 温暖的粉红-玫瑰色调，大型AI头像，友好的介绍文案

### 2. Goal Input页面
- **环节名称**: 用户输入目标环节
- **页面标识**: `showGoalInput = true`
- **主要目的**: 让用户在前端输入自己的目标
- **功能描述**:
  - 提供文本输入框让用户描述个人目标
  - AI Twin头像陪伴，保持一致的用户体验
  - 验证用户输入，确保目标内容有效
- **用户操作**: 
  - 在文本框中输入个人目标
  - 点击"Complete Setup"完成设置
  - 可选择点击右下角按钮查看相似用户目标
- **设计特色**: 绿色主题色调，简洁的输入界面

### 3. Choice Made页面
- **环节名称**: 用户选择环节
- **页面标识**: 默认onboarding问答流程
- **主要目的**: 让用户进行各种选择以让系统对其有大致了解
- **功能描述**:
  - 包含16个精心设计的选择题
  - 涵盖年龄、性别、兴趣领域、职业、性格特征等维度
  - AI Friend浮动头像提供个性化评论
  - 进度条显示完成进度
- **用户操作**: 
  - 逐题选择最符合自己的选项
  - 可以前进后退修改选择
  - 完成所有问题后自动进入分析阶段
- **设计特色**: 
  - 蓝紫渐变背景
  - 动态网格布局适应不同选项数量
  - AI Friend气泡评论系统

### 4. Other Goal页面
- **环节名称**: 相似的人环节
- **页面标识**: `showOtherGoal = true`
- **主要目的**: 让用户发现和自己相似的人都有怎样的目标
- **功能描述**:
  - 展示5个与用户相似的用户档案
  - 显示相似度百分比和背景信息
  - 展示这些相似用户的具体目标
  - 提供灵感和参考价值
- **用户操作**:
  - 浏览相似用户的目标内容
  - 选择"Back to My Goal"返回Goal Input页面
  - 选择"I'm Inspired - Let's Start!"直接完成onboarding
- **设计特色**: 靛蓝-青色渐变，卡片式布局，相似度标识

## 完整流程顺序 (最新重构)

```
用户进入onboarding
    ↓
1. AI Twin页面 (自我介绍)
    ↓ 点击"Let's Get Started!"
2. Choice Made页面 (16个选择题)
    ↓ 完成所有选择
3. Goal Input页面 (多轮对话形式)
    ├─ AI Twin发起6轮对话:
    │   1. "What is your goal recently?"
    │   2. "Sounds fun! Can you tell me more? Like what stage your account is at now, and how long you've been running it?"
    │   3. "I see. So can you tell me what areas your account focuses on, or do you post about a bit of everything?"
    │   4. "Got it. So what do you think is your strongest or most valuable part when it comes to running your account?"
    │   5. "That's great! Have you run into any problems lately while working toward your goals—like lacking motivation or certain skills? And what kind of person would you like to find to help you with that?"
    │   6. "Alright, last question! Here are a few thoughts about running Twitter— which one do you feel resonates with you the most?"
    ├─ 每次用户回答后，AI Twin显示打字状态 (2秒) 然后问下一个问题
    ├─ 所有问题回答完后，AI Twin发送总结消息并准备创建AI Twin
    ├─ 30秒后显示Other Goal入口按钮 (可选)
    └─ 3秒后自动进入Twin分析阶段
4. Twin分析页面 (环形进度条)
    ├─ 显示"Creating Your AI Twin"标题
    ├─ 环形进度条从0%到100%
    ├─ 分析用户回答以创建个性化AI Twin
    └─ 完成后自动进入Create Twin页面
5. Create Twin页面 (AI Twin建模展示)
    ├─ 展示"Meet Your AI Twin"
    ├─ 显示AI Twin的特征:
    │   ├─ 性格特征 (Creativity, Analytical, Collaborative)
    │   ├─ 价值观 (Authenticity, Growth, Connection, Innovation)
    │   ├─ 目标导向 (基于用户回答的个性化描述)
    │   └─ 沟通风格 (基于用户特点的描述)
    └─ "Explore the AI Twin Network" → Network页面
6. Network页面 (AI Twin网络介绍)
    ├─ 展示"Welcome to the AI Twin Network"
    ├─ 左侧: 网络玩法介绍文字
    │   ├─ 解释AI Twin网络的工作原理
    │   ├─ 强调一对一聊天而非内容连接
    │   └─ 展示4个特色功能 (One-on-One Chats, Shared Goals, Knowledge Exchange, Mutual Growth)
    ├─ 右侧: 网络连接图可视化
    │   ├─ SVG动态网络图
    │   ├─ 中心节点代表用户AI Twin
    │   ├─ 6个外围节点代表其他AI Twin
    │   └─ 动画连接线和数据流动效果
    └─ "Start Exploring the Network" → 结束onboarding
7. Other Goal页面 (可选分支)
    └─ 从Goal Input页面30秒后可选择进入
        ├─ "Back to My Goal" → 返回Goal Input页面
        └─ "I'm Inspired - Let's Start!" → 结束onboarding
```

## 技术实现要点

### 状态管理
- `showAIIntro`: 控制AI Twin页面显示
- `showGoalInput`: 控制Goal Input页面显示  
- `showOtherGoal`: 控制Other Goal页面显示
- `goalChatMessages`: 存储Goal Input聊天消息
- `goalUserInput`: Goal Input聊天输入框内容
- `isAITyping`: AI Twin打字状态
- `canUserTypeGoal`: 用户是否可以输入
- `showOtherGoalButton`: 30秒后显示的Other Goal按钮
- `currentGoalQuestionIndex`: 当前问题索引 (0-5)
- `goalAnswers`: 存储用户的所有回答
- `showTwinAnalysis`: 控制Twin分析页面显示
- `twinAnalysisProgress`: Twin分析进度 (0-100)
- `showCreateTwin`: 控制Create Twin页面显示
- `showNetwork`: 控制Network页面显示

### 页面跳转逻辑
- AI Twin → Choice Made: `setShowAIIntro(false)`
- Choice Made → Goal Input (聊天形式): 直接跳转，`setShowGoalInput(true)` + `initializeGoalChat()`
- Goal Input聊天初始化: AI发送问题，1秒后允许用户输入，30秒后显示Other Goal按钮
- Goal Input → Twin分析: 所有问题回答完后3秒自动跳转，`setShowTwinAnalysis(true)` + `startTwinAnalysis()`
- Twin分析 → Create Twin: 进度条完成后自动跳转，`setShowCreateTwin(true)`
- Create Twin → Network: `handleEnterNetwork()` → `setShowNetwork(true)`
- Network → 完成onboarding: `handleCompleteOnboarding()`
- Goal Input → Other Goal: `handleViewOtherGoals()` (30秒后按钮可用)
- Other Goal → Goal Input: 返回按钮
- 任意页面 → 完成: `setShouldShowOnboarding(false)`

### 测试模式支持
- URL参数 `?force=true` 重置onboarding状态
- 各页面提供快速跳转功能
- 随机填充选择题答案进行快速测试

## 设计原则

1. **一致性**: 所有页面都有AI Twin/Friend头像陪伴
2. **渐进性**: 从简单介绍到复杂选择，循序渐进
3. **个性化**: 每个环节都体现对用户的个性化关注
4. **灵活性**: 提供多种完成路径和返回选项
5. **友好性**: 温暖的色调和亲切的文案营造友好氛围

## 更新日志

- **2025-09-28**: 创建文档，定义4个主要环节
- **2025-09-28**: 添加AI Twin页面作为流程起点
- **2025-09-28**: 完善Goal Input页面和Other Goal页面功能

---

*本文档记录了OnlyText产品onboarding流程的核心设计和实现细节，为后续开发和维护提供参考。*
