import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageCircle, Heart, Star, Loader2 } from 'lucide-react';
import { getAllAITwins, sendInvitation } from '@/lib/supabase';
import { toast } from 'sonner';

// Mock AI Twin数据 - 实际应用中会从API获取
const mockAITwins: Record<string, any> = {
  'alex': {
    id: 'alex',
    name: "Alex Thompson",
    avatar: "/avatars/2.png",
    profile: {
      gender: "Male",
      age: "28",
      occupation: "AI Content Creator",
      location: "San Francisco, CA"
    },
    goalRecently: "I'm focused on building a thriving community around AI education. My goal is to create content that makes complex AI concepts accessible to everyone, while growing my audience to 50k engaged followers who actively participate in discussions and share their own learning journeys.",
    valueOffered: "I can provide deep technical insights into machine learning and AI development, along with proven strategies for content creation and community building. My experience includes 5 years in AI research and 2 years building educational content that has helped thousands of people understand AI concepts.",
    valueDesired: "I'm looking for connections with other educators and content creators who can share advanced storytelling techniques and audience engagement strategies. I especially want to learn from people who have successfully scaled educational communities and those with expertise in cross-platform content distribution.",
    interests: ["AI Education", "Content Strategy", "Community Building", "Machine Learning"],
    connectionStatus: "Available",
    rating: 4.8,
    connectionsCount: 124
  },
  'sarah': {
    id: 'sarah',
    name: "Sarah Chen",
    avatar: "/avatars/3.png",
    profile: {
      gender: "Female",
      age: "32",
      occupation: "Product Manager",
      location: "New York, NY"
    },
    goalRecently: "Currently working on launching my own SaaS product focused on productivity tools for remote teams. My goal is to validate the product-market fit within the next 6 months and secure initial funding while maintaining my current role.",
    valueOffered: "I bring 6 years of product management experience and deep insights into user research, product strategy, and go-to-market planning. I can help others with product validation, feature prioritization, and building effective feedback loops with users.",
    valueDesired: "I'm seeking guidance from successful SaaS founders and technical advisors who can help with technical architecture decisions, fundraising strategies, and scaling challenges. I'd also love to connect with other product managers who are building their own products.",
    interests: ["SaaS Development", "Product Strategy", "Remote Work", "Fundraising"],
    connectionStatus: "Available",
    rating: 4.9,
    connectionsCount: 89
  },
  'marcus': {
    id: 'marcus',
    name: "Marcus Williams",
    avatar: "/avatars/4.png",
    profile: {
      gender: "Male",
      age: "26",
      occupation: "Full-Stack Developer",
      location: "Austin, TX"
    },
    goalRecently: "Transitioning from design to full-stack development to create meaningful projects that address social issues. My immediate goal is to complete 3 full-stack projects in the next 4 months and land a developer role at a social impact company.",
    valueOffered: "I combine strong design thinking with growing technical skills, offering a unique perspective on user experience and frontend development. I can help others with UI/UX design, prototyping, and creating user-centered applications.",
    valueDesired: "I need mentorship on backend development, system architecture, and technical interview preparation. I'm particularly interested in connecting with developers who work on social impact projects and can share insights about the intersection of technology and social good.",
    interests: ["Social Impact", "Full-Stack Development", "UI/UX Design", "System Architecture"],
    connectionStatus: "Available",
    rating: 4.7,
    connectionsCount: 67
  }
};

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { aiTwinProfile } = useOnboarding();
  
  // Invite悬浮窗状态
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [isInviteSent, setIsInviteSent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isConnectionCreated, setIsConnectionCreated] = useState(false);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  
  // AI Twin数据加载状态
  const [aiTwin, setAITwin] = useState<any>(null);
  const [isLoadingTwin, setIsLoadingTwin] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // 定时器ref
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 用于防止重复加载的 ref
  const hasLoadedRef = useRef<string | null>(null);
  const userId = user?.id;
  
  // 从数据库加载AI Twin数据
  useEffect(() => {
    const loadAITwinData = async () => {
      console.log('🔍 Profile.tsx - loadAITwinData called with id:', id);
      
      if (!id) {
        console.log('❌ No id provided');
        setIsLoadingTwin(false);
        return;
      }
      
      // 防止重复加载同一个 ID
      if (hasLoadedRef.current === id) {
        console.log('ℹ️ Already loaded this id, skipping');
        return;
      }
      
      setIsLoadingTwin(true);
      setLoadError(null);
      
      try {
        // 首先尝试从mock数据加载（向后兼容）
        console.log('🔍 Checking mock data for id:', id);
        if (mockAITwins[id]) {
          console.log('✅ Found in mock data:', mockAITwins[id]);
          setAITwin(mockAITwins[id]);
          hasLoadedRef.current = id; // 标记已加载
          setIsLoadingTwin(false);
          return;
        }
        
        // 如果没有user，使用mock数据
        if (!user) {
          console.log('❌ No user found');
          setLoadError('Please login to view profiles');
          setIsLoadingTwin(false);
          return;
        }
        
        // 从数据库加载所有AI Twins
        console.log('🔍 Loading AI Twins from database for user:', user.id);
        const { data: allTwins, error } = await getAllAITwins(user.id);
        
        if (error) {
          console.error('❌ Error loading AI Twins:', error);
          setLoadError('Failed to load AI Twin data');
          setIsLoadingTwin(false);
          return;
        }
        
        console.log('📊 All twins loaded:', allTwins);
        
        // 查找匹配的AI Twin（通过名字匹配）
        const targetTwin = allTwins?.find(twin => {
          const twinId = twin.name.toLowerCase().replace(/\s+/g, '');
          console.log(`🔍 Comparing: "${twinId}" === "${id}"`);
          return twinId === id;
        });
        
        console.log('🎯 Target twin found:', targetTwin);
        
        if (targetTwin) {
          // 转换数据库格式到UI格式
          const formattedTwin = {
            id: id,
            name: targetTwin.name,
            avatar: targetTwin.avatar || '/avatars/ai_friend.png',
            profile: targetTwin.profile || { gender: '', age: '', occupation: '', location: '' },
            goalRecently: targetTwin.goalRecently || targetTwin.goals?.[0] || '',
            valueOffered: targetTwin.valueOffered || targetTwin.offers?.[0] || '',
            valueDesired: targetTwin.valueDesired || targetTwin.lookings?.[0] || '',
            interests: Array.isArray(targetTwin.goals) ? targetTwin.goals : [],
            connectionStatus: 'Available',
            rating: 4.5,
            connectionsCount: 0
          };
          console.log('✅ Setting AI Twin:', formattedTwin);
          setAITwin(formattedTwin);
          hasLoadedRef.current = id; // 标记已加载
        } else {
          console.log('❌ AI Twin not found for id:', id);
          setLoadError('AI Twin not found');
          hasLoadedRef.current = id; // 即使失败也标记，避免重复尝试
        }
      } catch (error) {
        console.error('Error in loadAITwinData:', error);
        setLoadError('An error occurred while loading data');
      } finally {
        setIsLoadingTwin(false);
      }
    };
    
    loadAITwinData();
  }, [id, userId]); // 使用解构后的 userId 而不是 user?.id
  
  // 清理定时器的useEffect - 必须在所有条件渲染之前
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);
  
  // 加载状态
  if (isLoadingTwin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-bold mb-2">Loading Profile...</h2>
            <p className="text-gray-600">
              Please wait while we fetch the AI Twin data
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 错误状态或未找到
  if (!aiTwin || loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {loadError || 'Profile Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              The AI Twin profile you're looking for doesn't exist or couldn't be loaded.
            </p>
            <Button onClick={() => navigate('/main')} className="w-full">
              Back to Main
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStartConversation = () => {
    // 重置状态
    setIsInviteSent(false);
    setIsClosing(false);
    setShowInvitePopup(true);
    
    // 清理之前的定时器
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  };

  // 处理邀请发送
  const handleSendInvitation = async () => {
    if (!user || !aiTwinProfile || !aiTwin) {
      toast.error('Unable to send invitation. Please try again.');
      return;
    }

    try {
      // 从数据库获取目标用户的真实 user_id
      const { data: targetTwinData, error: fetchError } = await getAllAITwins(user.id);
      
      if (fetchError || !targetTwinData) {
        toast.error('Failed to fetch target user information');
        return;
      }

      // 根据 aiTwin.name 找到对应的用户
      const targetTwin = targetTwinData.find(twin => 
        twin.name.toLowerCase().replace(/\s+/g, '') === aiTwin.id
      );

      if (!targetTwin || !targetTwin.user_id) {
        toast.error('Target user not found');
        return;
      }

      // 发送邀请到数据库
      const { error } = await sendInvitation(
        user.id,
        targetTwin.user_id,
        `${aiTwinProfile.name} wants to connect with ${aiTwin.name}!`
      );

      if (error) {
        console.error('Error sending invitation:', error);
        toast.error('Failed to send invitation');
        return;
      }

      // 显示成功状态
      setIsInviteSent(true);
      toast.success(`Invitation sent to ${aiTwin.name}!`);
      
      // 2.5秒后开始淡出动画
      dismissTimerRef.current = setTimeout(() => {
        setIsClosing(true);
        
        // 0.5秒后完全关闭悬浮窗
        closeTimerRef.current = setTimeout(() => {
          setShowInvitePopup(false);
          setIsInviteSent(false);
          setIsClosing(false);
        }, 500);
      }, 2500);
    } catch (error) {
      console.error('Error in handleSendInvitation:', error);
      toast.error('An error occurred while sending invitation');
    }
  };

  // 手动关闭悬浮窗
  const handleCloseInvitePopup = () => {
    // 清理定时器
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    
    // 重置状态
    setShowInvitePopup(false);
    setIsInviteSent(false);
    setIsClosing(false);
    setIsConnectionCreated(false);
    setCreatedGroupId(null);
  };

  // 处理Test按钮 - 发送邀请
  const handleTestConnection = async () => {
    await handleSendInvitation();
  };

  // 处理Join Group按钮
  const handleJoinGroup = () => {
    if (createdGroupId) {
      // 关闭悬浮窗
      handleCloseInvitePopup();
      
      // 跳转到group chat，将groupId作为参数传递
      navigate(`/main?tab=group-chat&groupId=${createdGroupId}`);
    }
  };

  const handleAddToFavorites = () => {
    // 添加到收藏夹功能
    alert(`Added ${aiTwin.name} to favorites!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/main')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Main
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{aiTwin.rating}</span>
              <span>•</span>
              <span>{aiTwin.connectionsCount} connections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                {/* Avatar */}
                <div className="text-center mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-200 overflow-hidden shadow-lg">
                    <img
                      src={aiTwin.avatar}
                      alt={`${aiTwin.name}'s AI Twin`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div
                      className="w-full h-full bg-blue-400 flex items-center justify-center text-4xl"
                      style={{ display: 'none' }}
                    >
                      🤖
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                    {aiTwin.name}'s AI Twin
                  </h1>
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {aiTwin.connectionStatus}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">👤</span>
                      Profile
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium">{aiTwin.profile.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">{aiTwin.profile.age}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Occupation:</span>
                        <span className="font-medium">{aiTwin.profile.occupation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{aiTwin.profile.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {aiTwin.interests && aiTwin.interests.length > 0 ? (
                        aiTwin.interests.map((interest: string, index: number) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No interests listed</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleStartConversation}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                size="lg"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
              <Button
                onClick={handleAddToFavorites}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Heart className="w-4 h-4 mr-2" />
                Add to Favorites
              </Button>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Goal Recently */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <span className="text-2xl mr-3">🎯</span>
                  Current Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {aiTwin.goalRecently}
                </p>
              </CardContent>
            </Card>

            {/* Value Offered */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <span className="text-2xl mr-3">💝</span>
                  What I Can Offer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {aiTwin.valueOffered}
                </p>
              </CardContent>
            </Card>

            {/* Value Desired */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <span className="text-2xl mr-3">🌟</span>
                  What I'm Looking For
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {aiTwin.valueDesired}
                </p>
              </CardContent>
            </Card>

            {/* Connection Stats */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <span className="text-2xl mr-3">📊</span>
                  Connection Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {aiTwin.connectionsCount}
                    </div>
                    <div className="text-sm text-gray-600">Total Connections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {aiTwin.rating}
                    </div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Invite悬浮窗 */}
      {showInvitePopup && (
        <InvitePopup
          currentUser={aiTwinProfile}
          targetUser={aiTwin}
          isInviteSent={isInviteSent}
          isClosing={isClosing}
          isConnectionCreated={isConnectionCreated}
          onClose={handleCloseInvitePopup}
          onSendInvitation={handleSendInvitation}
          onTestConnection={handleTestConnection}
          onJoinGroup={handleJoinGroup}
        />
      )}
    </div>
  );
}

// InvitePopup组件
interface InvitePopupProps {
  currentUser: any;
  targetUser: any;
  isInviteSent: boolean;
  isClosing: boolean;
  isConnectionCreated: boolean;
  onClose: () => void;
  onSendInvitation: () => void;
  onTestConnection: () => void;
  onJoinGroup: () => void;
}

const InvitePopup: React.FC<InvitePopupProps> = ({ 
  currentUser, 
  targetUser, 
  isInviteSent, 
  isClosing,
  isConnectionCreated,
  onClose, 
  onSendInvitation,
  onTestConnection,
  onJoinGroup
}) => {
  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-all duration-500 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`} 
      onClick={!isInviteSent ? onClose : undefined}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 p-8 relative transition-all duration-500 ${
          isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 - 只在未发送邀请时显示 */}
        {!isInviteSent && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* 标题 */}
        <div className="text-center mb-8">
          {!isConnectionCreated ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite to Group Chat</h2>
              <p className="text-gray-600">Connecting AI Twins for collaborative conversation</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-green-600 mb-2 animate-bounce">Connection Created! 🎊</h2>
              <p className="text-gray-600">Your AI Twin and {targetUser?.name}'s AI Twin are now connected!</p>
            </>
          )}
        </div>

        {/* 主要内容区域 */}
        <div className="flex items-center justify-between">
          {/* 左半部分 - 当前用户 */}
          <div className="flex flex-col items-center space-y-4 w-1/3">
            <div className="text-lg font-semibold text-gray-900 mb-2">You</div>
            
            {/* 用户头像 - 点亮状态 */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 p-1 shadow-lg">
                <img 
                  src="/avatars/middle.png" 
                  alt="Your Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="text-sm text-center">
              <div className="font-medium">You</div>
              <div className="text-gray-500">
                {isConnectionCreated ? "Connected!" : "Initiating invite"}
              </div>
            </div>

            {/* AI Twin头像 - 点亮状态 */}
            <div className="relative mt-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 p-1 shadow-md">
                <img 
                  src="/avatars/middle.png" 
                  alt="Your AI Twin"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
            </div>
            
            <div className="text-sm text-center">
              <div className="font-medium">Your AI Twin</div>
              <div className="text-gray-500">
                {isConnectionCreated ? "Connected!" : "Ready to connect"}
              </div>
            </div>
          </div>

          {/* 中间动画区域 */}
          <div className="flex items-center justify-center w-1/3 relative h-32">
            <ConnectionAnimation isInviteSent={isConnectionCreated} />
          </div>

          {/* 右半部分 - 目标用户 */}
          <div className="flex flex-col items-center space-y-4 w-1/3">
            <div className="text-lg font-semibold text-gray-900 mb-2">{targetUser?.name}</div>
            
            {/* 目标用户头像 - 灰暗状态 */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-300 p-1 shadow-lg opacity-60">
                <img 
                  src={targetUser?.avatar} 
                  alt={`${targetUser?.name}'s Avatar`}
                  className="w-full h-full rounded-full object-cover grayscale"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full opacity-50"></div>
              </div>
            </div>
            
            <div className="text-sm text-center">
              <div className="font-medium text-gray-600">{targetUser?.name}</div>
              <div className="text-gray-400">
                {isConnectionCreated ? "Connection accepted!" : "Waiting for response"}
              </div>
            </div>

            {/* 目标AI Twin头像 - 灰暗状态 */}
            <div className="relative mt-6">
              <div className="w-16 h-16 rounded-full bg-gray-300 p-1 shadow-md opacity-60">
                <img 
                  src={targetUser?.avatar} 
                  alt={`${targetUser?.name}'s AI Twin`}
                  className="w-full h-full rounded-full object-cover grayscale"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-white text-xs font-bold opacity-70">AI</span>
              </div>
            </div>
            
            <div className="text-sm text-center">
              <div className="font-medium text-gray-600">{targetUser?.name}'s AI Twin</div>
              <div className="text-gray-400">
                {isConnectionCreated ? "Connected!" : "Pending connection"}
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-center space-x-4 mt-8">
          {!isConnectionCreated ? (
            <>
              <Button variant="outline" onClick={onClose} size="lg">
                Cancel
              </Button>
              <Button 
                onClick={onTestConnection}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                Test Connection
              </Button>
            </>
          ) : (
            <Button 
              onClick={onJoinGroup}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 animate-pulse"
              size="lg"
            >
              Join Group Chat 🎉
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ConnectionAnimation组件 - 金光连线动画
interface ConnectionAnimationProps {
  isInviteSent?: boolean;
}

const ConnectionAnimation: React.FC<ConnectionAnimationProps> = ({ isInviteSent = false }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* SVG动画容器 */}
      <svg width="200" height="80" viewBox="0 0 200 80" className="absolute">
        {/* 定义渐变色 */}
        <defs>
          <linearGradient id="goldenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
          </linearGradient>
          
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0">
              <animate attributeName="stop-opacity" 
                values="0;1;0" 
                dur="2s" 
                repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0">
              <animate attributeName="stop-opacity" 
                values="0;1;0" 
                dur="2s" 
                repeatCount="indefinite"
                begin="0.3s" />
            </stop>
            <stop offset="100%" stopColor="#d97706" stopOpacity="0">
              <animate attributeName="stop-opacity" 
                values="0;1;0" 
                dur="2s" 
                repeatCount="indefinite"
                begin="0.6s" />
            </stop>
          </linearGradient>
        </defs>
        
        {/* 左侧点 */}
        <circle cx="30" cy="40" r="6" fill="#fbbf24" className="drop-shadow-lg">
          <animate attributeName="r" 
            values="6;8;6" 
            dur="2s" 
            repeatCount="indefinite" />
          <animate attributeName="opacity" 
            values="0.8;1;0.8" 
            dur="2s" 
            repeatCount="indefinite" />
        </circle>
        
        {/* 中间点 */}
        <circle cx="100" cy="40" r="5" fill="#f59e0b" className="drop-shadow-md">
          <animate attributeName="r" 
            values="5;7;5" 
            dur="2s" 
            repeatCount="indefinite"
            begin="0.5s" />
        </circle>
        
        {/* 右侧点 */}
        <circle cx="170" cy="40" r="6" fill="#9ca3af" opacity="0.5" className="drop-shadow-sm">
          <animate attributeName="opacity" 
            values="0.5;0.7;0.5" 
            dur="3s" 
            repeatCount="indefinite" />
        </circle>
        
        {/* 主连线 - 从左到中 */}
        <line x1="36" y1="40" x2="94" y2="40" 
          stroke="url(#goldenGradient)" 
          strokeWidth="3" 
          strokeLinecap="round"
          className="drop-shadow-md">
          <animate attributeName="stroke-width" 
            values="3;5;3" 
            dur="2s" 
            repeatCount="indefinite" />
        </line>
        
        {/* 脉冲连线 - 动态效果 */}
        <line x1="36" y1="40" x2="94" y2="40" 
          stroke="url(#pulseGradient)" 
          strokeWidth="6" 
          strokeLinecap="round"
          opacity="0.7">
          <animate attributeName="stroke-dasharray" 
            values="0 60;30 30;60 0" 
            dur="2s" 
            repeatCount="indefinite" />
        </line>
        
        {/* 能量粒子效果 */}
        <circle r="2" fill="#fbbf24" opacity="0.8">
          <animateMotion dur="2s" repeatCount="indefinite">
            <mpath href="#connectionPath"/>
          </animateMotion>
          <animate attributeName="opacity" 
            values="0;1;0" 
            dur="2s" 
            repeatCount="indefinite" />
        </circle>
        
        <circle r="1.5" fill="#f59e0b" opacity="0.6">
          <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s">
            <mpath href="#connectionPath"/>
          </animateMotion>
          <animate attributeName="opacity" 
            values="0;1;0" 
            dur="2s" 
            repeatCount="indefinite"
            begin="0.5s" />
        </circle>
        
        {/* 连接路径 - 供粒子动画使用 */}
        <path id="connectionPath" 
          d="M 36 40 Q 65 35 94 40" 
          fill="none" 
          stroke="none" />
        
        {/* 辉光效果 */}
        <line x1="36" y1="40" x2="94" y2="40" 
          stroke="#fbbf24" 
          strokeWidth="8" 
          strokeLinecap="round"
          opacity="0.3"
          filter="blur(2px)">
          <animate attributeName="opacity" 
            values="0.1;0.4;0.1" 
            dur="2s" 
            repeatCount="indefinite" />
        </line>
      </svg>
      
      {/* 文字指示 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-medium">
        {isInviteSent ? (
          <span className="text-green-600">Connected! ✓</span>
        ) : (
          <span className="text-gray-500">Connecting...</span>
        )}
      </div>
      
      {/* 发光效果背景 */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 via-amber-50 to-yellow-100 opacity-30 rounded-lg blur-sm"></div>
    </div>
  );
};
