import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding, type AITwinProfile } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Brain, Clock, Settings, CreditCard, Inbox, Users, LogOut, ArrowUp, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

// 导入页面组件
import AITwinPage from './main/AITwinPage';
import ConnectionsPage from './main/ConnectionsPage';
import InvitationsPage from './main/InvitationsPage';
import GroupChatPage from './main/GroupChatPage';

// 导入自定义Hooks
import { useInvitations } from '@/hooks/useInvitations';
import { useGroups } from '@/hooks/useGroups';
import { useDailyModeling } from '@/hooks/useDailyModeling';

// 导入数据库函数
import { getAITwin, upsertAITwin, getAllAITwins } from '@/lib/supabase';
import { summarizeGroupChat, calculateAITwinMatch, generateAITwinConversation } from '@/services/aiService';

const Main = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { progress, aiTwinProfile, updateAITwinProfile } = useOnboarding();
  
  // 页面导航状态
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'ai-twin';
  });

  // 使用自定义Hooks
  const invitations = useInvitations(user?.id);
  const groups = useGroups(user?.id, aiTwinProfile);
  const dailyModeling = useDailyModeling(user?.id, aiTwinProfile, updateAITwinProfile);

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

  // Connections页面状态
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

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  // 加载所有AI Twins并生成对话（用于Connections页面）
  useEffect(() => {
    const loadAllAITwinsAndGenerateConversations = async () => {
      if (!user || !aiTwinProfile) return;

      setIsLoadingConversations(true);
      try {
        // 加载所有AI Twins，排除当前用户
        const { data: allTwins, error } = await getAllAITwins(user.id);
        
        if (error) {
          console.error('Failed to load AI Twins:', error);
          toast.error('Failed to load connections');
          return;
        }

        if (!allTwins || allTwins.length === 0) {
          console.log('ℹ️ No other AI Twins found in network yet');
          setConversations([]);
          return;
        }

        console.log(`✅ Loaded ${allTwins.length} AI Twins, generating conversations...`);

        // 为每个AI Twin生成对话
        const conversationsWithData = await Promise.all(
          allTwins.map(async (twin: any) => {
            try {
              // 计算匹配分数
              const matchScore = calculateAITwinMatch(aiTwinProfile, twin);
              
              // 生成AI Twin对话
              const userTwinProfile = {
                name: aiTwinProfile.name || 'Your AI Twin',
                profile: aiTwinProfile.profile,
                goalRecently: aiTwinProfile.goalRecently || '',
                valueOffered: aiTwinProfile.valueOffered || '',
                valueDesired: aiTwinProfile.valueDesired || '',
                personality: ['Unique', 'Goal-oriented'],
                interests: aiTwinProfile.goals || []
              };

              const otherTwinProfile = {
                name: twin.name || 'Anonymous Twin',
                profile: twin.profile,
                goalRecently: twin.goalRecently || twin.goals?.[0] || '',
                valueOffered: twin.valueOffered || twin.offers?.[0] || '',
                valueDesired: twin.valueDesired || twin.lookings?.[0] || '',
                personality: ['Unique', 'Growth-minded'],
                interests: twin.goals || []
              };

              const conversationResult = await generateAITwinConversation(
                otherTwinProfile,
                userTwinProfile,
                12 // 生成12轮对话
              );

              // 生成推荐原因文本
              const recommendReason = matchScore.reasons.length > 0 
                ? matchScore.reasons.slice(0, 3).join(' · ')
                : null;

              return {
                id: twin.user_id,
                userId: twin.user_id,
                partner: twin.name || 'Anonymous Twin',
                avatar: twin.avatar || '',
                topic: twin.profile?.occupation || 'Professional',
                location: twin.profile?.location,
                occupation: twin.profile?.occupation,
                age: twin.profile?.age,
                gender: twin.profile?.gender,
                goal: twin.goalRecently || twin.goals?.[0] || '',
                matchingScore: matchScore.overallScore,
                recommended: matchScore.overallScore >= 6,
                recommendReason, // 推荐原因文本
                locationMatch: matchScore.locationMatch,
                ageMatch: matchScore.ageMatch,
                goalMatch: matchScore.goalMatch,
                reasons: matchScore.reasons,
                // 添加对话数据
                messages: conversationResult.messages,
                messageCount: conversationResult.messages.length, // 消息数量
                conversationSummary: conversationResult.conversationSummary
              };
            } catch (error) {
              console.error(`Error generating conversation for ${twin.name}:`, error);
              // 即使对话生成失败，也返回基本信息
              const matchScore = calculateAITwinMatch(aiTwinProfile, twin);
              const recommendReason = matchScore.reasons.length > 0 
                ? matchScore.reasons.slice(0, 3).join(' · ')
                : null;
              
              return {
                id: twin.user_id,
                userId: twin.user_id,
                partner: twin.name || 'Anonymous Twin',
                avatar: twin.avatar || '',
                topic: twin.profile?.occupation || 'Professional',
                location: twin.profile?.location,
                occupation: twin.profile?.occupation,
                age: twin.profile?.age,
                gender: twin.profile?.gender,
                goal: twin.goalRecently || twin.goals?.[0] || '',
                matchingScore: matchScore.overallScore,
                recommended: matchScore.overallScore >= 6,
                recommendReason, // 推荐原因文本
                locationMatch: matchScore.locationMatch,
                ageMatch: matchScore.ageMatch,
                goalMatch: matchScore.goalMatch,
                reasons: matchScore.reasons,
                messages: [],
                messageCount: 0, // 消息数量
                conversationSummary: ''
              };
            }
          })
        );

        // 按匹配分数排序（高到低）
        conversationsWithData.sort((a, b) => b.matchingScore - a.matchingScore);

        console.log(`✅ Generated conversations for ${conversationsWithData.length} AI Twins`);
        
        setConversations(conversationsWithData);
      } catch (error) {
        console.error('Error loading AI Twins:', error);
        toast.error('Failed to load connections');
      } finally {
        setIsLoadingConversations(false);
      }
    };

    if (user && aiTwinProfile) {
      loadAllAITwinsAndGenerateConversations();
    }
  }, [user, aiTwinProfile]);

  // 打字机效果 - 逐条显示对话消息
  useEffect(() => {
    if (!showChatDetail || !selectedChat || showFullConversation) return;

    if (currentMessageIndex < selectedChat.messages.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setDisplayedMessages(prev => [...prev, selectedChat.messages[currentMessageIndex]]);
        setCurrentMessageIndex(prev => prev + 1);
        setIsTyping(false);
      }, 1500); // 每条消息延迟1.5秒

      return () => clearTimeout(timer);
    }
  }, [showChatDetail, selectedChat, currentMessageIndex, showFullConversation]);

  // 处理查看对话
  const handleViewConversation = (chat: any) => {
    console.log('📖 Viewing conversation:', chat);
    setSelectedChat(chat);
    setShowChatDetail(true);
    setDisplayedMessages([]);
    setCurrentMessageIndex(0);
    setIsTyping(false);
    setShowFullConversation(false);
  };

  // 关闭对话详情
  const handleCloseChatDetail = () => {
    setShowChatDetail(false);
    setSelectedChat(null);
    setDisplayedMessages([]);
    setCurrentMessageIndex(0);
    setIsTyping(false);
    setShowFullConversation(false);
  };

  // 显示完整对话
  const handleShowFullConversation = () => {
    if (selectedChat) {
      setShowFullConversation(true);
      setDisplayedMessages(selectedChat.messages);
      setIsTyping(false);
    }
  };

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
    toast.success('Memory saved to AI Twin!');
  };

  // 处理邀请接受（带群组创建回调）
  const handleAcceptInvitation = async (invitation: any) => {
    await invitations.handleAcceptInvitation(invitation, (groupId) => {
      // 邀请接受后，重新加载群组并跳转到Group Chat
      groups.loadUserGroups();
      setCurrentPage('group-chat');
    });
  };

  // Sidebar导航项
  const sidebarItems = [
    { 
      id: 'ai-twin', 
      icon: Brain, 
      label: `You & ${aiTwinProfile?.name || 'Your AI Twin'}`,
      badge: null
    },
    { 
      id: 'connections', 
      icon: Users, 
      label: 'Connections',
      badge: null
    },
    { 
      id: 'group-chat', 
      icon: MessageCircle, 
      label: 'Group Chat',
      badge: groups.userGroups.length > 0 ? groups.userGroups.length.toString() : null
    },
    { 
      id: 'invitations', 
      icon: Inbox, 
      label: 'Invitations',
      badge: (invitations.receivedInvitations.filter(inv => inv.status === 'pending').length > 0 || 
              invitations.sentInvitations.some(inv => inv.status === 'accepted' || inv.status === 'declined')) 
              ? '!' : null
    },
    { 
      id: 'subscribe', 
      icon: CreditCard, 
      label: 'Subscribe',
      badge: null
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: 'Settings',
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
            conversations={conversations}
            isLoadingConversations={isLoadingConversations}
            aiTwinAvatar={aiTwinProfile?.avatar}
            onViewConversation={handleViewConversation}
          />
        );

      case 'invitations':
        return (
          <InvitationsPage
            sentInvitations={invitations.sentInvitations}
            receivedInvitations={invitations.receivedInvitations}
            isLoadingInvitations={invitations.isLoadingInvitations}
            onAcceptInvitation={handleAcceptInvitation}
            onDeclineInvitation={invitations.handleDeclineInvitation}
          />
        );

      case 'group-chat':
        return (
          <GroupChatPage
            userGroups={groups.userGroups}
            selectedGroup={groups.selectedGroup}
            groupMessages={groups.groupMessages}
            newMessage={groups.newMessage}
            isLoadingGroups={groups.isLoadingGroups}
            isLoadingMessages={groups.isLoadingMessages}
            isSendingMessage={groups.isSendingMessage}
            isSummarizing={isSummarizing}
            chatSummary={chatSummary}
            showSummary={showSummary}
            isMemorySaved={isMemorySaved}
            currentUserId={user?.id || ''}
            onSelectGroup={groups.handleSelectGroup}
            onSendMessage={groups.handleSendGroupMessage}
            onNewMessageChange={groups.setNewMessage}
            onSummarizeChat={handleSummarizeChat}
            onSaveMemory={handleSaveMemory}
          />
        );

      case 'subscribe':
        return renderSubscribePage();

      case 'settings':
        return renderSettingsPage();

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

  // 临时的Subscribe和Settings页面
  const renderSubscribePage = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Subscribe to Premium</h2>
      <p className="text-gray-600">Premium features coming soon!</p>
    </div>
  );

  const renderSettingsPage = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Settings</h2>
      <Button
        onClick={() => {
          logout();
          navigate('/');
        }}
        variant="destructive"
        className="w-full"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );

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
                  <p className="text-xs text-gray-500">Daily Modeling</p>
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
            <div className="flex items-center space-x-8">
              {/* Logo & Brand */}
              <div className="flex items-center space-x-2 mr-8">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Fingnet
                </span>
              </div>

              {/* Navigation Items */}
              {sidebarItems.map((item) => {
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

              {/* User Avatar */}
              {/* <div className="ml-auto flex items-center space-x-3">
                <Avatar className="w-9 h-9 ring-2 ring-emerald-200">
                  <AvatarImage src={aiTwinProfile?.userAvatar} alt={user?.name} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {user?.name?.charAt(0) || '👤'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{aiTwinProfile?.userNickname || user?.name}</span>
              </div> */}
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
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {displayedMessages.map((message, index) => {
                  const isOwn = message.sender === aiTwinProfile?.name;
                  return (
                    <div
                      key={index}
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
            </ScrollArea>

            {/* 底部操作 */}
            <div className="p-4 border-t border-gray-100">
              {!showFullConversation && currentMessageIndex < selectedChat.messages.length && (
                <div className="text-center mb-3">
                  <p className="text-sm text-gray-500">
                    Showing {currentMessageIndex} of {selectedChat.messages.length} messages
                  </p>
                </div>
              )}
              
              <div className="flex space-x-2">
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Main;

