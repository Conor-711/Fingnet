import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOnboarding, type AITwinProfile, type Memory } from '@/contexts/OnboardingContext';
import { generateAITwinConversation, withRetry, summarizeGroupChat, type AITwinConversationProfile, type GeneratedMessage, type AITwinConversationResult, type ChatMessage } from '@/services/aiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, User, Brain, Target, Sparkles, Clock, Settings, CreditCard, Send, Inbox, Users, Plus, Trash2 } from 'lucide-react';
import AITwinConnectionAnimation from '@/components/AITwinConnectionAnimation';

const Main = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { progress, aiTwinProfile, updateAITwinProfile } = useOnboarding();
  const [currentPage, setCurrentPage] = useState(() => {
    // 初始化时检查URL参数
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'ai-twin';
  });
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChatDetail, setShowChatDetail] = useState(false);
  const [isGeneratingConversations, setIsGeneratingConversations] = useState(false);
  const [generatedConversations, setGeneratedConversations] = useState<Record<string, AITwinConversationResult>>({});
  
  // 打字机效果状态
  const [displayedMessages, setDisplayedMessages] = useState<GeneratedMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showFullConversation, setShowFullConversation] = useState(false);
  
  // 邀请通知状态
  const [hasNewSentResponse, setHasNewSentResponse] = useState(true); // 模拟有新的已发送邀请被接受
  const [hasNewReceivedInvite, setHasNewReceivedInvite] = useState(true); // 模拟有新收到的邀请
  
  // 群聊相关状态
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [chatSummary, setChatSummary] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isMemorySaved, setIsMemorySaved] = useState(false);
  
  // AI Twin编辑状态
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedProfile, setEditedProfile] = useState<AITwinProfile | null>(null);
  
  // 处理编辑AI Twin
  const handleEditProfile = () => {
    if (aiTwinProfile) {
      // 初始化数组字段，如果不存在则从旧字段转换
      const initialProfile = {
        ...aiTwinProfile,
        goals: aiTwinProfile.goals || (aiTwinProfile.goalRecently ? [aiTwinProfile.goalRecently] : ['']),
        offers: aiTwinProfile.offers || (aiTwinProfile.valueOffered ? [aiTwinProfile.valueOffered] : ['']),
        lookings: aiTwinProfile.lookings || (aiTwinProfile.valueDesired ? [aiTwinProfile.valueDesired] : [''])
      };
      setEditedProfile(initialProfile);
      setShowEditModal(true);
    }
  };
  
  // 处理保存编辑
  const handleSaveProfile = () => {
    if (editedProfile && updateAITwinProfile) {
      // 过滤掉空字符串
      const cleanedProfile = {
        ...editedProfile,
        goals: editedProfile.goals?.filter(g => g.trim()) || [],
        offers: editedProfile.offers?.filter(o => o.trim()) || [],
        lookings: editedProfile.lookings?.filter(l => l.trim()) || [],
        // 为向后兼容保留单个字段
        goalRecently: editedProfile.goals?.[0] || '',
        valueOffered: editedProfile.offers?.[0] || '',
        valueDesired: editedProfile.lookings?.[0] || ''
      };
      updateAITwinProfile(cleanedProfile);
      setShowEditModal(false);
    }
  };
  
  // 处理取消编辑
  const handleCancelEdit = () => {
    setEditedProfile(null);
    setShowEditModal(false);
  };
  
  // 添加新条目
  const addNewItem = (field: 'goals' | 'offers' | 'lookings') => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [field]: [...(editedProfile[field] || []), '']
      });
    }
  };
  
  // 删除条目
  const removeItem = (field: 'goals' | 'offers' | 'lookings', index: number) => {
    if (editedProfile && editedProfile[field]) {
      const newItems = [...editedProfile[field]!];
      newItems.splice(index, 1);
      setEditedProfile({
        ...editedProfile,
        [field]: newItems.length > 0 ? newItems : [''] // 至少保留一个空条目
      });
    }
  };
  
  // 更新条目
  const updateItem = (field: 'goals' | 'offers' | 'lookings', index: number, value: string) => {
    if (editedProfile && editedProfile[field]) {
      const newItems = [...editedProfile[field]!];
      newItems[index] = value;
      setEditedProfile({
        ...editedProfile,
        [field]: newItems
      });
    }
  };

  // 保存聊天总结到Memory
  const handleSaveToMemory = () => {
    if (!chatSummary || !aiTwinProfile || !selectedGroup || !updateAITwinProfile) return;
    
    const newMemory: Memory = {
      id: `memory-${Date.now()}`,
      content: chatSummary,
      source: 'chat_summary',
      timestamp: new Date().toISOString(),
      groupName: selectedGroup.name
    };
    
    const updatedProfile = {
      ...aiTwinProfile,
      memories: [...(aiTwinProfile.memories || []), newMemory]
    };
    
    updateAITwinProfile(updatedProfile);
    setIsMemorySaved(true);
    
    // 3秒后重置保存状态
    setTimeout(() => {
      setIsMemorySaved(false);
    }, 3000);
  };

  // AI Twin数据库
  const aiTwinsDatabase: Record<string, AITwinConversationProfile> = {
    'alex': {
      name: "Alex",
      profile: {
        gender: "Male",
        age: "28", 
        occupation: "AI Content Creator",
        location: "San Francisco, CA"
      },
      goalRecently: "I'm focused on building a thriving community around AI education. My goal is to create content that makes complex AI concepts accessible to everyone, while growing my audience to 50k engaged followers who actively participate in discussions and share their own learning journeys.",
      valueOffered: "I can provide deep technical insights into machine learning and AI development, along with proven strategies for content creation and community building. My experience includes 5 years in AI research and 2 years building educational content that has helped thousands of people understand AI concepts.",
      valueDesired: "I'm looking for connections with other educators and content creators who can share advanced storytelling techniques and audience engagement strategies. I especially want to learn from people who have successfully scaled educational communities and those with expertise in cross-platform content distribution.",
      personality: ["Technical", "Educational", "Community-focused"],
      interests: ["AI Education", "Content Strategy", "Community Building"]
    },
    'sarah': {
      name: "Sarah",
      profile: {
        gender: "Female",
        age: "32",
        occupation: "Product Manager", 
        location: "New York, NY"
      },
      goalRecently: "Currently working on launching my own SaaS product focused on productivity tools for remote teams. My goal is to validate the product-market fit within the next 6 months and secure initial funding while maintaining my current role.",
      valueOffered: "I bring 6 years of product management experience and deep insights into user research, product strategy, and go-to-market planning. I can help others with product validation, feature prioritization, and building effective feedback loops with users.",
      valueDesired: "I'm seeking guidance from successful SaaS founders and technical advisors who can help with technical architecture decisions, fundraising strategies, and scaling challenges. I'd also love to connect with other product managers who are building their own products.",
      personality: ["Strategic", "Analytical", "Results-driven"],
      interests: ["SaaS Development", "Product Strategy", "Remote Work"]
    },
    'marcus': {
      name: "Marcus",
      profile: {
        gender: "Male",
        age: "26",
        occupation: "Full-Stack Developer",
        location: "Austin, TX"
      },
      goalRecently: "Transitioning from design to full-stack development to create meaningful projects that address social issues. My immediate goal is to complete 3 full-stack projects in the next 4 months and land a developer role at a social impact company.",
      valueOffered: "I combine strong design thinking with growing technical skills, offering a unique perspective on user experience and frontend development. I can help others with UI/UX design, prototyping, and creating user-centered applications.",
      valueDesired: "I need mentorship on backend development, system architecture, and technical interview preparation. I'm particularly interested in connecting with developers who work on social impact projects and can share insights about the intersection of technology and social good.",
      personality: ["Creative", "Purpose-driven", "Collaborative"],
      interests: ["Social Impact", "Full-Stack Development", "UI/UX Design"]
    }
  };

  // 模拟邀请数据
  const mockInvitationsSent = [
    {
      id: 1,
      recipientName: "Alex Thompson",
      recipientAvatar: "/src/assets/network/2.png",
      sentDate: "2024-03-15",
      status: "accepted", // pending, accepted, declined
      acceptedDate: "2024-03-16",
      connectionType: "AI Twin Chat"
    },
    {
      id: 2,
      recipientName: "Sarah Chen",
      recipientAvatar: "/src/assets/network/3.png",
      sentDate: "2024-03-14",
      status: "pending",
      connectionType: "AI Twin Chat"
    },
    {
      id: 3,
      recipientName: "Marcus Rodriguez",
      recipientAvatar: "/src/assets/network/4.png",
      sentDate: "2024-03-13",
      status: "declined",
      declinedDate: "2024-03-14",
      connectionType: "AI Twin Chat"
    }
  ];

  const mockInvitationsReceived = [
    {
      id: 1,
      senderName: "Emma Watson",
      senderAvatar: "/src/assets/network/1.png",
      receivedDate: "2024-03-16",
      status: "pending", // pending, accepted, declined
      connectionType: "AI Twin Chat",
      message: "Hi! I'd love to connect our AI Twins for collaborative discussions about sustainable tech."
    },
    {
      id: 2,
      senderName: "David Kim",
      senderAvatar: "/src/assets/network/2.png",
      receivedDate: "2024-03-15",
      status: "accepted",
      acceptedDate: "2024-03-15",
      connectionType: "AI Twin Chat",
      message: "Looking forward to sharing insights about entrepreneurship and startup growth!"
    },
    {
      id: 3,
      senderName: "Lisa Johnson",
      senderAvatar: "/src/assets/network/3.png",
      receivedDate: "2024-03-14",
      status: "pending",
      connectionType: "AI Twin Chat",
      message: "Would love to connect and discuss content creation strategies and audience engagement."
    }
  ];

  // 获取用户头像（使用AI Twin的头像或默认头像）
  const getUserAvatar = () => aiTwinProfile?.avatar || "/src/assets/network/middle.png";

  // 模拟群聊数据
  const mockGroupChats = [
    {
      id: 1,
      name: "AI Entrepreneurs Hub",
      avatar: "/src/assets/network/1.png",
      lastMessage: "Great insights on scaling AI products!",
      lastMessageTime: "2 min ago",
      unreadCount: 3,
      participants: [
        { name: "Alex Thompson", avatar: "/src/assets/network/2.png" },
        { name: "Sarah Chen", avatar: "/src/assets/network/3.png" },
        { name: "Marcus Rodriguez", avatar: "/src/assets/network/4.png" },
        { name: "Emma Watson", avatar: "/src/assets/network/1.png" }
      ],
      messages: [
        {
          id: 1,
          sender: "Alex Thompson",
          senderAvatar: "/src/assets/network/2.png",
          content: "Hey everyone! Just launched my new AI product. Would love to get your feedback on the user experience.",
          timestamp: "10:30 AM",
          isOwn: false
        },
        {
          id: 2,
          sender: "Sarah Chen",
          senderAvatar: "/src/assets/network/3.png",
          content: "Congratulations Alex! 🎉 I'd be happy to test it out. What's the main value proposition?",
          timestamp: "10:32 AM",
          isOwn: false
        },
        {
          id: 3,
          sender: "You",
          senderAvatar: getUserAvatar(),
          content: "That's awesome Alex! I'm particularly interested in how you handled the onboarding flow.",
          timestamp: "10:35 AM",
          isOwn: true
        },
        {
          id: 4,
          sender: "Marcus Rodriguez",
          senderAvatar: "/src/assets/network/4.png",
          content: "Great insights on scaling AI products!",
          timestamp: "10:38 AM",
          isOwn: false
        }
      ]
    },
    {
      id: 2,
      name: "Content Creators Circle",
      avatar: "/src/assets/network/2.png",
      lastMessage: "Anyone tried the new GPT features?",
      lastMessageTime: "1 hour ago",
      unreadCount: 0,
      participants: [
        { name: "Emma Watson", avatar: "/src/assets/network/1.png" },
        { name: "David Kim", avatar: "/src/assets/network/2.png" },
        { name: "Lisa Johnson", avatar: "/src/assets/network/3.png" }
      ],
      messages: [
        {
          id: 1,
          sender: "Emma Watson",
          senderAvatar: "/src/assets/network/1.png",
          content: "Anyone tried the new GPT features? I'm thinking of integrating them into my content workflow.",
          timestamp: "9:15 AM",
          isOwn: false
        },
        {
          id: 2,
          sender: "David Kim",
          senderAvatar: "/src/assets/network/2.png",
          content: "Yes! The new vision capabilities are game-changing for content analysis.",
          timestamp: "9:20 AM",
          isOwn: false
        }
      ]
    },
    {
      id: 3,
      name: "Tech Innovators",
      avatar: "/src/assets/network/3.png",
      lastMessage: "Excited to share my latest project!",
      lastMessageTime: "3 hours ago",
      unreadCount: 1,
      participants: [
        { name: "Sarah Chen", avatar: "/src/assets/network/3.png" },
        { name: "Alex Thompson", avatar: "/src/assets/network/2.png" }
      ],
      messages: [
        {
          id: 1,
          sender: "Sarah Chen",
          senderAvatar: "/src/assets/network/3.png",
          content: "Excited to share my latest project! Working on a sustainable tech solution.",
          timestamp: "7:45 AM",
          isOwn: false
        }
      ]
    }
  ];

  // 侧边栏导航项
  const sidebarItems = [
    {
      id: 'ai-twin',
      label: 'AI Twin',
      icon: Brain,
      active: currentPage === 'ai-twin'
    },
    {
      id: 'group-chat',
      label: 'Group Chat',
      icon: Users,
      active: currentPage === 'group-chat'
    },
    {
      id: 'invitation-sent',
      label: 'Invitation Sent',
      icon: Send,
      active: currentPage === 'invitation-sent',
      hasNotification: hasNewSentResponse
    },
    {
      id: 'invitation-received',
      label: 'Invitation Received',
      icon: Inbox,
      active: currentPage === 'invitation-received',
      hasNotification: hasNewReceivedInvite
    },
    {
      id: 'subscribe',
      label: 'Upgrade',
      icon: CreditCard,
      active: currentPage === 'subscribe'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      active: currentPage === 'settings'
    }
  ];

  // 处理聊天点击
  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    setShowChatDetail(true);
    
    // 启动打字机效果
    if (chat.messages && chat.messages.length > 0) {
      startTypewriterEffect(chat.messages);
    }
  };

  // 处理Interested按钮点击，跳转到对方AI Twin主页
  const handleInterestedClick = (chat) => {
    setShowChatDetail(false);
    // 根据聊天伙伴的名字映射到profile ID
    const profileId = chat.partner.toLowerCase().replace('\'s ai twin', '').replace(' ', '');
    navigate(`/profile/${profileId}`);
  };

  // 打字机效果控制
  const startTypewriterEffect = (messages: GeneratedMessage[]) => {
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
        
        // 根据消息长度调整延迟时间（为拆分后的短消息优化）
        const messageLength = message.content.length;
        const baseDelay = 800; // 减少基础延迟，因为消息更短了
        const charDelay = Math.min(messageLength * 25, 2000); // 每个字符25ms，最多2秒
        const totalDelay = baseDelay + charDelay;
        
        setTimeout(displayNextMessage, totalDelay);
      } else {
        setIsTyping(false);
        setShowFullConversation(true);
      }
    };
    
    // 开始显示第一条消息
    setTimeout(displayNextMessage, 1000);
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

  // 生成AI驱动的对话
  const generateConversationsForAllChats = async () => {
    if (!aiTwinProfile || isGeneratingConversations) return;
    
    setIsGeneratingConversations(true);
    
    try {
      // 创建用户的AI Twin Profile
      const userAITwin: AITwinConversationProfile = {
        name: aiTwinProfile.name || "Your AI Twin",
        profile: aiTwinProfile.profile,
        goalRecently: aiTwinProfile.goalRecently,
        valueOffered: aiTwinProfile.valueOffered,
        valueDesired: aiTwinProfile.valueDesired,
        personality: ["Unique", "Goal-oriented", "Growth-minded"],
        interests: ["Personal Development", "Networking", "Learning"]
      };

      const conversations: Record<string, AITwinConversationResult> = {};
      
      // 为每个AI Twin生成对话（限制20轮）
      for (const [twinId, twinProfile] of Object.entries(aiTwinsDatabase)) {
        try {
          const conversationResult = await withRetry(() => 
            generateAITwinConversation(twinProfile, userAITwin, 12) // 生成12轮对话
          );
          conversations[twinId] = conversationResult;
        } catch (error) {
          console.error(`Error generating conversation for ${twinId}:`, error);
          // 使用空结果，AI服务已经有fallback逻辑
        }
      }
      
      setGeneratedConversations(conversations);
    } catch (error) {
      console.error('Error generating conversations:', error);
    } finally {
      setIsGeneratingConversations(false);
    }
  };

  // 处理URL参数导航
  useEffect(() => {
    const tab = searchParams.get('tab');
    const groupId = searchParams.get('groupId');
    
    // 只有当URL有tab参数时才更新页面
    if (tab) {
      setCurrentPage(tab);
      
      // 如果有groupId参数，可以在这里处理选择对应的group
      if (groupId && tab === 'group-chat') {
        // 这里可以添加逻辑来选择特定的group
        // 例如：setSelectedGroup(groupId);
        console.log('Navigating to group:', groupId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 当AI Twin Profile可用时生成对话
  useEffect(() => {
    if (aiTwinProfile && Object.keys(generatedConversations).length === 0) {
      generateConversationsForAllChats();
    }
  }, [aiTwinProfile]);

  // 动态生成聊天历史记录
  const getDynamicChatHistory = () => {
    return Object.entries(aiTwinsDatabase).map(([twinId, twinProfile], index) => {
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
      
      return {
        id: index + 1,
        partner: `${twinProfile.name}'s AI Twin`,
        avatar: `/src/assets/network/${index + 2}.png`,
        lastMessage: lastMessage.substring(0, 80) + (lastMessage.length > 80 ? '...' : ''),
        timestamp: conversation.length > 0 ? conversation[conversation.length - 1].timestamp : 'Just now',
        messageCount: conversation.length,
        topic: twinProfile.interests?.[0] || 'General Discussion',
        recommended: isRecommended,
        messages: conversation.map(msg => ({
          id: msg.id,
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp,
          isOwn: msg.isOwn
        })),
        twinProfile,
        conversationResult, // 包含评分和总结信息
        matchingScore: averageScore
      };
    });
  };

  // 渲染AI Twin页面内容
  const renderAITwinPage = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Side - AI Twin Features */}
      <div className="space-y-6">
{aiTwinProfile ? (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>{aiTwinProfile?.name || 'Your AI Twin'} Profile</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditProfile}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={aiTwinProfile.avatar || "/src/assets/network/middle.png"} alt={aiTwinProfile.name || "Your AI Twin"} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl">
                    🤖
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{aiTwinProfile?.name || 'Your AI Twin'}</h3>
                  <p className="text-gray-600">Created from your conversation with AI</p>
                  <Badge variant="outline" className="mt-1">
                    Profile Complete
                  </Badge>
                </div>
              </div>

              <div className="space-y-6">
                {/* Profile Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-lg mr-2">👤</span>
                    Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">{aiTwinProfile.profile.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{aiTwinProfile.profile.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupation:</span>
                      <span className="font-medium">{aiTwinProfile.profile.occupation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{aiTwinProfile.profile.location}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Current Goals */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-blue-600" />
                    Current Goals
                  </h4>
                  <div className="space-y-2">
                    {(aiTwinProfile.goals && aiTwinProfile.goals.length > 0) ? (
                      aiTwinProfile.goals.map((goal, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700 leading-relaxed flex-1">
                            {goal}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {aiTwinProfile.goalRecently || 'No goals set'}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* What I Can Offer */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-lg mr-2">💝</span>
                    What I Can Offer
                  </h4>
                  <div className="space-y-2">
                    {(aiTwinProfile.offers && aiTwinProfile.offers.length > 0) ? (
                      aiTwinProfile.offers.map((offer, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700 leading-relaxed flex-1">
                            {offer}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {aiTwinProfile.valueOffered || 'No offers set'}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* What I'm Looking For */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-lg mr-2">🌟</span>
                    What I'm Looking For
                  </h4>
                  <div className="space-y-2">
                    {(aiTwinProfile.lookings && aiTwinProfile.lookings.length > 0) ? (
                      aiTwinProfile.lookings.map((looking, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700 leading-relaxed flex-1">
                            {looking}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {aiTwinProfile.valueDesired || 'No lookings set'}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Memory */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Brain className="w-4 h-4 mr-2 text-indigo-600" />
                    Memory
                  </h4>
                  <div className="space-y-3">
                    {(aiTwinProfile.memories && aiTwinProfile.memories.length > 0) ? (
                      aiTwinProfile.memories.slice().reverse().map((memory) => (
                        <div key={memory.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="text-xs bg-white/50">
                              {memory.source === 'chat_summary' ? '💬 Chat Summary' : 
                               memory.source === 'user_input' ? '✍️ User Input' : 
                               '🤝 Conversation'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(memory.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          {memory.groupName && (
                            <p className="text-xs text-indigo-600 mb-1 font-medium">
                              From: {memory.groupName}
                            </p>
                          )}
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {memory.content}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No memories yet. Summarize conversations to build {aiTwinProfile?.name || 'Your AI Twin'} 's memory.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{aiTwinProfile?.name || 'Your AI Twin'} Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Twin Profile Found</h3>
                <p className="text-gray-600 mb-4">
                  Complete the onboarding process to create your AI Twin profile and set a name.
                </p>
                <Button 
                  onClick={() => navigate('/onboarding')}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  Start Onboarding
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Side - Chat History */}
      <div className="space-y-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Conversation History</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="p-6 space-y-4">
                {isGeneratingConversations ? (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <span className="text-sm font-medium font-outfit text-black">{aiTwinProfile?.name || 'Your AI Twin'} is chatting with friends</span>
                      <p className="text-xs text-gray-500 mt-1">Building connections...</p>
                    </div>
                    <AITwinConnectionAnimation userAvatar={aiTwinProfile?.avatar} />
                  </div>
                ) : (
                  <>
                    {getDynamicChatHistory().map((chat, index) => (
                  <div
                    key={chat.id}
                    className={`p-4 border rounded-lg transition-all cursor-pointer animate-fade-in ${
                      chat.recommended 
                        ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 shadow-md' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleChatClick(chat)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      {chat.recommended && (
                        <Badge className="bg-emerald-600 text-white text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          RECOMMENDED
                        </Badge>
                      )}
                      {chat.matchingScore && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Match:</span>
                          <Badge variant="outline" className="text-xs">
                            {chat.matchingScore.toFixed(1)}/10
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={chat.avatar} alt={chat.partner} />
                        <AvatarFallback className="bg-teal-100 text-teal-700">
                          🤖
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {chat.partner}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{chat.timestamp}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {chat.topic}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {chat.messageCount} messages
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Connection Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-600">4</div>
                <div className="text-sm text-gray-600">Active Chats</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-600">41</div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Connections Made</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // 渲染Group Chat页面内容
  const renderGroupChatPage = () => {
    // 处理群聊切换
    const handleGroupSelect = (group) => {
      setSelectedGroup(group);
      // 切换群聊时重置总结状态
      setChatSummary(null);
      setShowSummary(false);
      setIsMemorySaved(false);
    };

    // 处理总结聊天
    const handleSummarizeChat = async () => {
      if (!selectedGroup || !aiTwinProfile) return;
      
      setIsSummarizing(true);
      setShowSummary(true);
      
      try {
        // 将消息转换为ChatMessage格式
        const chatMessages: ChatMessage[] = selectedGroup.messages.map(msg => ({
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp
        }));
        
        // 调用AI总结
        const summary = await summarizeGroupChat(
          chatMessages,
          aiTwinProfile.name || "AI Twin"
        );
        
        setChatSummary(summary);
      } catch (error) {
        console.error('Error summarizing chat:', error);
        setChatSummary('Failed to generate summary. Please try again.');
      } finally {
        setIsSummarizing(false);
      }
    };

    // 处理发送消息
    const handleSendMessage = () => {
      if (newMessage.trim() && selectedGroup) {
        const newMsg = {
          id: selectedGroup.messages.length + 1,
          sender: "You",
          senderAvatar: aiTwinProfile?.avatar || "/src/assets/network/middle.png",
          content: newMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: true
        };

        // 更新选中群聊的消息
        setSelectedGroup(prev => ({
          ...prev,
          messages: [...prev.messages, newMsg]
        }));

        setNewMessage('');
      }
    };

    // 处理回车发送
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    };

    return (
      <div className="h-full flex">
        {/* 左侧群聊列表 */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Group Chats</h2>
            <p className="text-sm text-gray-600">Manage your group conversations</p>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {mockGroupChats.map((group) => (
                <div
                  key={group.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedGroup?.id === group.id
                      ? 'bg-emerald-100 border-emerald-300'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleGroupSelect(group)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={group.avatar} alt={group.name} />
                        <AvatarFallback className="bg-teal-100 text-teal-700">
                          {group.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {group.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {group.unreadCount}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
                        <span className="text-xs text-gray-500">{group.lastMessageTime}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{group.lastMessage}</p>
                      <div className="flex items-center mt-2">
                        <div className="flex -space-x-1">
                          {group.participants.slice(0, 3).map((participant, index) => (
                            <Avatar key={index} className="w-5 h-5 border border-white">
                              <AvatarImage src={participant.avatar} alt={participant.name} />
                              <AvatarFallback className="text-xs bg-gray-100">
                                {participant.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {group.participants.length > 3 && (
                            <div className="w-5 h-5 bg-gray-200 rounded-full border border-white flex items-center justify-center">
                              <span className="text-xs text-gray-600">+{group.participants.length - 3}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">{group.participants.length} members</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* 右侧聊天界面 */}
        <div className="flex-1 flex flex-col">
          {selectedGroup ? (
            <>
              {/* 聊天头部 */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedGroup.avatar} alt={selectedGroup.name} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {selectedGroup.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedGroup.name}</h3>
                      <p className="text-sm text-gray-500">{selectedGroup.participants.length} members</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSummarizeChat}
                      disabled={isSummarizing}
                    >
                      {isSummarizing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Summarizing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Summarize
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      Members
                    </Button>
                  </div>
                </div>
              </div>

              {/* 总结区域 */}
              {showSummary && chatSummary && (
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 animate-fade-in">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <span className="mr-2">AI Summary by {aiTwinProfile?.name || 'AI Twin'}</span>
                        </h4>
                        <button
                          onClick={() => setShowSummary(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">{chatSummary}</p>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={handleSaveToMemory}
                          disabled={isMemorySaved}
                          className={`${
                            isMemorySaved 
                              ? 'bg-green-600 hover:bg-green-600' 
                              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                          } text-white`}
                        >
                          {isMemorySaved ? (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Saved to Memory!
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4 mr-1" />
                              Add to {aiTwinProfile?.name || 'Your AI Twin'}'s Memory
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 消息区域 */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedGroup.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.isOwn ? 'justify-end' : ''
                      }`}
                    >
                      {!message.isOwn && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.senderAvatar} alt={message.sender} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                            {message.sender.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'order-last' : ''}`}>
                        {!message.isOwn && (
                          <p className="text-sm font-medium text-gray-900 mb-1">{message.sender}</p>
                        )}
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            message.isOwn
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
                      </div>

                      {message.isOwn && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.senderAvatar} alt={message.sender} />
                          <AvatarFallback className="bg-teal-100 text-teal-700 text-sm">
                            You
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* 消息输入区域 */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // 未选择群聊时的占位符
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a group chat</h3>
                <p className="text-gray-500">Choose a group from the left to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染Invitation Sent页面内容
  const renderInvitationSentPage = () => (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invitation Sent</h1>
        <p className="text-gray-600">Track the status of your sent invitations</p>
      </div>

      <div className="space-y-4">
        {mockInvitationsSent.map((invitation) => (
          <Card key={invitation.id} className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={invitation.recipientAvatar} alt={invitation.recipientName} />
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      {invitation.recipientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{invitation.recipientName}</h3>
                    <p className="text-sm text-gray-500">{invitation.connectionType}</p>
                    <p className="text-xs text-gray-400">Sent on {invitation.sentDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {invitation.status === 'pending' && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {invitation.status === 'accepted' && (
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Accepted
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">Accepted on {invitation.acceptedDate}</p>
                    </div>
                  )}
                  {invitation.status === 'declined' && (
                    <div className="text-right">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                        Declined
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">Declined on {invitation.declinedDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // 渲染Invitation Received页面内容
  const renderInvitationReceivedPage = () => (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invitation Received</h1>
        <p className="text-gray-600">Manage invitations you've received from other users</p>
      </div>

      <div className="space-y-4">
        {mockInvitationsReceived.map((invitation) => (
          <Card key={invitation.id} className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={invitation.senderAvatar} alt={invitation.senderName} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {invitation.senderName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{invitation.senderName}</h3>
                    <p className="text-sm text-gray-500">{invitation.connectionType}</p>
                    <p className="text-xs text-gray-400 mb-3">Received on {invitation.receivedDate}</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                      "{invitation.message}"
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {invitation.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Decline
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Accept
                      </Button>
                    </>
                  )}
                  {invitation.status === 'accepted' && (
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Accepted
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">Accepted on {invitation.acceptedDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // 渲染Subscribe页面内容
  const renderSubscribePage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">Unlock the full potential of {aiTwinProfile?.name || 'your AI Twin'}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Standard Plan */}
        <Card className="shadow-xl border-2 border-gray-200 hover:border-emerald-300 transition-colors">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-bold text-gray-900">Standard</CardTitle>
            <div className="mt-4">
              <span className="text-5xl font-bold text-emerald-600">$20</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Make your AI twin better</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">500 chat messages/month</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Priority support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Advanced AI Twin features</span>
              </div>
            </div>
            <Button className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg">
              Choose Standard
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="shadow-xl border-2 border-emerald-400 hover:border-emerald-500 transition-colors relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-emerald-600 text-white px-4 py-1 text-sm font-semibold">
              MOST POPULAR
            </Badge>
          </div>
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-bold text-gray-900">Pro</CardTitle>
            <div className="mt-4">
              <span className="text-5xl font-bold text-emerald-600">$60</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Make your AI twin the best</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Unlimited chat messages</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">24/7 premium support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">All AI Twin features</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Early access to new features</span>
              </div>
            </div>
            <Button className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 text-lg">
              Choose Pro
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">All plans include a 7-day free trial</p>
        <p className="text-sm text-gray-500">Cancel anytime. No hidden fees.</p>
      </div>
    </div>
  );

  // 渲染Settings页面内容
  const renderSettingsPage = () => (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Settings page coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );

  // 根据当前页面渲染内容
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'ai-twin':
        return renderAITwinPage();
      case 'group-chat':
        return renderGroupChatPage();
      case 'invitation-sent':
        return renderInvitationSentPage();
      case 'invitation-received':
        return renderInvitationReceivedPage();
      case 'subscribe':
        return renderSubscribePage();
      case 'settings':
        return renderSettingsPage();
      default:
        return renderAITwinPage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Fingnet</h1>
              <p className="text-sm text-gray-600">Dashboard</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={item.active ? "default" : "ghost"}
                  className={`w-full justify-start relative ${
                    item.active 
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setCurrentPage(item.id);
                    // 点击后清除对应的通知
                    if (item.id === 'invitation-sent') {
                      setHasNewSentResponse(false);
                    } else if (item.id === 'invitation-received') {
                      setHasNewReceivedInvite(false);
                    }
                  }}
                >
                  <IconComponent className="w-4 h-4 mr-3" />
                  {item.label}
                  {/* 红点通知 */}
                  {item.hasNotification && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                <Sparkles className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            <p className="text-sm text-emerald-700">Your AI Twin is online and ready to connect!</p>
          </div>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentPage === 'group-chat' ? (
          <div className="h-full">
            {renderCurrentPage()}
          </div>
        ) : (
          <div className="p-8">
            {renderCurrentPage()}
          </div>
        )}
      </div>

      {/* 聊天详情悬浮窗 */}
      {showChatDetail && selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => {
          setShowChatDetail(false);
          setDisplayedMessages([]);
          setCurrentMessageIndex(0);
          setIsTyping(false);
          setShowFullConversation(false);
        }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
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
                  <h4 className="font-semibold text-gray-900">{selectedChat.partner}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedChat.topic}
                    </Badge>
                    {selectedChat.recommended && (
                      <Badge className="bg-emerald-600 text-white text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        RECOMMENDED
                      </Badge>
                    )}
                    {selectedChat.matchingScore && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        {selectedChat.matchingScore.toFixed(1)}/10 Match
                      </Badge>
                    )}
                  </div>
                  {/* {selectedChat.conversationResult?.conversationSummary && (
                    <p className="text-xs text-gray-500 mt-1 max-w-md">
                      {selectedChat.conversationResult.conversationSummary}
                    </p>
                  )} */}
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowChatDetail(false);
                  setDisplayedMessages([]);
                  setCurrentMessageIndex(0);
                  setIsTyping(false);
                  setShowFullConversation(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 聊天内容 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 打字机效果显示区域 */}
              {displayedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${message.isOwn ? 'justify-end' : ''}`}
                >
                  {!message.isOwn && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedChat.avatar} alt={selectedChat.partner} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                        🤖
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex-1 ${message.isOwn ? 'text-right' : ''}`}>
                    <div className={`rounded-lg p-3 inline-block max-w-xs ${
                      message.isOwn 
                        ? 'bg-teal-50 text-gray-800' 
                        : 'bg-emerald-50 text-gray-800'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
                  </div>
                  {message.isOwn && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={aiTwinProfile?.avatar || "/src/assets/network/middle.png"} alt={aiTwinProfile?.name || "Your AI Twin"} />
                      <AvatarFallback className="bg-teal-100 text-teal-700 text-sm">
                        👤
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {/* 打字中指示器 */}
              {isTyping && (
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedChat.avatar} alt={selectedChat.partner} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                      🤖
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                      <span className="text-xs text-gray-500">Typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 打字机效果控制区域 */}
            {selectedChat && selectedChat.messages && selectedChat.messages.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-50 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>
                      {displayedMessages.length} / {selectedChat.messages.length} messages
                    </span>
                    {isTyping && (
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-blue-600">AI is chatting</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {isTyping && (
                      <Button
                        onClick={skipTypewriterEffect}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Skip animation
                      </Button>
                    )}
                    {showFullConversation && (
                      <Button
                        onClick={() => startTypewriterEffect(selectedChat.messages)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Replay conversation
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Interested按钮 */}
            <div className="p-4 border-t border-gray-100">
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

      {/* AI Twin编辑模态框 */}
      {showEditModal && editedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCancelEdit}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* 模态框头部 */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Edit AI Twin Profile</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 模态框内容 */}
            <div className="p-6 space-y-6">
              {/* AI Twin Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700">
                  AI Twin Name
                </Label>
                <Input
                  id="edit-name"
                  value={editedProfile.name || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                  className="w-full"
                  placeholder="Enter AI Twin name"
                />
              </div>

              <Separator />

              {/* Profile Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-gender" className="text-sm font-medium text-gray-700">Gender</Label>
                    <Input
                      id="edit-gender"
                      value={editedProfile.profile?.gender || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        profile: { ...editedProfile.profile, gender: e.target.value }
                      })}
                      placeholder="e.g., Male, Female"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-age" className="text-sm font-medium text-gray-700">Age</Label>
                    <Input
                      id="edit-age"
                      value={editedProfile.profile?.age || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        profile: { ...editedProfile.profile, age: e.target.value }
                      })}
                      placeholder="e.g., 25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-occupation" className="text-sm font-medium text-gray-700">Occupation</Label>
                    <Input
                      id="edit-occupation"
                      value={editedProfile.profile?.occupation || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        profile: { ...editedProfile.profile, occupation: e.target.value }
                      })}
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-location" className="text-sm font-medium text-gray-700">Location</Label>
                    <Input
                      id="edit-location"
                      value={editedProfile.profile?.location || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        profile: { ...editedProfile.profile, location: e.target.value }
                      })}
                      placeholder="e.g., San Francisco"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Current Goals */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-blue-600" />
                    Current Goals
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNewItem('goals')}
                    className="h-8"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Goal
                  </Button>
                </div>
                <div className="space-y-2">
                  {editedProfile.goals?.map((goal, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Textarea
                        value={goal}
                        onChange={(e) => updateItem('goals', index, e.target.value)}
                        className="flex-1 min-h-[80px]"
                        placeholder="Describe a current goal..."
                      />
                      {(editedProfile.goals?.length || 0) > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem('goals', index)}
                          className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* What I Can Offer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="text-lg mr-2">💝</span>
                    What I Can Offer
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNewItem('offers')}
                    className="h-8"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Offer
                  </Button>
                </div>
                <div className="space-y-2">
                  {editedProfile.offers?.map((offer, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Textarea
                        value={offer}
                        onChange={(e) => updateItem('offers', index, e.target.value)}
                        className="flex-1 min-h-[80px]"
                        placeholder="What value can you offer..."
                      />
                      {(editedProfile.offers?.length || 0) > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem('offers', index)}
                          className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* What I'm Looking For */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="text-lg mr-2">🎯</span>
                    What I'm Looking For
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNewItem('lookings')}
                    className="h-8"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Looking
                  </Button>
                </div>
                <div className="space-y-2">
                  {editedProfile.lookings?.map((looking, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Textarea
                        value={looking}
                        onChange={(e) => updateItem('lookings', index, e.target.value)}
                        className="flex-1 min-h-[80px]"
                        placeholder="What are you seeking..."
                      />
                      {(editedProfile.lookings?.length || 0) > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem('lookings', index)}
                          className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 模态框底部 */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-xl border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;