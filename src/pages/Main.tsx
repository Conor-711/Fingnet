import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding, type AITwinProfile } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Brain, Clock, Settings, CreditCard, Inbox, Users, LogOut, ArrowUp, X, Search, UserPlus, ChevronDown, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// 导入页面组件
import AITwinPage from './main/AITwinPage';
import ConnectionsPage from './main/ConnectionsPage';
import InvitationsPage from './main/InvitationsPage';
import GroupChatPage from './main/GroupChatPage';
import SubscribePage from './main/SubscribePage';
import SettingsPage from './main/SettingsPage';
import ReviewConnectionsPage from './main/ReviewConnectionsPage';

// 导入自定义Hooks
import { useInvitations } from '@/hooks/useInvitations';
import { useGroups } from '@/hooks/useGroups';
import { useDailyModeling } from '@/hooks/useDailyModeling';
import { useQuote } from '@/hooks/useQuote';

// 导入数据库函数
import { getAITwin, upsertAITwin, getAllAITwins } from '@/lib/supabase';
import { 
  summarizeGroupChat, 
  calculateAITwinMatch, 
  generateAITwinConversation,
  generateCoreValueSummary,
  withRetry,
  type AITwinConversationProfile,
  type AITwinConversationResult,
  type GeneratedMessage
} from '@/services/aiService';

const Main = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { progress, aiTwinProfile, updateAITwinProfile } = useOnboarding();
  
  // 页面导航状态
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'connections';
  });

  // 使用自定义Hooks
  const invitations = useInvitations(user?.id);
  const groups = useGroups(user?.id, aiTwinProfile);
  const dailyModeling = useDailyModeling(user?.id, aiTwinProfile, updateAITwinProfile);
  const quote = useQuote(groups.selectedGroup?.id || null, user?.id);

  // 测试数据状态
  const [testGroupMessages, setTestGroupMessages] = useState<any[]>([]);
  const [testAIConversation, setTestAIConversation] = useState<any | null>(null);

  // AI Twin Profile字段折叠状态
  const [expandedFields, setExpandedFields] = useState<{
    goals: boolean;
    offers: boolean;
    lookings: boolean;
    memory: boolean;
    learnedFromUser: boolean;
  }>({
    goals: false,
    offers: false,
    lookings: false,
    memory: false,
    learnedFromUser: false
  });

  // 聊天相关状态
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [chatSummary, setChatSummary] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isMemorySaved, setIsMemorySaved] = useState(false);

  // Connections页面状态 - 真实AI Twin网络数据
  const [realAITwins, setRealAITwins] = useState<AITwinConversationProfile[]>([]);
  const [isLoadingAITwins, setIsLoadingAITwins] = useState(false);
  const [isGeneratingConversations, setIsGeneratingConversations] = useState(false);
  const [generatedConversations, setGeneratedConversations] = useState<Record<string, AITwinConversationResult>>({});
  const [coreValueSummaries, setCoreValueSummaries] = useState<Record<string, string>>({});
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // 对话详情悬浮窗状态
  const [showChatDetail, setShowChatDetail] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showFullConversation, setShowFullConversation] = useState(false);

  // 回到顶部按钮状态
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // 打字机效果定时器引用 - 用于清理
  const typewriterTimersRef = useRef<NodeJS.Timeout[]>([]);

  // 切换字段展开/折叠
  const toggleFieldExpansion = (field: 'goals' | 'offers' | 'lookings' | 'memory' | 'learnedFromUser') => {
    setExpandedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // 回到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ========== Connections页面核心函数 ==========
  
  // 处理聊天点击
  const handleChatClick = (chat: any) => {
    setSelectedChat(chat);
    setShowChatDetail(true);
    
    // 启动打字机效果
    if (chat.messages && chat.messages.length > 0) {
      startTypewriterEffect(chat.messages);
    }
  };

  // 打字机效果控制
  const startTypewriterEffect = (messages: GeneratedMessage[]) => {
    // 清理之前的所有定时器
    typewriterTimersRef.current.forEach(timer => clearTimeout(timer));
    typewriterTimersRef.current = [];
    
    setDisplayedMessages([]);
    setCurrentMessageIndex(0);
    setIsTyping(true);
    setShowFullConversation(false);
    
    let messageIndex = 0;
    
    const displayNextMessage = () => {
      if (messageIndex < messages.length) {
        const message = messages[messageIndex];
        setDisplayedMessages(prev => [...prev, message]);
        setCurrentMessageIndex(messageIndex + 1);
        messageIndex++;
        
        // 根据消息长度调整延迟时间
        const messageLength = message.content.length;
        const baseDelay = 800;
        const charDelay = Math.min(messageLength * 25, 2000);
        const totalDelay = baseDelay + charDelay;
        
        const timer = setTimeout(displayNextMessage, totalDelay);
        typewriterTimersRef.current.push(timer);
      } else {
        setIsTyping(false);
        setShowFullConversation(true);
      }
    };
    
    // 开始显示第一条消息
    const initialTimer = setTimeout(displayNextMessage, 1000);
    typewriterTimersRef.current.push(initialTimer);
  };

  // 跳过打字机效果，直接显示所有消息
  const skipTypewriterEffect = () => {
    if (selectedChat?.messages) {
      setDisplayedMessages(selectedChat.messages);
      setCurrentMessageIndex(selectedChat.messages.length);
      setIsTyping(false);
      setShowFullConversation(true);
    }
  };

  // 关闭对话详情
  const handleCloseChatDetail = () => {
    // 清理所有打字机定时器
    typewriterTimersRef.current.forEach(timer => clearTimeout(timer));
    typewriterTimersRef.current = [];
    
    setShowChatDetail(false);
    setDisplayedMessages([]);
    setCurrentMessageIndex(0);
    setIsTyping(false);
    setShowFullConversation(false);
  };

  // 显示完整对话
  const handleShowFullConversation = () => {
    // 清理所有打字机定时器
    typewriterTimersRef.current.forEach(timer => clearTimeout(timer));
    typewriterTimersRef.current = [];
    
    if (selectedChat?.messages) {
      setDisplayedMessages(selectedChat.messages);
      setCurrentMessageIndex(selectedChat.messages.length);
      setIsTyping(false);
      setShowFullConversation(true);
    }
  };

  // 处理Interested按钮点击，跳转到对方AI Twin主页
  const handleInterestedClick = (chat: any) => {
    console.log('🔗 Interested clicked for chat:', chat);
    console.log('🔗 Chat partner name:', chat.partner);
    
    setShowChatDetail(false);
    
    // 根据聊天伙伴的名字映射到profile ID
    const profileId = chat.partner.toLowerCase().replace('\'s ai twin', '').replace(/\s+/g, '');
    
    console.log('🔗 Generated profile ID:', profileId);
    console.log('🔗 Navigating to:', `/profile/${profileId}`);
    
    navigate(`/profile/${profileId}`);
  };

  // 生成推荐原因
  const generateRecommendReason = (twinProfile: AITwinConversationProfile, conversationResult: AITwinConversationResult | undefined) => {
    if (!aiTwinProfile) return null;
    
    const reasons: string[] = [];
    
    // 检查地理位置
    if (twinProfile.profile.location && aiTwinProfile.profile?.location) {
      const twinCity = twinProfile.profile.location.split(',')[0].trim();
      const userCity = aiTwinProfile.profile.location.split(',')[0].trim();
      if (twinCity === userCity) {
        reasons.push(`📍 Same city: ${twinCity}`);
      }
    }
    
    // 检查年龄相仿
    if (twinProfile.profile.age && aiTwinProfile.profile?.age) {
      const twinAge = parseInt(twinProfile.profile.age);
      const userAge = parseInt(aiTwinProfile.profile.age);
      if (!isNaN(twinAge) && !isNaN(userAge) && Math.abs(twinAge - userAge) <= 5) {
        reasons.push(`👥 Similar age group`);
      }
    }
    
    // 检查职业相关
    if (twinProfile.profile.occupation && aiTwinProfile.profile?.occupation) {
      const twinOccupation = twinProfile.profile.occupation.toLowerCase();
      const userOccupation = aiTwinProfile.profile.occupation.toLowerCase();
      if (twinOccupation.includes(userOccupation.split(' ')[0]) || userOccupation.includes(twinOccupation.split(' ')[0])) {
        reasons.push(`💼 Related fields`);
      }
    }
    
    // 检查价值匹配
    if (conversationResult) {
      const valueScore = conversationResult.twin1Score.valueAlignment;
      if (valueScore >= 8) {
        reasons.push(`💎 High value alignment (${valueScore}/10)`);
      }
    }
    
    // 检查目标协同
    if (conversationResult) {
      const goalScore = conversationResult.twin1Score.goalSynergy;
      if (goalScore >= 8) {
        reasons.push(`🎯 Strong goal synergy (${goalScore}/10)`);
      }
    }
    
    // 检查兴趣重叠
    if (twinProfile.interests && aiTwinProfile.goals) {
      const hasCommonInterest = twinProfile.interests.some(interest => 
        aiTwinProfile.goals?.some(goal => 
          goal.toLowerCase().includes(interest.toLowerCase()) || 
          interest.toLowerCase().includes(goal.toLowerCase())
        )
      );
      if (hasCommonInterest) {
        reasons.push(`⭐ Shared interests`);
      }
    }
    
    return reasons.length > 0 ? reasons.slice(0, 3).join(' • ') : null;
  };

  // 动态生成聊天历史记录（使用真实AI Twins）
  const getDynamicChatHistory = () => {
    if (realAITwins.length === 0) {
      return [];
    }
    
    return realAITwins.map((twinProfile, index) => {
      const twinId = `twin-${index}`;
      const conversationResult = generatedConversations[twinId];
      const conversation = conversationResult?.messages || [];
      const lastMessage = conversation.length > 0 
        ? conversation[conversation.length - 1].content 
        : `Hi! I'm ${twinProfile.name}'s AI Twin. Let's connect and share insights!`;
      
      // 计算推荐程度（基于AI评分）
      const averageScore = conversationResult 
        ? (conversationResult.twin1Score.overallScore + conversationResult.twin2Score.overallScore) / 2 
        : 7; // 默认评分
      const isRecommended = averageScore >= 8 || index < 2;
      
      // 生成推荐原因
      const recommendReason = isRecommended ? generateRecommendReason(twinProfile, conversationResult) : null;
      
      // 获取核心价值总结
      const coreValue = coreValueSummaries[twinId] || null;
      
      return {
        id: index + 1,
        partner: `${twinProfile.name}'s AI Twin`,
        avatar: `/avatars/${(index % 4) + 1}.png`,
        lastMessage: lastMessage.substring(0, 80) + (lastMessage.length > 80 ? '...' : ''),
        timestamp: conversation.length > 0 ? conversation[conversation.length - 1].timestamp : 'Just now',
        messageCount: conversation.length,
        topic: twinProfile.interests?.[0] || 'General Discussion',
        recommended: isRecommended,
        recommendReason, // 推荐原因
        coreValue, // 核心价值总结
        messages: conversation.map((msg, msgIndex) => ({
          id: `${twinId}-${msg.id}-${msgIndex}`, // 生成全局唯一的ID：twin-0-msg-1-0
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp,
          isOwn: msg.isOwn
        })),
        twinProfile,
        conversationResult,
        matchingScore: averageScore
      };
    });
  };

  // 生成AI驱动的对话
  const generateConversationsForAllChats = async () => {
    if (!aiTwinProfile || isGeneratingConversations || !user) return;
    
    // 如果没有真实AI Twins且没有加载中，先等待加载
    if (realAITwins.length === 0 && !isLoadingAITwins) {
      console.log('ℹ️ No AI Twins available for conversation generation');
      setIsGeneratingConversations(false);
      return;
    }
    
    setIsGeneratingConversations(true);
    
    try {
      // 创建用户的AI Twin Profile
      const userAITwin: AITwinConversationProfile = {
        name: aiTwinProfile.name || "Your AI Twin",
        profile: aiTwinProfile.profile || {
          gender: '',
          age: '',
          occupation: '',
          location: ''
        },
        goalRecently: aiTwinProfile.goalRecently || '',
        valueOffered: aiTwinProfile.valueOffered || '',
        valueDesired: aiTwinProfile.valueDesired || '',
        personality: ["Unique", "Goal-oriented", "Growth-minded"],
        interests: ["Personal Development", "Networking", "Learning"]
      };

      const conversations: Record<string, AITwinConversationResult> = {};
      const valueSummaries: Record<string, string> = {};
      
      // 为每个真实AI Twin生成对话
      for (const [index, twinProfile] of realAITwins.entries()) {
        const twinId = `twin-${index}`;
        
        try {
          const conversationResult = await withRetry(() => 
            generateAITwinConversation(twinProfile, userAITwin, 12)
          );
          conversations[twinId] = conversationResult;
          
          // 生成核心价值总结
          try {
            const coreValue = await generateCoreValueSummary(
              twinProfile,
              userAITwin,
              conversationResult.messages
            );
            valueSummaries[twinId] = coreValue;
          } catch (valueError) {
            console.error(`Error generating core value for ${twinId}:`, valueError);
            // Fallback
            valueSummaries[twinId] = `Expertise in ${twinProfile.valueOffered?.substring(0, 30) || 'various areas'}`;
          }
        } catch (error) {
          console.error(`Error generating conversation for ${twinId}:`, error);
        }
      }
      
      setGeneratedConversations(conversations);
      setCoreValueSummaries(valueSummaries);
    } catch (error) {
      console.error('Error generating conversations:', error);
    } finally {
      setIsGeneratingConversations(false);
    }
  };

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 组件卸载时清理所有打字机定时器
  useEffect(() => {
    return () => {
      typewriterTimersRef.current.forEach(timer => clearTimeout(timer));
      typewriterTimersRef.current = [];
    };
  }, []);

  // 从数据库加载AI Twin Profile
  useEffect(() => {
    const loadAITwinProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await getAITwin(user.id);
        if (error) {
          console.error('Failed to load AI Twin:', error);
          return;
        }

        if (data) {
          console.log('✅ Loaded AI Twin from database:', data);
          updateAITwinProfile(data);
        }
      } catch (error) {
        console.error('Error loading AI Twin:', error);
      }
    };

    if (user && !aiTwinProfile) {
      loadAITwinProfile();
    }
  }, [user, aiTwinProfile, updateAITwinProfile]);

  // 从数据库加载所有其他用户的AI Twins（用于匹配网络）
  useEffect(() => {
    const loadAllAITwins = async () => {
      if (!user) return;

      setIsLoadingAITwins(true);
      
      try {
        // 获取所有AI Twins，排除当前用户
        const { data: twins, error } = await getAllAITwins(user.id);
        
        if (error) {
          console.error('Error loading AI Twins network:', error);
          toast.error('加载AI Twin网络失败');
          return;
        }

        if (twins && twins.length > 0) {
          console.log(`✅ Loaded ${twins.length} AI Twins from network`);
          
          // 转换为 AITwinConversationProfile 格式
          const conversationProfiles: AITwinConversationProfile[] = twins.map(twin => ({
            name: twin.name,
            profile: twin.profile,
            goalRecently: twin.goals?.[0] || twin.goalRecently || '',
            valueOffered: twin.offers?.[0] || twin.valueOffered || '',
            valueDesired: twin.lookings?.[0] || twin.valueDesired || '',
            personality: ["Unique", "Growth-minded"],
            interests: twin.goals || []
          }));
          
          setRealAITwins(conversationProfiles);
        } else {
          console.log('ℹ️ No other AI Twins found in network yet');
          setRealAITwins([]);
        }
      } catch (error) {
        console.error('Error in loadAllAITwins:', error);
        toast.error('加载网络数据时出错');
      } finally {
        setIsLoadingAITwins(false);
      }
    };

    loadAllAITwins();
  }, [user]);

  // 当AI Twin Profile和真实AI Twins都可用时生成对话
  useEffect(() => {
    if (aiTwinProfile && realAITwins.length > 0 && Object.keys(generatedConversations).length === 0) {
      generateConversationsForAllChats();
    }
  }, [aiTwinProfile, realAITwins, generatedConversations]);

  // 使用getDynamicChatHistory()生成最终的conversations数据
  useEffect(() => {
    const chatHistory = getDynamicChatHistory();
    setConversations(chatHistory);
    setIsLoadingConversations(isGeneratingConversations);
  }, [realAITwins, generatedConversations, isGeneratingConversations]);

  // 保存AI Twin Profile到数据库
  const handleSaveProfile = async (updatedProfile: AITwinProfile) => {
    if (!user) return;

    try {
      const { error } = await upsertAITwin(user.id, updatedProfile);
      if (error) {
        console.error('Failed to save AI Twin:', error);
        toast.error('Failed to save profile');
        return;
      }

      updateAITwinProfile(updatedProfile);
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving AI Twin:', error);
      toast.error('Failed to save profile');
    }
  };

  // 总结群聊
  const handleSummarizeChat = async () => {
    if (!groups.selectedGroup || groups.groupMessages.length === 0) {
      toast.error('No messages to summarize');
      return;
    }

    setIsSummarizing(true);
    setIsMemorySaved(false);
    try {
      const messages: any[] = groups.groupMessages.map(msg => ({
        sender: msg.sender_name,
        content: msg.content,
        timestamp: new Date(msg.created_at).toLocaleString()
      }));

      const summary = await summarizeGroupChat(messages, groups.selectedGroup.name);
      setChatSummary(summary);
      setShowSummary(true);
      toast.success('Chat summarized successfully!');
    } catch (error) {
      console.error('Failed to summarize chat:', error);
      toast.error('Failed to summarize chat');
    } finally {
      setIsSummarizing(false);
    }
  };

  // 保存总结到Memory
  const handleSaveMemory = () => {
    if (!aiTwinProfile || !chatSummary || !groups.selectedGroup) return;

    const newMemory = {
      id: Date.now().toString(),
      content: chatSummary,
      source: 'chat_summary' as const,
      timestamp: new Date().toISOString(),
      groupName: groups.selectedGroup.name
    };

    const updatedProfile = {
      ...aiTwinProfile,
      memories: [...(aiTwinProfile.memories || []), newMemory]
    };

    handleSaveProfile(updatedProfile);
    setIsMemorySaved(true);
    toast.success('Memory saved to ' + aiTwinProfile?.name || 'Your AI Twin');
  };

  // 处理邀请接受（带群组创建回调）
  const handleAcceptInvitation = async (invitation: any) => {
    await invitations.handleAcceptInvitation(invitation, (groupId) => {
      // 邀请接受后，重新加载群组并跳转到Group Chat
      groups.loadUserGroups();
      setCurrentPage('group-chat');
    });
  };

  // 处理测试群组选择（包含测试数据）
  const handleSelectGroupWithTestData = (group: any, testMessages?: any[], testConversation?: any) => {
    // 如果是测试群组且提供了测试数据
    if (testMessages && testMessages.length > 0) {
      setTestGroupMessages(testMessages);
      console.log('📝 设置测试消息:', testMessages.length);
    } else {
      setTestGroupMessages([]);
    }
    
    if (testConversation) {
      setTestAIConversation(testConversation);
      console.log('💬 设置测试 AI 对话:', testConversation);
    } else {
      setTestAIConversation(null);
    }
    
    // 调用原始的 handleSelectGroup
    groups.handleSelectGroup(group);
  };

  // Top Bar导航项（不包括Subscribe和Settings，它们在下拉菜单中）
  const topBarItems = [
    { 
      id: 'connections', 
      icon: Search, 
      label: 'Find Connections',
      badge: null
    },
    { 
      id: 'group-chat', 
      icon: UserPlus, 
      label: 'Build Connections',
      badge: groups.userGroups.length > 0 ? groups.userGroups.length.toString() : null
    },
    { 
      id: 'review-connections', 
      icon: Star, 
      label: 'Review Connections',
      badge: null
    },
  ];

  // 渲染当前页面
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'ai-twin':
        return (
          <AITwinPage
            aiTwinProfile={aiTwinProfile}
            user={user}
            expandedFields={expandedFields}
            toggleFieldExpansion={toggleFieldExpansion}
            onEditProfile={() => {
              toast.info('Edit profile feature coming soon!');
            }}
          />
        );

      case 'connections':
        return (
          <ConnectionsPage
            aiTwinName={aiTwinProfile?.name || 'Your AI Twin'}
            aiTwinAvatar={aiTwinProfile?.avatar}
            aiTwinProfile={aiTwinProfile}
            user={user}
            conversations={conversations}
            isLoadingConversations={isLoadingConversations}
            onViewConversation={handleChatClick}
          />
        );

      case 'group-chat':
        return (
          <GroupChatPage
            userGroups={groups.userGroups}
            selectedGroup={groups.selectedGroup}
            groupMessages={testGroupMessages.length > 0 ? testGroupMessages : groups.groupMessages}
            newMessage={groups.newMessage}
            isLoadingGroups={groups.isLoadingGroups}
            isLoadingMessages={groups.isLoadingMessages}
            isSendingMessage={groups.isSendingMessage}
            isSummarizing={isSummarizing}
            chatSummary={chatSummary}
            showSummary={showSummary}
            isMemorySaved={isMemorySaved}
            currentUserId={user?.id || ''}
            sentInvitations={invitations.sentInvitations}
            receivedInvitations={invitations.receivedInvitations}
            isLoadingInvitations={invitations.isLoadingInvitations}
            aiConversationForQuote={testAIConversation || quote.aiConversationForQuote}
            isLoadingAIConversation={quote.isLoadingAIConversation}
            quotedMessage={quote.quotedMessage}
            onSelectGroup={handleSelectGroupWithTestData}
            onSendMessage={() => {
              groups.handleSendGroupMessage(quote.getCurrentQuotedMessage());
              quote.handleClearQuotedMessage(); // 发送后清除引用
            }}
            onNewMessageChange={groups.setNewMessage}
            onSummarizeChat={handleSummarizeChat}
            onSaveMemory={handleSaveMemory}
            onAcceptInvitation={handleAcceptInvitation}
            onDeclineInvitation={invitations.handleDeclineInvitation}
            onOpenQuoteSelector={quote.handleOpenQuoteSelector}
            onSelectQuotedMessage={quote.handleSelectQuotedMessage}
            onClearQuotedMessage={quote.handleClearQuotedMessage}
          />
        );

      case 'review-connections':
        return (
          <ReviewConnectionsPage
            userGroups={groups.userGroups}
            isLoadingGroups={groups.isLoadingGroups}
            currentUserId={user?.id || ''}
          />
        );

      case 'subscribe':
        return <SubscribePage aiTwinProfile={aiTwinProfile} />;

      case 'settings':
        return <SettingsPage />;

      default:
        return (
          <AITwinPage
            aiTwinProfile={aiTwinProfile}
            user={user}
            expandedFields={expandedFields}
            toggleFieldExpansion={toggleFieldExpansion}
            onEditProfile={() => {
              toast.info('Edit profile feature coming soon!');
            }}
          />
        );
    }
  };


  // 如果未登录，重定向到首页
  if (!user) {
    navigate('/');
    return null;
  }

  // 如果onboarding未完成，重定向到onboarding
  if (!progress?.isCompleted) {
    navigate('/?onboarding=true');
    return null;
  }

  return (
    <>
      {/* Daily Modeling模块 - 左上角悬浮 */}
      {dailyModeling.showDailyModeling && dailyModeling.dailyQuestions && (
        <div className="fixed top-20 left-8 z-50 w-96 bg-white rounded-2xl shadow-2xl border-2 border-emerald-200 animate-in slide-in-from-left duration-500">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12 ring-2 ring-emerald-500">
                  <AvatarImage src={aiTwinProfile?.avatar} alt={aiTwinProfile?.name} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    🤖
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{aiTwinProfile?.name || 'Your AI Twin'}</h3>
                  <p className="text-xs text-gray-500">Teach {aiTwinProfile?.name || 'Your AI Twin'} something new 🥺</p>
                </div>
              </div>
              <button
                onClick={() => {
                  // 用户可以手动关闭，但今天不会再显示
                  localStorage.setItem(
                    `dailyModeling_${user?.id}_lastCompletion`,
                    dailyModeling.dailyQuestions ? new Date().toDateString() : ''
                  );
                  toast.info('Daily modeling skipped for today');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question Bubble */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-4 border border-emerald-200">
              <p className="text-sm text-gray-800 leading-relaxed">
                {dailyModeling.currentDailyQuestion === 0
                  ? dailyModeling.dailyQuestions.valueOfferedQuestion
                  : dailyModeling.dailyQuestions.valueDesiredQuestion}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center space-x-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${dailyModeling.currentDailyQuestion === 0 ? 'bg-emerald-500' : 'bg-emerald-200'}`} />
              <div className={`w-3 h-3 rounded-full ${dailyModeling.currentDailyQuestion === 1 ? 'bg-emerald-500' : 'bg-emerald-200'}`} />
              <span className="text-xs text-gray-500 ml-2">
                Question {dailyModeling.currentDailyQuestion + 1} of 2
              </span>
            </div>

            {/* Input */}
            <div className="space-y-3">
              <Input
                value={dailyModeling.dailyInputValue}
                onChange={(e) => dailyModeling.setDailyInputValue(e.target.value)}
                placeholder="Type your answer..."
                className="border-emerald-300 focus:border-emerald-500"
                disabled={dailyModeling.isProcessingDailyAnswer}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    dailyModeling.handleDailyAnswerSubmit();
                  }
                }}
              />
              <Button
                onClick={dailyModeling.handleDailyAnswerSubmit}
                disabled={!dailyModeling.dailyInputValue.trim() || dailyModeling.isProcessingDailyAnswer}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {dailyModeling.isProcessingDailyAnswer ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : dailyModeling.currentDailyQuestion === 0 ? (
                  'Next Question'
                ) : (
                  'Complete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo & Brand - 左侧 */}
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Fingnet
                </span>
              </div>

              {/* Navigation Items - 居中 */}
              <div className="flex items-center space-x-4 absolute left-1/2 transform -translate-x-1/2">
                {topBarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* User Profile Dropdown - 右侧 */}
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all hover:bg-gray-100 ${
                        currentPage === 'ai-twin' ? 'bg-emerald-50 ring-2 ring-emerald-200' : ''
                      }`}
                      onMouseEnter={(e) => {
                        // 触发 hover 打开下拉菜单
                        const trigger = e.currentTarget;
                        trigger.click();
                      }}
                    >
                      <Avatar className="w-9 h-9 ring-2 ring-emerald-200">
                        <AvatarImage src={aiTwinProfile?.userAvatar} alt={user?.name} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {user?.name?.charAt(0) || '👤'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700">{aiTwinProfile?.userNickname || user?.name}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setCurrentPage('ai-twin')}
                      className="cursor-pointer"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      <span>AI Twin Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setCurrentPage('subscribe')}
                      className="cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      <span>Subscribe</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setCurrentPage('settings')}
                      className="cursor-pointer"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          {renderCurrentPage()}
        </div>
      </div>

      {/* Test Buttons & Back to Top - 右下角 */}
      {user && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2">
          {/* Back to Top Button */}
          {showScrollToTop && (
            <Button
              onClick={scrollToTop}
              size="icon"
              className="bg-white hover:bg-gray-100 text-gray-700 shadow-lg border border-gray-200 rounded-full w-12 h-12"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          )}

          {/* Next Day Test Button */}
          <Button
            onClick={dailyModeling.handleTestNextDay}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Clock className="w-4 h-4 mr-2" />
            Next Day (Test)
          </Button>

          {/* Reset Date Button */}
          {localStorage.getItem(`dailyModeling_testDate`) && (
            <Button
              onClick={dailyModeling.handleResetTestDate}
              size="sm"
              variant="outline"
              className="bg-white hover:bg-gray-100 shadow-lg border-2"
            >
              Reset Date
            </Button>
          )}
        </div>
      )}

      {/* 对话详情悬浮窗 */}
      {showChatDetail && selectedChat && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
          onClick={handleCloseChatDetail}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedChat.avatar} alt={selectedChat.partner} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    🤖
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedChat.partner}</h3>
                  <p className="text-sm text-gray-500">{selectedChat.topic}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {selectedChat.matchingScore && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {selectedChat.matchingScore.toFixed(1)}/10 Match
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCloseChatDetail}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* 对话内容 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {displayedMessages.map((message) => {
                  const isOwn = message.sender === aiTwinProfile?.name;
                  return (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${isOwn ? 'justify-end' : ''}`}
                    >
                      {!isOwn && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={selectedChat.avatar} alt={selectedChat.partner} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                            🤖
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                        <div className={`rounded-lg p-3 inline-block max-w-[70%] ${
                          isOwn 
                            ? 'bg-teal-50 text-gray-800' 
                            : 'bg-emerald-50 text-gray-800'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                      {isOwn && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={aiTwinProfile?.avatar || "/avatars/middle.png"} alt={aiTwinProfile?.name || "Your AI Twin"} />
                          <AvatarFallback className="bg-teal-100 text-teal-700 text-sm">
                            👤
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
                
                {/* 打字中指示器 */}
                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedChat.avatar} alt={selectedChat.partner} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                        🤖
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 底部操作 */}
            <div className="p-4 border-t border-gray-100">
              {!showFullConversation && currentMessageIndex < selectedChat.messages.length && (
                <div className="text-center mb-3">
                  <p className="text-sm text-gray-500">
                    Showing {currentMessageIndex} of {selectedChat.messages.length} messages
                  </p>
                </div>
              )}
              
              <div className="flex space-x-2 mb-3">
                {!showFullConversation && (
                  <Button
                    onClick={handleShowFullConversation}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Show Full Conversation
                  </Button>
                )}
                {selectedChat.conversationSummary && (
                  <Button
                    onClick={() => toast.info(selectedChat.conversationSummary)}
                    variant="outline"
                    className="flex-1"
                  >
                    View Summary
                  </Button>
                )}
              </div>

              {/* Interested按钮 */}
              <Button
                onClick={() => handleInterestedClick(selectedChat)}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Interested
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Main;

