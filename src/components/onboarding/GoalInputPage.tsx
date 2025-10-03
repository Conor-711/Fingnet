import { useState, useEffect, useRef } from 'react';
import { generateFollowUpQuestion, integrateConversationToGoal, integrateConversationToValueOffered, integrateConversationToValueDesired, type ConversationContext } from '@/services/aiService';
import { type AITwinProfile } from '@/contexts/OnboardingContext';

// Goal Input AI问题序列
const goalQuestions = [
  "What is your goal recently?",
  "Sounds fun! Can you tell me more? Like what stage your account is at now, and how long you've been running it?",
  "I see. So can you tell me what areas your account focuses on, or do you post about a bit of everything?",
  "Got it. So what do you think is your strongest or most valuable part when it comes to running your account?",
  "That's great! Have you run into any problems lately while working toward your goals—like lacking motivation or certain skills? And what kind of person would you like to find to help you with that?",
  "Alright! Here are a few thoughts about running Twitter— which one do you feel resonates with you the most?",
  "And what can you provide to the other person?",
  "What do you want from the other person?"
];

interface Message {
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface BasicInfo {
  avatar: string;
  nickname: string;
  ageRange: string;
  gender: string;
  occupation: string;
  industry: string;
  location: string;
}

interface GoalInputPageProps {
  aiTwinProfile: AITwinProfile | null;
  customAITwinName: string;
  customAITwinAvatar: string;
  overallProgress: number;
  basicInfo: BasicInfo;
  onComplete: (
    conversationContext: ConversationContext,
    aiIntegratedContent: {
      goalRecently: string;
      valueOffered: string;
      valueDesired: string;
    }
  ) => void;
  onViewOtherGoals: () => void;
}

export default function GoalInputPage({
  aiTwinProfile,
  customAITwinName,
  customAITwinAvatar,
  overallProgress,
  basicInfo,
  onComplete,
  onViewOtherGoals
}: GoalInputPageProps) {
  // 聊天相关状态
  const [goalChatMessages, setGoalChatMessages] = useState<Message[]>([]);
  const [goalUserInput, setGoalUserInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [canUserTypeGoal, setCanUserTypeGoal] = useState(false);
  const [showOtherGoalButton, setShowOtherGoalButton] = useState(false);
  const [currentGoalQuestionIndex, setCurrentGoalQuestionIndex] = useState(0);
  const [goalAnswers, setGoalAnswers] = useState<string[]>([]);
  
  // 对话上下文 - 包含 basic info
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    userGoal: '',
    conversationHistory: [],
    questionCount: 0,
    currentPhase: 'goal',
    phaseQuestionCount: 0,
    extractedInfo: {},
    userContext: {
      nickname: basicInfo.nickname,
      age: basicInfo.ageRange,
      gender: basicInfo.gender,
      occupation: basicInfo.occupation,
      industry: basicInfo.industry,
      location: basicInfo.location
    }
  });
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  
  // AI处理状态
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  
  // 用于避免重复初始化
  const hasInitialized = useRef(false);

  // 初始化：显示第一个问题
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      const firstQuestion = goalQuestions[0];
      const aiMessage: Message = {
        type: 'ai',
        content: firstQuestion,
        timestamp: new Date()
      };
      
      setGoalChatMessages([aiMessage]);
      setCanUserTypeGoal(true); // 直接启用输入
    }
  }, []);

  // 30秒后显示Other Goal按钮
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOtherGoalButton(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  // 生成下一个问题 - 接收最新的 context 作为参数
  const generateNextQuestion = async (latestContext: ConversationContext) => {
    setIsGeneratingQuestion(true);
    setIsAITyping(true);
    setCanUserTypeGoal(false);

    try {
      // 检查是否应该结束对话
      // 简单策略：问了8个问题后结束（goal 阶段 5个 + value offered 2个 + value desired 1个）
      const totalQuestions = latestContext.questionCount;
      
      console.log('🔍 当前状态:', {
        totalQuestions,
        currentPhase: latestContext.currentPhase,
        phaseQuestionCount: latestContext.phaseQuestionCount
      });
      
      if (totalQuestions >= 8) {
        // 对话结束，开始AI整合
        await handleAIIntegration();
        return;
      }

      // 根据问题数量切换阶段
      let updatedContext = { ...latestContext };
      if (totalQuestions >= 5 && latestContext.currentPhase === 'goal') {
        console.log('🔄 切换到 value_offered 阶段');
        updatedContext.currentPhase = 'value_offered';
        updatedContext.phaseQuestionCount = 0;
      } else if (totalQuestions >= 7 && latestContext.currentPhase === 'value_offered') {
        console.log('🔄 切换到 value_desired 阶段');
        updatedContext.currentPhase = 'value_desired';
        updatedContext.phaseQuestionCount = 0;
      }

      console.log('📝 生成问题，使用阶段:', updatedContext.currentPhase);

      // 生成下一个问题
      const nextQuestion = await generateFollowUpQuestion(updatedContext);
      
      if (nextQuestion) {
        const aiMessage: Message = {
          type: 'ai',
          content: nextQuestion,
          timestamp: new Date()
        };
        
        setGoalChatMessages(prev => [...prev, aiMessage]);
        setCurrentGoalQuestionIndex(prev => prev + 1); // ✅ 更新问题索引
        setIsAITyping(false);
        setCanUserTypeGoal(true); // 直接启用输入
        setConversationContext(updatedContext);
      } else {
        // 如果没有生成问题，重新启用输入
        setIsAITyping(false);
        setCanUserTypeGoal(true);
      }
    } catch (error) {
      console.error('❌ 生成问题失败:', error);
      
      // 回退到固定问题序列
      if (currentGoalQuestionIndex + 1 < goalQuestions.length) {
        const nextQuestion = goalQuestions[currentGoalQuestionIndex + 1];
        const aiMessage: Message = {
          type: 'ai',
          content: nextQuestion,
          timestamp: new Date()
        };
        
        setGoalChatMessages(prev => [...prev, aiMessage]);
        setCurrentGoalQuestionIndex(prev => prev + 1);
        setIsAITyping(false);
        setCanUserTypeGoal(true); // 直接启用输入
      } else {
        // 所有问题都问完了，开始AI整合
        setIsAITyping(false);
        await handleAIIntegration();
      }
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // AI整合处理
  const handleAIIntegration = async () => {
    setIsAIProcessing(true);
    setCanUserTypeGoal(false);
    
    try {
      console.log('🤖 开始AI整合...');
      
      // 整合Goal
      const goalResult = await integrateConversationToGoal(conversationContext);
      console.log('✅ Goal整合完成:', goalResult);
      
      // 整合Value Offered
      const valueOfferedResult = await integrateConversationToValueOffered(conversationContext);
      console.log('✅ Value Offered整合完成:', valueOfferedResult);
      
      // 整合Value Desired
      const valueDesiredResult = await integrateConversationToValueDesired(conversationContext);
      console.log('✅ Value Desired整合完成:', valueDesiredResult);
      
      const integratedContent = {
        goalRecently: goalResult,
        valueOffered: valueOfferedResult,
        valueDesired: valueDesiredResult
      };
      
      // 调用完成回调
      onComplete(conversationContext, integratedContent);
      
    } catch (error) {
      console.error('❌ AI整合失败:', error);
      
      // 使用简单的整合作为后备
      const simpleIntegration = {
        goalRecently: goalAnswers.slice(0, 3).join(' '),
        valueOffered: goalAnswers.slice(3, 5).join(' '),
        valueDesired: goalAnswers.slice(5).join(' ')
      };
      
      onComplete(conversationContext, simpleIntegration);
    } finally {
      setIsAIProcessing(false);
    }
  };

  // 发送消息处理
  const handleGoalSendMessage = async () => {
    if (!goalUserInput.trim() || !canUserTypeGoal) return;

    const userMessage: Message = {
      type: 'user',
      content: goalUserInput.trim(),
      timestamp: new Date()
    };
    
    setGoalChatMessages(prev => [...prev, userMessage]);
    setGoalAnswers(prev => [...prev, goalUserInput.trim()]);
    
    // 更新对话上下文 - 使用正确的 speaker/message 格式
    const updatedContext: ConversationContext = {
      ...conversationContext,
      // 如果这是第一个回答，设置为 userGoal
      userGoal: conversationContext.questionCount === 0 ? goalUserInput.trim() : conversationContext.userGoal,
      conversationHistory: [
        ...conversationContext.conversationHistory,
        { speaker: 'user', message: goalUserInput.trim() }
      ],
      questionCount: conversationContext.questionCount + 1,
      phaseQuestionCount: conversationContext.phaseQuestionCount + 1
    };
    setConversationContext(updatedContext);
    
    setGoalUserInput('');
    setCanUserTypeGoal(false);
    
    console.log('✅ 用户回答后，更新后的 context:', {
      questionCount: updatedContext.questionCount,
      currentPhase: updatedContext.currentPhase,
      phaseQuestionCount: updatedContext.phaseQuestionCount
    });
    
    // 生成下一个问题 - 传递最新的 context
    await generateNextQuestion(updatedContext);
  };

  // 键盘事件处理 - Enter 自动发送
  const handleGoalKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && goalUserInput.trim() && canUserTypeGoal && !isAIProcessing) {
      e.preventDefault();
      handleGoalSendMessage();
    }
  };

  // 获取当前显示的问题（只显示最后一条 AI 消息）
  const currentAIMessage = goalChatMessages.filter(msg => msg.type === 'ai').slice(-1)[0];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50 flex flex-col relative overflow-hidden">
      {/* 背景装饰元素 - 暖色调 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-pink-200/30 rounded-full blur-3xl"></div>
      </div>

    

      {/* 主要内容区域 - 左侧头像 + 聊天气泡 */}
      <div className="flex-1 flex items-center justify-center px-8 py-20 relative z-10">
        <div className="w-full max-w-4xl">
          {/* 当前问题展示区域 */}
          {currentAIMessage && !isAITyping && (
            <div className="flex items-start space-x-4 animate-fade-in">
              {/* AI Twin 头像 */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg overflow-hidden">
                  <img
                    src={aiTwinProfile?.avatar || customAITwinAvatar}
                    alt={aiTwinProfile?.name || customAITwinName || "AI Twin"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                {/* AI Twin 昵称 */}
                <p className="text-sm text-center text-gray-600 mt-2 font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {aiTwinProfile?.name || customAITwinName || 'AI Twin'}
                </p>
              </div>

              {/* 聊天气泡 */}
              <div className="flex-1 max-w-3xl">
                <div className="bg-white/40 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-lg">
                  <p className="text-2xl md:text-3xl leading-relaxed text-gray-800 font-normal" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {currentAIMessage.content}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Typing 指示器 */}
          {isAITyping && (
            <div className="flex items-start space-x-4 animate-fade-in">
              {/* AI Twin 头像 */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg overflow-hidden">
                  <img
                    src={aiTwinProfile?.avatar || customAITwinAvatar}
                    alt={aiTwinProfile?.name || customAITwinName || "AI Twin"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <p className="text-sm text-center text-gray-600 mt-2 font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {aiTwinProfile?.name || customAITwinName || 'AI Twin'}
                </p>
              </div>

              {/* Typing 气泡 */}
              <div className="flex-1 max-w-3xl">
                <div className="bg-white/40 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部输入区域 - "Tap to reply" 样式 */}
      <div className="absolute bottom-0 left-0 right-0 pb-12 px-8 relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          {canUserTypeGoal && !isAIProcessing ? (
            <div 
              className="bg-white/70 backdrop-blur-md rounded-3xl px-8 py-5 shadow-xl cursor-text hover:bg-white/80 transition-all duration-300"
              onClick={() => document.getElementById('goal-input')?.focus()}
            >
              <input
                id="goal-input"
                type="text"
                value={goalUserInput}
                onChange={(e) => setGoalUserInput(e.target.value)}
                onKeyDown={handleGoalKeyPress}
                placeholder="Tap to reply"
                className="w-full bg-transparent border-0 text-lg text-center text-gray-800 placeholder-gray-400 focus:outline-none" style={{ fontFamily: 'Outfit, sans-serif' }}
                disabled={!canUserTypeGoal || isAIProcessing}
                autoFocus
              />
            </div>
          ) : (
            <div className="bg-white/50 backdrop-blur-md rounded-3xl px-8 py-5 shadow-lg">
              <p className="text-lg text-center text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {isAIProcessing ? 'Processing...' : 'Please wait...'}
              </p>
            </div>
          )}

          {/* 液态玻璃风格进度条 */}
          <div className="bg-white/30 backdrop-blur-lg rounded-full p-1.5 shadow-lg border border-white/40">
            <div className="relative h-2 bg-gradient-to-r from-white/20 to-white/10 rounded-full overflow-hidden">
              {/* 进度条背景光泽效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              
              {/* 实际进度 */}
              <div 
                className="h-full bg-gradient-to-r from-orange-400/80 via-pink-400/80 to-rose-400/80 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${(currentGoalQuestionIndex + 1) / goalQuestions.length * 100}%` }}
              >
                {/* 进度条内部光泽动画 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-slide"></div>
              </div>
            </div>
            
            {/* 进度文本 */}
            <div className="flex items-center justify-between mt-2 px-2">
              <p className="text-xs text-gray-500 font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Question {currentGoalQuestionIndex + 1} of {goalQuestions.length}
              </p>
              <p className="text-xs text-gray-400 font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {Math.round((currentGoalQuestionIndex + 1) / goalQuestions.length * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>
        
      {/* 30秒后显示的Other Goal按钮 */}
      {showOtherGoalButton && !isAIProcessing && (
        <div className="fixed bottom-24 right-8 animate-fade-in z-20">
          <button
            onClick={onViewOtherGoals}
            className="group bg-white/70 backdrop-blur-md hover:bg-white/90 text-gray-700 px-5 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-medium transform hover:scale-105"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg group-hover:scale-110 transition-transform">🔍</span>
              <span className="text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>See other goals</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

