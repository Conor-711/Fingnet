# Main.tsx 重构总结

## 📋 重构概述

将原来3186行的单体Main.tsx文件重构为模块化的架构，提高代码可维护性和可读性。

---

## 🏗️ 新架构

### 目录结构
```
src/
├── pages/
│   ├── Main.tsx                        # 主容器 + 路由（待重构）
│   └── main/                           # 子页面组件目录
│       ├── AITwinPage.tsx             # ✅ You & AI Twin页面
│       ├── ConnectionsPage.tsx         # ✅ Connections页面
│       ├── InvitationsPage.tsx         # ✅ Invitations页面
│       └── GroupChatPage.tsx           # ✅ Group Chat页面
└── hooks/                              # 自定义Hooks目录
    ├── useInvitations.ts               # ✅ 邀请管理逻辑
    ├── useGroups.ts                    # ✅ 群组管理逻辑
    └── useDailyModeling.ts             # ✅ Daily Modeling逻辑
```

---

## ✅ 已完成的模块

### 1. AITwinPage.tsx (355行)
**功能**：展示用户和AI Twin的Profile信息

**Props接口**：
```typescript
interface AITwinPageProps {
  aiTwinProfile: AITwinProfile | null;
  user: any;
  expandedFields: { goals, offers, lookings, memory, learnedFromUser };
  toggleFieldExpansion: (field) => void;
  onEditProfile: () => void;
}
```

**特性**：
- 左右分栏布局（User Profile | AI Profile）
- 可折叠字段显示
- Daily Modeling历史记录展示
- Memory展示

---

### 2. InvitationsPage.tsx (187行)
**功能**：管理发送和接收的邀请

**Props接口**：
```typescript
interface InvitationsPageProps {
  sentInvitations: Invitation[];
  receivedInvitations: Invitation[];
  isLoadingInvitations: boolean;
  onAcceptInvitation: (invitation) => Promise<void>;
  onDeclineInvitation: (invitationId) => Promise<void>;
}
```

**特性**：
- 左右分栏布局（Received | Sent）
- 实时邀请状态更新
- 接受/拒绝邀请功能
- 邀请状态Badge显示

---

### 3. GroupChatPage.tsx (271行)
**功能**：群组聊天界面

**Props接口**：
```typescript
interface GroupChatPageProps {
  userGroups: Group[];
  selectedGroup: Group | null;
  groupMessages: GroupMessage[];
  newMessage: string;
  isLoading...: boolean;
  isSummarizing: boolean;
  chatSummary: string | null;
  showSummary: boolean;
  isMemorySaved: boolean;
  currentUserId: string;
  onSelectGroup: (group) => void;
  onSendMessage: () => void;
  onNewMessageChange: (value) => void;
  onSummarizeChat: () => void;
  onSaveMemory: () => void;
}
```

**特性**：
- 群组列表侧边栏
- 实时消息显示
- 消息发送功能
- 聊天总结功能
- 保存到Memory功能

---

### 4. ConnectionsPage.tsx (173行)
**功能**：展示Conversation History和推荐连接

**Props接口**：
```typescript
interface ConnectionsPageProps {
  conversations: any[];
  isLoadingConversations: boolean;
  onSendInvitation: (recipientId, message?) => Promise<void>;
  onViewConversation: (chat) => void;
}
```

**特性**：
- Conversation卡片网格布局
- 推荐原因显示
- 匹配分数显示
- 快速连接功能

---

### 5. useInvitations Hook (143行)
**功能**：封装邀请相关的所有业务逻辑

**返回值**：
```typescript
{
  sentInvitations: Invitation[];
  receivedInvitations: Invitation[];
  isLoadingInvitations: boolean;
  loadInvitations: () => Promise<void>;
  handleSendInvitation: (recipientId, message?) => Promise<void>;
  handleAcceptInvitation: (invitation, onGroupCreated?) => Promise<void>;
  handleDeclineInvitation: (invitationId) => Promise<void>;
}
```

**特性**：
- 自动加载邀请列表（useEffect）
- 发送邀请到数据库
- 接受邀请并自动创建群组
- 拒绝邀请
- Toast通知

---

### 6. useGroups Hook (119行)
**功能**：封装群组和消息相关的业务逻辑

**返回值**：
```typescript
{
  userGroups: Group[];
  selectedGroup: Group | null;
  groupMessages: GroupMessage[];
  newMessage: string;
  isLoadingGroups: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  setNewMessage: (value) => void;
  loadUserGroups: () => Promise<void>;
  loadGroupMessages: (groupId) => Promise<void>;
  handleSendGroupMessage: () => Promise<void>;
  handleSelectGroup: (group) => void;
}
```

**特性**：
- 自动加载用户群组（useEffect）
- 选择群组时自动加载消息
- Supabase Realtime订阅
- 发送消息功能
- 自动清理订阅

---

### 7. useDailyModeling Hook (192行)
**功能**：封装Daily Modeling的完整流程

**返回值**：
```typescript
{
  showDailyModeling: boolean;
  dailyQuestions: { valueOfferedQuestion, valueDesiredQuestion } | null;
  currentDailyQuestion: 0 | 1;
  dailyAnswers: { valueOffered, valueDesired };
  dailyInputValue: string;
  isLoadingDailyQuestions: boolean;
  isProcessingDailyAnswer: boolean;
  setDailyInputValue: (value) => void;
  handleDailyAnswerSubmit: () => Promise<void>;
  handleTestNextDay: () => void;
  handleResetTestDate: () => void;
  checkAndInitializeDailyModeling: () => Promise<void>;
}
```

**特性**：
- 自动检查并初始化（useEffect，延迟2秒）
- 日期管理（支持测试日期覆盖）
- 问题生成（调用AI Service）
- 答案处理和集成
- 历史记录保存
- 测试功能（Next Day, Reset）

---

## 🔄 重构优势

### 代码组织
- ✅ **模块化**：每个页面独立文件，职责清晰
- ✅ **可维护性**：单个文件行数大幅减少（从3186行拆分为多个小文件）
- ✅ **可测试性**：独立的Hooks便于单元测试
- ✅ **复用性**：Hooks可在其他组件中复用

### 关注点分离
- ✅ **UI层**：页面组件只负责展示
- ✅ **逻辑层**：Hooks封装业务逻辑
- ✅ **数据层**：Supabase函数处理数据库操作

### 开发体验
- ✅ **更快的编辑器性能**：小文件加载更快
- ✅ **更好的导航**：文件结构清晰
- ✅ **更容易理解**：新开发者可快速定位功能

---

## ⏳ 待完成任务

### 重构Main.tsx
Main.tsx目前仍是3186行的原始版本，需要简化为：

```typescript
// 伪代码示例
import AITwinPage from './main/AITwinPage';
import ConnectionsPage from './main/ConnectionsPage';
import InvitationsPage from './main/InvitationsPage';
import GroupChatPage from './main/GroupChatPage';
import { useInvitations } from '@/hooks/useInvitations';
import { useGroups } from '@/hooks/useGroups';
import { useDailyModeling } from '@/hooks/useDailyModeling';

export default function Main() {
  // 使用Hooks
  const invitations = useInvitations(user?.id);
  const groups = useGroups(user?.id);
  const dailyModeling = useDailyModeling(user?.id, aiTwinProfile, updateAITwinProfile);
  
  // 渲染当前页面
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'ai-twin':
        return <AITwinPage {...aiTwinPageProps} />;
      case 'connections':
        return <ConnectionsPage {...connectionsPageProps} />;
      case 'invitations':
        return <InvitationsPage {...invitations} />;
      case 'group-chat':
        return <GroupChatPage {...groups} {...chatProps} />;
      default:
        return <AITwinPage {...aiTwinPageProps} />;
    }
  };
  
  return (
    <div>
      {/* Top Bar */}
      {/* Daily Modeling Module */}
      {/* Current Page */}
      {renderCurrentPage()}
      {/* Test Buttons */}
    </div>
  );
}
```

---

## 📈 重构统计

### 创建的新文件
- 4个页面组件
- 3个自定义Hooks
- 1个重构总结文档

### 代码行数分布
- **AITwinPage**: 355行
- **InvitationsPage**: 187行
- **GroupChatPage**: 271行
- **ConnectionsPage**: 173行
- **useInvitations**: 143行
- **useGroups**: 119行
- **useDailyModeling**: 192行
- **总计**: ~1440行（重构后的模块化代码）

### 对比
- **重构前**: Main.tsx 单文件 3186行
- **重构后**: 7个模块文件 ~1440行 + Main.tsx容器（预计减少到~500行）

---

## 🎯 下一步行动

1. **重构Main.tsx**：
   - 导入所有页面组件和Hooks
   - 移除已提取的业务逻辑
   - 简化为路由容器
   - 保留Top Bar、Daily Modeling UI、Test Buttons

2. **测试集成**：
   - 测试所有页面导航
   - 测试邀请发送/接受流程
   - 测试群组消息实时通信
   - 测试Daily Modeling流程

3. **代码清理**：
   - 删除Main.tsx中的冗余代码
   - 统一导入路径
   - 更新相关文档

4. **提交代码**：
   - Git commit with detailed message
   - Push to GitHub

---

## 📝 重构建议

### 如果继续重构其他页面
可以考虑进一步拆分：
- `src/components/main/` - 可复用的小组件
- `src/contexts/GroupContext.tsx` - 群组上下文
- `src/services/chatService.ts` - 聊天相关服务

### 性能优化
- 使用`React.memo`优化页面组件
- 使用`useMemo`和`useCallback`优化Hooks
- 实现虚拟滚动（长列表）

---

生成时间：2025-10-03
重构状态：7/8 完成（87.5%）

