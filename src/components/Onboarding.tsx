import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OnboardingQuestion, OnboardingAnswer } from '@/types/post';
import {
  onboardingQuestions,
  getTotalQuestions,
  getQuestionById,
  getNextQuestion,
  getPreviousQuestion,
  getAIFriendComment
} from '@/data/onboardingData';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOnboarding, type AITwinProfile } from '@/contexts/OnboardingContext';
import { Input } from '@/components/ui/input';
import TypewriterText from '@/components/TypewriterText';
import { integrateGoalAnswers, integrateValueOffered, integrateValueDesired, withRetry, generateFollowUpQuestion, integrateConversationToGoal, integrateConversationToValueOffered, integrateConversationToValueDesired, type GoalIntegrationInput, type ConversationContext } from '@/services/aiService';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { saveOnboardingProgress, upsertAITwin } from '@/lib/supabase';
import { toast } from 'sonner';

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

// AI Twin头像选项
const avatarOptions = [
  { id: 'default', src: '/avatars/ai_friend.png', name: 'Default' },
  { id: 'avatar1', src: '/avatars/1.png', name: 'Avatar 1' },
  { id: 'avatar2', src: '/avatars/2.png', name: 'Avatar 2' },
  { id: 'avatar3', src: '/avatars/3.png', name: 'Avatar 3' },
  { id: 'avatar4', src: '/avatars/4.png', name: 'Avatar 4' },
];

interface OnboardingProps {
  onComplete?: (answers: Record<string, OnboardingAnswer>) => void;
  onSkip?: () => void;
}


export const Onboarding = ({ onComplete, onSkip }: OnboardingProps) => {
  const { user } = useAuth(); // 获取当前登录用户
  const [currentQuestionId, setCurrentQuestionId] = useState(onboardingQuestions[0]?.id || '');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [aiFriendComment, setAIFriendComment] = useState<string>('');
  const [showCommentBubble, setShowCommentBubble] = useState(false);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [userGoal, setUserGoal] = useState('');
  const [showOtherGoal, setShowOtherGoal] = useState(false);
  const [showAIIntro, setShowAIIntro] = useState(true); // AI伙伴自我介绍页面
  const [showBasicInfo, setShowBasicInfo] = useState(false); // Basic Info页面
  const [showLoadingPage, setShowLoadingPage] = useState(false); // Goal Input后的短暂加载页面
  const [isFirstGoalInput, setIsFirstGoalInput] = useState(true); // 是否是第一次进入Goal Input页面
  const [isSavingToDatabase, setIsSavingToDatabase] = useState(false); // 是否正在保存到数据库
  
  // Basic Info表单数据
  const [basicInfo, setBasicInfo] = useState({
    avatar: '',
    nickname: '',
    ageRange: '',
    gender: '',
    occupation: '',
    industry: '',
    location: ''
  });
  
  // Goal Input聊天相关状态
  const [goalChatMessages, setGoalChatMessages] = useState<Array<{type: 'ai' | 'user', content: string, timestamp: Date}>>([]);
  const [goalUserInput, setGoalUserInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [canUserTypeGoal, setCanUserTypeGoal] = useState(false);
  const [showOtherGoalButton, setShowOtherGoalButton] = useState(false); // 30秒后显示的Other Goal按钮
  const [currentGoalQuestionIndex, setCurrentGoalQuestionIndex] = useState(0); // 当前问题索引
  const [goalAnswers, setGoalAnswers] = useState<string[]>([]); // 存储用户的所有回答
  
  // Create Twin相关状态
  const [showTwinAnalysis, setShowTwinAnalysis] = useState(false); // 环形进度条分析页面
  const [twinAnalysisProgress, setTwinAnalysisProgress] = useState(0); // 分析进度
  const [showCreateTwin, setShowCreateTwin] = useState(false); // Create Twin页面
  
  // Create Twin可编辑字段状态
  // 删除硬编码的默认值，这些信息将从用户输入中获取
  // Choice Made页面的答案存储
  const [onboardingAnswers, setOnboardingAnswers] = useState<Record<string, string | string[]>>({});
  
  // AI对话系统相关状态
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    userGoal: '',
    conversationHistory: [],
    questionCount: 0,
    currentPhase: 'goal',
    phaseQuestionCount: 0,
    extractedInfo: {}
  });
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  
  // AI整合相关状态
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiProcessingStep, setAiProcessingStep] = useState('');
  const [aiIntegratedContent, setAiIntegratedContent] = useState({
    goalRecently: '',
    valueOffered: '',
    valueDesired: ''
  });
  const [showNetwork, setShowNetwork] = useState(false); // Network页面
  const [showConnect, setShowConnect] = useState(false); // Connect页面
  const [showChatDialog, setShowChatDialog] = useState(false); // Connect页面聊天对话框显示状态
  
  // AI Twin自定义状态
  const [customAITwinName, setCustomAITwinName] = useState('');
  const [customAITwinAvatar, setCustomAITwinAvatar] = useState('/avatars/ai_friend.png');
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  
  // 打字机效果状态
  const [currentTypingMessageIndex, setCurrentTypingMessageIndex] = useState(-1);
  const [isMessageTyping, setIsMessageTyping] = useState(false);
  const [showChatPopup, setShowChatPopup] = useState(false); // 聊天记录悬浮窗状态
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();


  const { progress: onboardingProgress, updateAnswer, completeOnboarding, skipOnboarding, updateAITwinProfile, updateAITwinBasicInfo, aiTwinProfile } = useOnboarding();


  // 检查是否为强制测试模式
  const forceTest = searchParams.get('force') === 'true';

  // Connect页面5秒后显示聊天对话框的逻辑
  useEffect(() => {
    if (showConnect) {
      setShowChatDialog(false); // 重置状态
      const timer = setTimeout(() => {
        setShowChatDialog(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showConnect]);

  // 如果是强制测试模式，重置onboarding状态
  useEffect(() => {
    if (forceTest) {
      localStorage.removeItem('onlymsg_onboarding');
      // setShouldShowOnboarding(true); // Removed - no auth context
    }
  }, [forceTest]);

  // 获取当前问题
  const currentQuestion = getQuestionById(currentQuestionId);
  const currentIndex = onboardingQuestions.findIndex(q => q.id === currentQuestionId);
  const questionProgress = ((currentIndex + 1) / onboardingQuestions.length) * 100;
  
  // 计算整体onboarding进度（3个主要阶段）
  const getOverallProgress = () => {
    if (showAIIntro) return 0;
    if (showBasicInfo) return 33;
    if (showGoalInput) return 66;
    if (currentQuestion) return 66 + (questionProgress * 0.34); // Choice Made页面占34%
    return 100;
  };
  
  const overallProgress = getOverallProgress();

  // 处理AI驱动的多阶段聊天输入
  const handleGoalChatInput = (message: string) => {
    if (!message.trim() || !canUserTypeGoal) return;

    // 添加用户消息
    const userMessage = {
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };

    setGoalChatMessages(prev => [...prev, userMessage]);
    setGoalUserInput('');
    setCanUserTypeGoal(false);

    // 更新对话上下文
    const updatedContext: ConversationContext = {
      ...conversationContext,
      userGoal: conversationContext.userGoal || message, // 第一次回答作为主要目标
      conversationHistory: [
        ...conversationContext.conversationHistory,
        { speaker: 'user', message }
      ]
    };
    setConversationContext(updatedContext);

    // 保存用户回答到goalAnswers以保持兼容性
    const newAnswers = [...goalAnswers, message];
    setGoalAnswers(newAnswers);
    
    // 如果是第一个问题的回答，保存为用户目标
    if (currentGoalQuestionIndex === 0) {
      setUserGoal(message);
    }

    // 判断是否需要继续提问或切换阶段
    setTimeout(() => {
      const currentPhase = conversationContext.currentPhase;
      const phaseQuestionCount = conversationContext.phaseQuestionCount;
      
      // 检查当前阶段是否完成
      if (currentPhase === 'goal' && phaseQuestionCount >= 3) {
        // Goal阶段完成，切换到Value Offered阶段
        setConversationContext(prev => ({
          ...prev,
          currentPhase: 'value_offered',
          phaseQuestionCount: 0
        }));
        setCurrentGoalQuestionIndex(prev => prev + 1);
        generateNextQuestion();
      } else if (currentPhase === 'value_offered' && phaseQuestionCount >= 2) {
        // Value Offered阶段完成，切换到Value Desired阶段
        setConversationContext(prev => ({
          ...prev,
          currentPhase: 'value_desired',
          phaseQuestionCount: 0
        }));
        setCurrentGoalQuestionIndex(prev => prev + 1);
        generateNextQuestion();
      } else if (currentPhase === 'value_desired' && phaseQuestionCount >= 2) {
        // 所有阶段完成，结束对话
        const finalResponse = {
          type: 'ai' as const,
          content: "Thank you for this wonderful conversation! I now have a comprehensive understanding of your goals, what you can offer, and what you're looking for. Let me create your personalized AI Twin based on everything we've discussed...",
          timestamp: new Date()
        };
        
        setGoalChatMessages(prev => [...prev, finalResponse]);
        
        // 信息已经通过AI对话提取并保存在conversationContext.extractedInfo中
        // 不需要额外处理
        
        // 3秒后进入Choice Made页面
        setTimeout(() => {
          setShowGoalInput(false);
          // 重置到第一个问题开始Choice Made流程
          setCurrentQuestionId(onboardingQuestions[0]?.id || '');
          setSelectedOptions([]);
        }, 3000);
      } else {
        // 当前阶段继续，生成下一个问题
        setCurrentGoalQuestionIndex(prev => prev + 1);
        generateNextQuestion();
      }
    }, 1000);
  };

  // 初始化AI驱动的Goal Input聊天
  // 用basicInfo初始化Goal Chat（新版，直接接收用户信息）
  const initializeGoalChatWithUserInfo = (userInfo: typeof basicInfo) => {
    // 重置聊天状态
    setGoalChatMessages([]);
    setGoalUserInput('');
    setIsAITyping(false);
    setCanUserTypeGoal(false);
    setShowOtherGoalButton(false);
    setCurrentGoalQuestionIndex(0);
    setGoalAnswers([]);
    setCurrentTypingMessageIndex(-1);
    setIsMessageTyping(false);

    // 使用传入的用户信息
    const userName = userInfo.nickname || 'there';
    const userOccupation = userInfo.occupation || '';
    const userIndustry = userInfo.industry || '';

    // 重置对话上下文，包含用户基本信息
    setConversationContext({
      userGoal: '',
      conversationHistory: [],
      questionCount: 0,
      currentPhase: 'goal',
      phaseQuestionCount: 0,
      extractedInfo: {},
      // 添加用户上下文信息
      userContext: {
        nickname: userName,
        occupation: userOccupation,
        industry: userIndustry,
        age: userInfo.ageRange || '',
        location: userInfo.location || '',
        gender: userInfo.gender || ''
      }
    });

    // AI发送个性化的第一个问题，使用打字机效果
    setTimeout(() => {
      const personalizedGreeting = `Hi ${userName}! ${userOccupation ? `As a ${userOccupation}${userIndustry ? ` in ${userIndustry}` : ''}, ` : ''}what's your main goal recently?`;
      addAIMessageWithTyping(personalizedGreeting);
    }, 1000);

    // 30秒后显示Other Goal按钮
    setTimeout(() => {
      setShowOtherGoalButton(true);
    }, 30000);
  };

  // 旧版initializeGoalChat，用于兼容性（使用aiTwinProfile）
  const initializeGoalChat = () => {
    // 重置聊天状态
    setGoalChatMessages([]);
    setGoalUserInput('');
    setIsAITyping(false);
    setCanUserTypeGoal(false);
    setShowOtherGoalButton(false);
    setCurrentGoalQuestionIndex(0);
    setGoalAnswers([]);
    setCurrentTypingMessageIndex(-1);
    setIsMessageTyping(false);

    // 获取用户信息用于个性化
    const userName = aiTwinProfile?.userNickname || 'there';
    const userOccupation = aiTwinProfile?.profile?.occupation || '';
    const userIndustry = aiTwinProfile?.userIndustry || '';

    // 重置对话上下文，包含用户基本信息
    setConversationContext({
      userGoal: '',
      conversationHistory: [],
      questionCount: 0,
      currentPhase: 'goal',
      phaseQuestionCount: 0,
      extractedInfo: {},
      // 添加用户上下文信息
      userContext: {
        nickname: userName,
        occupation: userOccupation,
        industry: userIndustry,
        age: aiTwinProfile?.profile?.age || '',
        location: aiTwinProfile?.profile?.location || '',
        gender: aiTwinProfile?.profile?.gender || ''
      }
    });

    // AI发送个性化的第一个问题，使用打字机效果
    setTimeout(() => {
      const personalizedGreeting = `Hi ${userName}! ${userOccupation ? `As a ${userOccupation}${userIndustry ? ` in ${userIndustry}` : ''}, ` : ''}what's your main goal recently?`;
      addAIMessageWithTyping(personalizedGreeting);
    }, 1000);

    // 30秒后显示Other Goal按钮
    setTimeout(() => {
      setShowOtherGoalButton(true);
    }, 30000);
  };

  // 开始Twin分析
  const startTwinAnalysis = () => {
    setTwinAnalysisProgress(0);

    const progressInterval = setInterval(() => {
      setTwinAnalysisProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          // 分析完成，进入Create Twin页面
          setTimeout(() => {
            setShowTwinAnalysis(false);
            setShowCreateTwin(true);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 200);
  };

  // 从Create Twin进入Network页面
  const handleEnterNetwork = () => {
    // 使用真实的用户输入数据
    const aiTwinData: AITwinProfile = {
      name: aiTwinProfile?.name || customAITwinName || 'AI Twin',
      avatar: aiTwinProfile?.avatar || customAITwinAvatar,
      profile: {
        gender: basicInfo.gender,
        age: basicInfo.ageRange,
        occupation: basicInfo.occupation,
        location: basicInfo.location
      },
      userNickname: basicInfo.nickname,
      userAvatar: basicInfo.avatar,
      userIndustry: basicInfo.industry,
      // 从对话上下文中提取的信息
      goalRecently: conversationContext.extractedInfo.goal || conversationContext.userGoal || '',
      valueOffered: conversationContext.extractedInfo.valueOffered || '',
      valueDesired: conversationContext.extractedInfo.valueDesired || '',
      // 将goals/offers/lookings也保存（如果有的话）
      goals: conversationContext.extractedInfo.goals || [],
      offers: conversationContext.extractedInfo.offers || [],
      lookings: conversationContext.extractedInfo.lookings || []
    };
    
    updateAITwinProfile(aiTwinData);
    
    setShowCreateTwin(false);
    setShowNetwork(true);
  };

  // 从Network进入Connect页面
  const handleEnterConnect = () => {
    setShowNetwork(false);
    setShowConnect(true);
  };

  // 完成onboarding流程并保存到数据库
  const handleCompleteOnboarding = async () => {
    if (!user) {
      toast.error('用户未登录，无法保存数据');
      return;
    }

    setIsSavingToDatabase(true);

    try {
      // 1. 保存onboarding进度
      const { error: progressError } = await saveOnboardingProgress(
        user.id,
        onboardingProgress.answers, // 使用context中的answers
        true // completed = true
      );

      if (progressError) {
        console.error('Failed to save onboarding progress:', progressError);
        toast.error('保存进度失败，请重试');
        setIsSavingToDatabase(false);
        return;
      }

      // 2. 保存AI Twin数据（使用真实用户输入）
      const aiTwinData = {
        name: aiTwinProfile?.name || customAITwinName || 'AI Twin',
        avatar: aiTwinProfile?.avatar || customAITwinAvatar,
        profile: {
          gender: basicInfo.gender,
          age: basicInfo.ageRange,
          occupation: basicInfo.occupation,
          location: basicInfo.location
        },
        userNickname: basicInfo.nickname,
        userAvatar: basicInfo.avatar,
        userIndustry: basicInfo.industry,
        goals: [conversationContext.extractedInfo.goal || conversationContext.userGoal || ''],
        offers: [conversationContext.extractedInfo.valueOffered || ''],
        lookings: [conversationContext.extractedInfo.valueDesired || ''],
        memories: []
      };

      const { error: aiTwinError } = await upsertAITwin(user.id, aiTwinData);

      if (aiTwinError) {
        console.error('Failed to save AI Twin:', aiTwinError);
        toast.error('保存AI Twin失败，请重试');
        setIsSavingToDatabase(false);
        return;
      }

      toast.success('所有数据已成功保存！');
      
      // 标记onboarding完成
      completeOnboarding(onboardingProgress.answers);

      // 导航到主页
      setTimeout(() => {
        navigate('/main');
      }, 500);

    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast.error('保存数据时出错，请重试');
    } finally {
      setIsSavingToDatabase(false);
    }
  };

  // AI生成下一个问题 - 支持多阶段
  const generateNextQuestion = async () => {
    setIsGeneratingQuestion(true);
    setIsAITyping(true);
    
    try {
      const nextQuestion = await withRetry(() => generateFollowUpQuestion(conversationContext));
      
      // 添加AI生成的问题到对话
      addAIMessageWithTyping(nextQuestion);
      
      // 更新对话上下文
      setConversationContext(prev => ({
        ...prev,
        conversationHistory: [
          ...prev.conversationHistory,
          { speaker: 'ai', message: nextQuestion }
        ],
        questionCount: prev.questionCount + 1,
        phaseQuestionCount: prev.phaseQuestionCount + 1
      }));
      
      setCanUserTypeGoal(true);
    } catch (error) {
      console.error('Error generating question:', error);
      // 回退到简单的默认问题
      const fallbackQuestion = "Could you tell me more about that?";
      addAIMessageWithTyping(fallbackQuestion);
      setConversationContext(prev => ({
        ...prev,
        conversationHistory: [
          ...prev.conversationHistory,
          { speaker: 'ai', message: fallbackQuestion }
        ],
        questionCount: prev.questionCount + 1,
        phaseQuestionCount: prev.phaseQuestionCount + 1
      }));
      setCanUserTypeGoal(true);
    } finally {
      setIsGeneratingQuestion(false);
      setIsAITyping(false);
    }
  };

  // 处理对话结束并提取信息到conversationContext
  // 信息已经在对话过程中被AI提取并保存到conversationContext.extractedInfo中
  // 不再需要单独的状态变量


  // 处理Goal聊天发送消息
  const handleGoalSendMessage = () => {
    if (!goalUserInput.trim() || !canUserTypeGoal) return;
    handleGoalChatInput(goalUserInput);
  };

  // 处理Goal聊天回车键
  const handleGoalKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 只处理Enter键，其他键（如左右键）不拦截
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleGoalSendMessage();
    }
    // 左右键、删除键等其他键不做任何处理，让浏览器默认行为生效
  };

  // 处理查看其他用户目标
  const handleViewOtherGoals = () => {
    setShowGoalInput(false);
    setShowOtherGoal(true);
  };

  // 处理从加载页面查看其他用户目标
  const handleViewOtherGoalsFromLoading = () => {
    setShowLoadingPage(false);
    setShowOtherGoal(true);
  };

  // 处理从AI介绍页面开始onboarding
  const handleStartOnboarding = () => {
    setShowAIIntro(false);
  };

  // 处理AI Twin名称保存并进入Basic Info页面
  const handleSaveAITwinName = () => {
    if (customAITwinName.trim()) {
      updateAITwinBasicInfo(customAITwinName.trim(), customAITwinAvatar);
      setShowAIIntro(false);
      setShowBasicInfo(true); // 进入Basic Info页面
    }
  };

  // 处理头像选择
  const handleAvatarSelect = (avatarSrc: string) => {
    setCustomAITwinAvatar(avatarSrc);
    setShowAvatarOptions(false);
  };

  // 添加AI消息并触发打字机效果
  const addAIMessageWithTyping = (content: string) => {
    const aiMessage = {
      type: 'ai' as const,
      content,
      timestamp: new Date()
    };
    
    setGoalChatMessages(prev => [...prev, aiMessage]);
    setCurrentTypingMessageIndex(prev => prev + 1);
    setIsMessageTyping(true);
  };

  // 打字机效果完成回调
  const handleTypingComplete = () => {
    setIsMessageTyping(false);
    setCanUserTypeGoal(true);
  };

  // 随机填充答案并跳转到最后一个问题（测试功能）
  const skipToLastQuestion = useCallback(() => {
    setIsAnimating(true);

    // 获取所有问题
    const allQuestions = onboardingQuestions;
    const lastQuestion = allQuestions[allQuestions.length - 1];

    // 随机填充前面问题的答案
    allQuestions.slice(0, -1).forEach(question => {
      const randomOption = question.options[Math.floor(Math.random() * question.options.length)];
      updateAnswer(question.id, [randomOption.id]);
    });

    // 跳转到最后一个问题
    setTimeout(() => {
      setCurrentQuestionId(lastQuestion.id);
      setSelectedOptions([]);
      setIsAnimating(false);
    }, 500);
  }, [updateAnswer]);

  // 处理选项选择
  const handleOptionSelect = (optionId: string) => {
    if (isAnimating) return;

    const question = currentQuestion;
    if (!question) return;

    let newSelectedOptions: string[];

    if (question.type === 'multiple-choice') {
      // 多选题
      if (selectedOptions.includes(optionId)) {
        newSelectedOptions = selectedOptions.filter(id => id !== optionId);
      } else {
        newSelectedOptions = [...selectedOptions, optionId];
      }
    } else {
      // 单选题
      newSelectedOptions = [optionId];
    }

    setSelectedOptions(newSelectedOptions);

    // 获取AI朋友评论
    const comment = getAIFriendComment(question.id, optionId);
    if (comment) {
      setAIFriendComment(comment);
      setShowCommentBubble(true);
      
      // 3秒后隐藏评论气泡
      setTimeout(() => {
        setShowCommentBubble(false);
      }, 3000);
    }
  };

  // 处理下一题
  const handleNext = useCallback(() => {
    if (isAnimating || selectedOptions.length === 0) return;

    const question = currentQuestion;
    if (!question) return;

    setIsAnimating(true);

    // 构建答案对象
    const answer = selectedOptions;

    // 更新OnboardingContext中的答案
    updateAnswer(currentQuestion.id, selectedOptions);
    
    // 同时更新本地状态
    setOnboardingAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedOptions
    }));

    // 获取下一题
    const nextQuestion = getNextQuestion(currentQuestion.id);

    // 动画延迟后跳转
    setTimeout(() => {
      if (nextQuestion) {
        setCurrentQuestionId(nextQuestion.id);
        setSelectedOptions([]);
      } else {
        // 完成Choice Made页面，进入Create Twin分析页面
        const finalAnswer: OnboardingAnswer = {
          questionId: currentQuestion.id,
          selectedOptions: answer,
          timestamp: new Date().toISOString()
        };
        const finalAnswers = {
          [currentQuestion.id]: finalAnswer
        };

        // 保存最终答案
        if (onComplete) {
          onComplete(finalAnswers);
        } else {
          completeOnboarding(finalAnswers);
        }

        // 进入Create Twin分析页面
        setShowTwinAnalysis(true);
        startTwinAnalysis();
      }
      setIsAnimating(false);
    }, 300);
  }, [currentQuestion, selectedOptions, updateAnswer, completeOnboarding, onComplete]);

  // 处理上一题
  const handlePrevious = useCallback(() => {
    const prevQuestion = getPreviousQuestion(currentQuestionId);

    if (prevQuestion) {
      setIsAnimating(true);

      setTimeout(() => {
        setCurrentQuestionId(prevQuestion.id);
        setSelectedOptions([]);
        setIsAnimating(false);
      }, 300);
    }
  }, [currentQuestionId]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isAnimating) return;

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (selectedOptions.length > 0) {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedOptions, isAnimating, currentQuestionId, handleNext, handlePrevious]);

  // AI伙伴自我介绍页面
  if (showAIIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center py-8">
        <div className="w-full max-w-7xl mx-4 flex gap-8">
          {/* 左侧：原有的AI Twin介绍内容 */}
          <div className="flex-1">
            <Card className="shadow-xl border-0 h-full">
              <CardContent className="p-8 text-center flex flex-col justify-center h-full">
                {/* AI伙伴头像 - 可点击选择 */}
                <div className="flex justify-center mb-6">
                  <div 
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => setShowAvatarOptions(!showAvatarOptions)}
                  >
                    <img
                      src={customAITwinAvatar}
                      alt="AI Twin"
                      className="w-28 h-28 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div
                      className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center text-6xl"
                      style={{ display: 'none' }}
                    >
                      🤖
                    </div>
                  </div>
                </div>

                {/* 头像选择选项 */}
                {showAvatarOptions && (
                  <div className="mb-6 p-4 bg-white rounded-lg shadow-inner">
                    <p className="text-sm text-gray-600 mb-3">Choose your AI Twin's avatar:</p>
                    <div className="flex justify-center space-x-3">
                      {avatarOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleAvatarSelect(option.src)}
                          className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-110 ${
                            customAITwinAvatar === option.src 
                              ? 'border-pink-500 shadow-lg' 
                              : 'border-gray-300 hover:border-pink-300'
                          }`}
                        >
                          <img
                            src={option.src}
                            alt={option.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Twin名称输入 */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Give your AI Twin a name:</p>
                  <Input
                    type="text"
                    placeholder="Enter AI Twin name..."
                    value={customAITwinName}
                    onChange={(e) => setCustomAITwinName(e.target.value)}
                    className="text-center text-lg font-medium"
                    maxLength={20}
                  />
                </div>

                {/* 欢迎标题 - 动态显示名称 */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Hi there! I'm {customAITwinName || '?'} 👋
                </h1>

                {/* 自我介绍内容 */}
                <div className="text-lg text-gray-700 leading-relaxed mb-8 space-y-4">
                  <p>
                    I'm <span className="font-semibold text-rose-600"> {customAITwinName || 'your AI Twin'}</span>. My job is to really understand what you're aiming for.
                  </p>
                  <p>
                    And the cool part? I'll also grow and get smarter through the connections you make.
                  </p>
                </div>

                {/* 开始按钮 */}
                <div className="space-y-4">
                  <button
                    onClick={customAITwinName.trim() ? handleSaveAITwinName : handleStartOnboarding}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {customAITwinName.trim() ? `Let's Get Started with ${customAITwinName}! 🚀` : "Let's Get Started! 🚀"}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowAIIntro(false);
                      skipToLastQuestion();
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
                  >
                    Skip to Last Question (Test Mode)
                  </button>
                </div>

                {/* 装饰元素 */}
                <div className="mt-8 flex justify-center space-x-4">
                  <div className="w-3 h-3 bg-pink-300 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：Profiling User流程模块 */}
          <div className="w-96">
            <Card className="shadow-xl border-0 h-full bg-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  Share with {customAITwinName || 'your AI Twin'}
                </h2>

                {/* 流程步骤 */}
                <div className="space-y-6">
                  {/* Step 1: Basic Info */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          1
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Basic Info</h3>
                          <p className="text-sm text-gray-600">
                            Tell us about yourself - age, gender, occupation, location, and industry
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* 箭头 */}
                    <div className="flex justify-center py-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                        <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Step 2: Goal Input */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          2
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Goal and Value</h3>
                          <p className="text-sm text-gray-600">
                            Chat with {customAITwinName || 'your AI Twin'} about your goals, what you offer, and what you seek
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* 箭头 */}
                    <div className="flex justify-center py-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                        <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Step 3: Choice Made */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          3
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Something Interesting</h3>
                          <p className="text-sm text-gray-600">
                            Share your tools and preferences to find better matches
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 底部提示 */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-center text-gray-500">
                    This should take about <span className="font-semibold text-gray-700">3-5 minutes</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Basic Info页面 - 用户填写基本信息
  if (showBasicInfo) {
    const handleBasicInfoChange = (field: string, value: string) => {
      setBasicInfo(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleBasicInfoSubmit = () => {
      // 验证必填字段
      if (!basicInfo.avatar || !basicInfo.nickname || !basicInfo.ageRange || !basicInfo.gender || !basicInfo.occupation || !basicInfo.industry || !basicInfo.location) {
        alert('Please fill in all required fields');
        return;
      }

      // 保存基本信息到profile和用户数据
      const updatedProfile = {
        ...aiTwinProfile,
        profile: {
          gender: basicInfo.gender,
          age: basicInfo.ageRange,
          occupation: basicInfo.occupation,
          location: basicInfo.location
        },
        // 保存用户昵称和头像（用于个性化对话）
        userNickname: basicInfo.nickname,
        userAvatar: basicInfo.avatar,
        userIndustry: basicInfo.industry
      };
      
      updateAITwinProfile(updatedProfile);

      // 跳转到Goal Input页面
      setShowBasicInfo(false);
      setShowGoalInput(true);
      setIsFirstGoalInput(true);
      
      // 初始化Goal Input聊天，直接传入用户信息
      initializeGoalChatWithUserInfo(basicInfo);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col relative overflow-hidden">
        {/* 进度条 */}
        <div className="w-full bg-white/80 backdrop-blur-sm shadow-sm z-20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step 1 of 3: Basic Info</span>
              <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* 背景装饰元素 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-3xl mx-4 relative z-10">
            <div className="backdrop-blur-xl bg-white/70 border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="relative px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5">
                <div className="text-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                    Tell Us About Yourself
                  </h1>
                  <p className="text-gray-600">
                    Help us personalize your experience with some basic information
                  </p>
                </div>
              </div>

            {/* Form Content */}
            <div className="p-8 space-y-6">
              {/* Avatar & Nickname Row */}
              <div className="flex items-start space-x-6 pb-6 border-b border-gray-200/50">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <label className="text-sm font-semibold text-gray-700 block mb-3">
                    Your Avatar <span className="text-red-500">*</span>
                  </label>
                  <div 
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform border-4 border-white overflow-hidden"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e: any) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            handleBasicInfoChange('avatar', e.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    {basicInfo.avatar ? (
                      <img src={basicInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-white text-center">
                        <div className="text-3xl mb-1">📷</div>
                        <div className="text-xs">Upload</div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Click to upload</p>
                </div>

                {/* Nickname */}
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                    Your Nickname <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={basicInfo.nickname}
                    onChange={(e) => handleBasicInfoChange('nickname', e.target.value)}
                    placeholder="How should we call you?"
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-2">This will be used throughout your journey</p>
                </div>
              </div>

              {/* Age Range & Gender Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Age Range */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    Age Range <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={basicInfo.ageRange}
                    onChange={(e) => handleBasicInfoChange('ageRange', e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select age range</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55+">55+</option>
                  </select>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    Gender <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={basicInfo.gender}
                    onChange={(e) => handleBasicInfoChange('gender', e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Occupation */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  Occupation <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={basicInfo.occupation}
                  onChange={(e) => handleBasicInfoChange('occupation', e.target.value)}
                  placeholder="e.g., Software Engineer, Designer, Student..."
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  Industry <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={basicInfo.industry}
                  onChange={(e) => handleBasicInfoChange('industry', e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select your industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Media & Entertainment">Media & Entertainment</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Non-profit">Non-profit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  Location <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={basicInfo.location}
                  onChange={(e) => handleBasicInfoChange('location', e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
              <button
                onClick={handleBasicInfoSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Continue to Goal Setting</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                <span className="text-red-500">*</span> Required fields
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAnimating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading next question...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Welcome to OnlyMsg!</h2>
            <p className="text-gray-600 mb-6">
              Your preferences have been saved. Let's start sharing your stories!
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Start Exploring
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 短暂加载页面
  if (showLoadingPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-4">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              {/* AI伙伴头像 */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
                  <img
                    src={aiTwinProfile?.avatar || customAITwinAvatar}
                    alt="AI Friend"
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-4xl"
                    style={{ display: 'none' }}
                  >
                    🤖
                  </div>
                </div>
              </div>

              {/* 加载标题 */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Processing your goal... ⚡
              </h1>

              {/* 加载描述 */}
              <p className="text-lg text-gray-700 mb-8">
                I'm analyzing your goal and finding people with similar aspirations. This will just take a moment!
              </p>

              {/* 加载动画 */}
              <div className="flex justify-center mb-8">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>

              {/* Other Goal入口按钮 */}
              <div className="space-y-4">
                <button
                  onClick={handleViewOtherGoalsFromLoading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🔍 See what similar people want to achieve
                </button>
                
                <p className="text-sm text-gray-500">
                  Or wait a moment for automatic processing...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Goal输入页面 (聊天形式) - 现代未来感设计
  if (showGoalInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col relative overflow-hidden">
        {/* 进度条 */}
        <div className="w-full bg-white/80 backdrop-blur-sm shadow-sm z-20">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step 2 of 3: Goal and Value</span>
              <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* 背景装饰元素 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-5xl mx-4 relative z-10">
            {/* 玻璃态卡片容器 */}
            <div className="backdrop-blur-xl bg-white/70 border border-white/20 shadow-2xl rounded-3xl h-[700px] flex flex-col overflow-hidden">
              {/* Header - 简洁现代的顶部栏 */}
              <div className="relative px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* AI Twin头像 */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-4 ring-blue-100/50 overflow-hidden">
                      <img
                        src={aiTwinProfile?.avatar || customAITwinAvatar}
                        alt={aiTwinProfile?.name || customAITwinName || "AI Twin"}
                        className="w-12 h-12 rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    {/* 在线指示器 */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {aiTwinProfile?.name || customAITwinName || 'AI Twin'}
                    </h2>
                    <p className="text-sm text-gray-600 font-medium">
                      {conversationContext.currentPhase === 'goal' ? '🎯 Understanding your goals' : 
                       conversationContext.currentPhase === 'value_offered' ? '💝 What you can offer' : 
                       '🌟 What you\'re seeking'}
                    </p>
                  </div>
                </div>

                {/* 进度指示器 - 现代简约风格 */}
                <div className="flex items-center space-x-2">
                  <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/50">
                    <span className="text-sm font-semibold text-gray-700">
                      Question {currentGoalQuestionIndex + 1}
                    </span>
                  </div>
                  <div className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
                    <span className="text-xs font-medium text-white">✨ AI-Powered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages - 现代明亮的聊天气泡 */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {goalChatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'ai' ? 'justify-start' : 'justify-end'} animate-fade-in`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* AI Avatar */}
                  {message.type === 'ai' && (
                    <div className="mr-4 mt-1 flex-shrink-0">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-blue-100 overflow-hidden transform transition-transform hover:scale-110">
                          <img
                            src={aiTwinProfile?.avatar || customAITwinAvatar}
                            alt={aiTwinProfile?.name || customAITwinName || "AI Twin"}
                            className="w-9 h-9 rounded-xl object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) {
                                fallback.style.display = 'flex';
                              }
                            }}
                          />
                          <div
                            className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center text-lg"
                            style={{ display: 'none' }}
                          >
                            🤖
                          </div>
                        </div>
                        {/* 发光效果 */}
                        <div className="absolute inset-0 rounded-2xl bg-blue-400/30 blur-md -z-10"></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col max-w-[75%]">
                    <div
                      className={`relative rounded-2xl p-5 shadow-lg transition-all duration-300 hover:shadow-xl ${
                        message.type === 'ai'
                          ? 'bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50 backdrop-blur-sm'
                          : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                      }`}
                    >
                      {/* AI名字标签 */}
                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {aiTwinProfile?.name || customAITwinName || 'AI Twin'}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                          <span className="text-xs text-gray-400">AI</span>
                        </div>
                      )}
                      
                      {message.type === 'ai' && index === currentTypingMessageIndex && isMessageTyping ? (
                        <TypewriterText 
                          text={message.content}
                          speed={30}
                          onComplete={handleTypingComplete}
                          className={`text-base leading-relaxed ${message.type === 'ai' ? 'text-gray-800' : 'text-white'}`}
                        />
                      ) : (
                        <p className={`text-base leading-relaxed ${message.type === 'ai' ? 'text-gray-800' : 'text-white'}`}>
                          {message.content}
                        </p>
                      )}
                      
                      <p className={`text-xs mt-3 flex items-center ${
                        message.type === 'ai' ? 'text-gray-400' : 'text-blue-100'
                      }`}>
                        <span className="mr-1">🕐</span>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>

                      {/* 消息尾巴装饰 */}
                      {message.type === 'ai' ? (
                        <div className="absolute -left-2 top-6 w-4 h-4 bg-gradient-to-br from-white to-blue-50/50 border-l border-b border-blue-100/50 transform rotate-45"></div>
                      ) : (
                        <div className="absolute -right-2 top-6 w-4 h-4 bg-gradient-to-br from-blue-600 to-indigo-600 transform rotate-45"></div>
                      )}
                    </div>
                  </div>

                  {/* 用户头像 */}
                  {message.type === 'user' && (
                    <div className="ml-4 mt-1 flex-shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-blue-100 transform transition-transform hover:scale-110">
                        You
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* AI Typing indicator - 现代动画效果 */}
              {isAITyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="mr-4 mt-1 flex-shrink-0">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-blue-100 overflow-hidden">
                        <img
                          src={aiTwinProfile?.avatar || customAITwinAvatar}
                          alt="AI Twin"
                          className="w-9 h-9 rounded-xl object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                        <div
                          className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center text-lg"
                          style={{ display: 'none' }}
                        >
                          🤖
                        </div>
                      </div>
                      {/* 脉冲动画 */}
                      <div className="absolute inset-0 rounded-2xl bg-blue-400/30 blur-md -z-10 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50 backdrop-blur-sm rounded-2xl p-5 shadow-lg max-w-[70%]">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input - 现代输入框 */}
            <div className="border-t border-gray-200/50 px-8 py-6 bg-gradient-to-r from-gray-50/50 to-blue-50/30 backdrop-blur-sm">
              <div className="flex gap-3 items-center">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={goalUserInput}
                    onChange={(e) => setGoalUserInput(e.target.value)}
                    onKeyDown={handleGoalKeyPress}
                    placeholder={currentGoalQuestionIndex === 0 ? "💭 Share your goal here..." : "✍️ Type your answer here..."}
                    className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canUserTypeGoal}
                  />
                  {/* 输入框装饰 */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                    {goalUserInput.trim() ? '✨' : '💬'}
                  </div>
                </div>
                <button
                  onClick={handleGoalSendMessage}
                  disabled={!goalUserInput.trim() || !canUserTypeGoal}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
                >
                  <span>Send</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between mt-3 px-2">
                <p className="text-xs text-gray-500 flex items-center space-x-2">
                  <span className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-white rounded border border-gray-200 text-xs font-mono shadow-sm">Enter</kbd>
                    <span>to send</span>
                  </span>
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500 font-medium">
                    {conversationContext.currentPhase === 'goal' ? '🎯 Goals phase' : 
                     conversationContext.currentPhase === 'value_offered' ? '💝 Value offering' : 
                     '🌟 Value seeking'}
                  </span>
                </div>
              </div>
            </div>

            {/* 等待Twin分析的提示 - 只在所有问题都回答完后显示 */}
            {currentGoalQuestionIndex >= goalQuestions.length && !isAITyping && (
              <div className="border-t border-gray-200/50 px-8 py-6 text-center bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    All questions completed!
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  ✨ Preparing to create your AI Twin with advanced AI technology...
                </p>
                <div className="flex justify-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 30秒后显示的Other Goal按钮 - 现代浮动按钮 */}
        {showOtherGoalButton && (
          <div className="fixed bottom-8 right-8 animate-fade-in z-20">
            <button
              onClick={handleViewOtherGoals}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 max-w-sm font-semibold transform hover:scale-105 backdrop-blur-sm border border-white/20"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">🔍</span>
                <span className="text-sm">See what similar people want to achieve</span>
              </div>
            </button>
          </div>
        )}
        </div>
      </div>
    );
  }

  // Twin分析页面 - 环形进度条
  if (showTwinAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-4">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              {/* AI伙伴头像 */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
                  <img
                    src={aiTwinProfile?.avatar || customAITwinAvatar}
                    alt="AI Twin"
                    className="w-28 h-28 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div
                    className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-300 to-indigo-400 flex items-center justify-center text-6xl"
                    style={{ display: 'none' }}
                  >
                    🤖
                  </div>
                </div>
              </div>

              {/* 分析标题 */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Creating {aiTwinProfile?.name || customAITwinName || 'your AI Twin'} ✨
              </h1>

              {/* 分析描述 */}
              <p className="text-lg text-gray-700 mb-8">
                {isAIProcessing ? aiProcessingStep : "I'm analyzing your responses to create a personalized AI Twin that reflects your personality, values, and goals."}
              </p>
              
              {/* AI处理状态 */}
              {isAIProcessing && (
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-2 text-purple-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">AI is working on your profile...</span>
                  </div>
                </div>
              )}

              {/* 环形进度条 */}
              <div className="flex justify-center mb-8">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    {/* 背景圆环 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* 进度圆环 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="url(#twinGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${twinAnalysisProgress * 2.83} 283`}
                      className="transition-all duration-300 ease-out"
                    />
                    {/* 渐变定义 */}
                    <defs>
                      <linearGradient id="twinGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{Math.round(twinAnalysisProgress)}%</span>
                  </div>
                </div>
              </div>

              {/* 装饰动画 */}
              <div className="flex justify-center space-x-4">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Create Twin页面 - AI Twin建模
  if (showCreateTwin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
        <div className="w-full max-w-7xl mx-auto px-4">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-xl">
              <CardTitle className="text-3xl font-bold mb-2">
                Your Profile Summary
              </CardTitle>
              <CardDescription className="text-lg text-white/90">
                Review all the information you've shared with us
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* 左侧 - 用户信息展示 */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <span className="text-2xl mr-2">👤</span>
                      Basic Information
                    </h3>
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={basicInfo.avatar}
                        alt="Your avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                      />
                      <div>
                        <p className="font-semibold text-lg text-gray-900">{basicInfo.nickname}</p>
                        <p className="text-sm text-gray-600">{basicInfo.gender} • {basicInfo.ageRange}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Occupation:</span>
                        <span className="font-medium text-gray-900">{basicInfo.occupation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Industry:</span>
                        <span className="font-medium text-gray-900">{basicInfo.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-900">{basicInfo.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Goals & Values */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <span className="text-2xl mr-2">🎯</span>
                      Goals & Values
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-purple-700 mb-1">Current Goal:</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {conversationContext.extractedInfo.goal || conversationContext.userGoal || 'No goal specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-700 mb-1">What I Can Offer:</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {conversationContext.extractedInfo.valueOffered || 'No value specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-700 mb-1">What I'm Looking For:</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {conversationContext.extractedInfo.valueDesired || 'No value specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Choice Made Answers */}
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <span className="text-2xl mr-2">✅</span>
                      Your Choices
                    </h3>
                    <div className="space-y-3">
                      {Object.keys(onboardingAnswers).length > 0 ? (
                        Object.entries(onboardingAnswers).map(([questionId, answer]) => {
                          const question = onboardingQuestions.find(q => q.id === questionId);
                          if (!question) return null;
                          
                          return (
                            <div key={questionId} className="border-b border-green-200 pb-3 last:border-0 last:pb-0">
                              <p className="text-sm font-medium text-green-700 mb-1">{question.title}</p>
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(answer) ? answer : [answer]).map((ans, idx) => {
                                  const option = question.options.find(opt => opt.value === ans);
                                  return (
                                    <span key={idx} className="inline-block px-2 py-1 bg-white rounded text-xs text-gray-700 border border-green-200">
                                      {option?.label || ans}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500 italic">No choices recorded yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 右侧 - AI Twin展示 */}
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-10 border-2 border-emerald-200 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Your AI Twin
                    </h3>
                    
                    {/* AI Twin头像 */}
                    <div className="flex justify-center mb-6">
                      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl border-4 border-white overflow-hidden">
                        <img
                          src={aiTwinProfile?.avatar || customAITwinAvatar}
                          alt="Your AI Twin"
                          className="w-36 h-36 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                        <div
                          className="w-36 h-36 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 flex items-center justify-center text-7xl"
                          style={{ display: 'none' }}
                        >
                          🤖
                        </div>
                      </div>
                    </div>

                    {/* AI Twin名称 */}
                    <h4 className="text-3xl font-bold text-gray-900 mb-2">
                      {aiTwinProfile?.name || customAITwinName || 'AI Twin'}
                    </h4>
                    <p className="text-gray-600 text-sm mb-6">
                      Your intelligent digital companion
                    </p>

                    {/* 描述 */}
                    <div className="bg-white rounded-lg p-6 border border-emerald-200">
                      <p className="text-gray-700 leading-relaxed text-sm">
                        <span className="font-semibold text-emerald-600">{aiTwinProfile?.name || customAITwinName}</span> has been created based on your profile. 
                        It will help you connect with like-minded people and grow together.
                      </p>
                    </div>

                    {/* 装饰性标签 */}
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        🤝 Connect
                      </span>
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                        💬 Chat
                      </span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        🌱 Grow
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 完成按钮 */}
              <div className="text-center mt-12">
                <button
                  onClick={handleEnterNetwork}
                  className="w-full max-w-md py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Continue to Network 🌐
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  All information looks good? Let's explore your network!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Network页面 - 介绍AI Twin网络
  if (showNetwork) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-4">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to the Future Network 🌐
              </CardTitle>
              <CardDescription className="text-xl text-gray-600">
                Discover a new way to connect and grow through AI-powered conversations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* 左侧文字内容 */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                      <span className="text-3xl mr-3">🤝</span>
                      How The Network Works
                    </h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Just like you, all of our users have their own AI twin. To meet their endless social needs, a network has been created to connect all of our professional and charming AI twins.
                    </p>
                    <br />
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Unlike Facebook or Twitter, this network doesn't connect people through content, but through value exchange. The AI twins share their own information, their views on the same topics, and their understanding of shared goals. The ultimate aim is for both sides to benefit from the exchange.
                    </p>
                  </div>

                  {/* 特色功能 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <div className="text-2xl mb-3">💬</div>
                      <h4 className="font-semibold text-gray-900 mb-2">One-on-One Chats</h4>
                      <p className="text-sm text-gray-600">Deep, meaningful conversations between AI twins</p>
                    </div>
                    <div className="bg-cyan-50 rounded-lg p-6 border border-cyan-200">
                      <div className="text-2xl mb-3">🎯</div>
                      <h4 className="font-semibold text-gray-900 mb-2">Shared Goals</h4>
                      <p className="text-sm text-gray-600">Connect with twins who share similar objectives</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <div className="text-2xl mb-3">🧠</div>
                      <h4 className="font-semibold text-gray-900 mb-2">Knowledge Exchange</h4>
                      <p className="text-sm text-gray-600">Share insights and learn from each other</p>
                    </div>
                    <div className="bg-cyan-50 rounded-lg p-6 border border-cyan-200">
                      <div className="text-2xl mb-3">🌟</div>
                      <h4 className="font-semibold text-gray-900 mb-2">Mutual Growth</h4>
                      <p className="text-sm text-gray-600">Both sides benefit from every interaction</p>
                    </div>
                  </div>
                </div>

                {/* 右侧网络连接图 - 行星环绕动画 */}
                <div className="flex justify-center">
                  <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 w-full max-w-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                      AI Twin Network Visualization
                    </h3>
                    <div className="relative w-full h-96 flex items-center justify-center">
                      {/* 中心头像 - 用户的AI Twin */}
                      <div className="absolute w-20 h-20 rounded-full border-4 border-purple-300 shadow-lg overflow-hidden z-20">
                        <img
                          src={aiTwinProfile?.avatar || customAITwinAvatar}
                          alt="Your AI Twin"
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
                          className="w-full h-full bg-purple-400 flex items-center justify-center text-3xl"
                          style={{ display: 'none' }}
                        >
                          👤
                        </div>
                      </div>

                      {/* 轨道线 */}
                      <div className="absolute w-40 h-40 border border-blue-200 rounded-full opacity-30"></div>
                      <div className="absolute w-56 h-56 border border-cyan-200 rounded-full opacity-30"></div>
                      <div className="absolute w-72 h-72 border border-blue-200 rounded-full opacity-30"></div>

                      {/* 环绕头像1 - 内层轨道 */}
                      <div 
                        className="absolute w-12 h-12 rounded-full z-10"
                        style={{
                          animation: 'orbit-inner 8s linear infinite',
                          transformOrigin: '192px 192px'
                        }}
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-blue-300 shadow-md overflow-hidden bg-white">
                          <img
                            src="/avatars/1.png"
                            alt="AI Twin 1"
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
                            className="w-full h-full bg-blue-400 flex items-center justify-center text-sm"
                            style={{ display: 'none' }}
                          >
                            🤖
                          </div>
                        </div>
                      </div>

                      {/* 环绕头像2 - 中层轨道 */}
                      <div 
                        className="absolute w-14 h-14 rounded-full z-10"
                        style={{
                          animation: 'orbit-middle 12s linear infinite',
                          transformOrigin: '192px 192px'
                        }}
                      >
                        <div className="w-14 h-14 rounded-full border-2 border-cyan-300 shadow-md overflow-hidden bg-white">
                          <img
                            src="/avatars/2.png"
                            alt="AI Twin 2"
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
                            className="w-full h-full bg-cyan-400 flex items-center justify-center text-sm"
                            style={{ display: 'none' }}
                          >
                            🤖
                          </div>
                        </div>
                      </div>

                      {/* 环绕头像3 - 中层轨道 (反向) */}
                      <div 
                        className="absolute w-14 h-14 rounded-full z-10"
                        style={{
                          animation: 'orbit-middle-reverse 10s linear infinite',
                          transformOrigin: '192px 192px'
                        }}
                      >
                        <div className="w-14 h-14 rounded-full border-2 border-cyan-300 shadow-md overflow-hidden bg-white">
                          <img
                            src="/avatars/3.png"
                            alt="AI Twin 3"
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
                            className="w-full h-full bg-cyan-400 flex items-center justify-center text-sm"
                            style={{ display: 'none' }}
                          >
                            🤖
                          </div>
                        </div>
                      </div>

                      {/* 环绕头像4 - 外层轨道 */}
                      <div 
                        className="absolute w-16 h-16 rounded-full z-10"
                        style={{
                          animation: 'orbit-outer 16s linear infinite',
                          transformOrigin: '192px 192px'
                        }}
                      >
                        <div className="w-16 h-16 rounded-full border-2 border-blue-300 shadow-md overflow-hidden bg-white">
                          <img
                            src="/avatars/4.png"
                            alt="AI Twin 4"
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
                            className="w-full h-full bg-blue-400 flex items-center justify-center text-sm"
                            style={{ display: 'none' }}
                          >
                            🤖
                          </div>
                        </div>
                      </div>

                      {/* 动态连接线 - SVG实现 */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
                        <defs>
                          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                          </linearGradient>
                        </defs>
                        
                        {/* 从中心到各个轨道的连接线 */}
                        <g stroke="url(#connectionGradient)" strokeWidth="2" fill="none">
                          {/* 内层轨道连接线 */}
                          <line x1="50%" y1="50%" x2="50%" y2="25%" className="animate-pulse" opacity="0.6" />
                          <line x1="50%" y1="50%" x2="75%" y2="50%" className="animate-pulse" opacity="0.6" style={{ animationDelay: '0.5s' }} />
                          <line x1="50%" y1="50%" x2="50%" y2="75%" className="animate-pulse" opacity="0.6" style={{ animationDelay: '1s' }} />
                          <line x1="50%" y1="50%" x2="25%" y2="50%" className="animate-pulse" opacity="0.6" style={{ animationDelay: '1.5s' }} />
                        </g>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 text-center mt-4">
                      AI Twins orbit around each other, forming a dynamic network of connections
                    </p>
                  </div>
                </div>
              </div>

              {/* 开始连接按钮 */}
              <div className="text-center mt-12">
                <button
                  onClick={handleEnterConnect}
                  className="w-full max-w-md py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Experience Your First Connection 🔗
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Connect页面 - 第一次连接体验
  if (showConnect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-4">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-4xl font-bold text-gray-900 mb-4">
                Your First Connection 🔗
              </CardTitle>
              <CardDescription className="text-xl text-gray-600">
                Watch as your AI Twin reaches out and forms its first meaningful connection
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* 左侧连接动画 */}
                <div className="flex justify-center">
                  <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 w-full max-w-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                      Live Connection Visualization
                    </h3>
                    <div className="relative w-full h-96 flex items-center justify-center">
                      {/* 中心头像 - 用户的AI Twin */}
                      <div className="absolute w-20 h-20 rounded-full border-4 border-emerald-300 shadow-lg overflow-hidden z-20 animate-pulse">
                        <img
                          src="/aiTwinProfile?.avatar || customAITwinAvatar}"
                          alt="Your AI Twin"
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
                          className="w-full h-full bg-emerald-400 flex items-center justify-center text-3xl"
                          style={{ display: 'none' }}
                        >
                          👤
                        </div>
                      </div>

                      {/* 轨道线 */}
                      <div className="absolute w-40 h-40 border border-emerald-200 rounded-full opacity-30"></div>
                      <div className="absolute w-56 h-56 border border-teal-200 rounded-full opacity-30"></div>
                      <div className="absolute w-72 h-72 border border-emerald-200 rounded-full opacity-30"></div>

                      {/* 环绕头像1 - 内层轨道 */}
                      <div 
                        className="absolute w-12 h-12 rounded-full z-10"
                        style={{
                          animation: 'orbit-inner 8s linear infinite',
                          transformOrigin: '192px 192px'
                        }}
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-emerald-300 shadow-md overflow-hidden bg-white">
                          <img
                            src="/avatars/1.png"
                            alt="AI Twin 1"
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
                            className="w-full h-full bg-emerald-400 flex items-center justify-center text-sm"
                            style={{ display: 'none' }}
                          >
                            🤖
                          </div>
                        </div>
                      </div>

                      {/* 环绕头像2 - 中层轨道 */}
                      <div 
                        className="absolute w-14 h-14 rounded-full z-10"
                        style={{
                          animation: 'orbit-middle 12s linear infinite',
                          transformOrigin: '192px 192px'
                        }}
                      >
                        <div className="w-14 h-14 rounded-full border-2 border-teal-300 shadow-md overflow-hidden bg-white">
                          <img
                            src="/avatars/2.png"
                            alt="AI Twin 2"
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
                            className="w-full h-full bg-teal-400 flex items-center justify-center text-sm"
                            style={{ display: 'none' }}
                          >
                            🤖
                          </div>
                        </div>
                      </div>

                      {/* 环绕头像3 - 中层轨道 (反向) */}
                      <div 
                        className="absolute w-14 h-14 rounded-full z-10"
                        style={{
                          animation: 'orbit-middle-reverse 10s linear infinite',
                          transformOrigin: '192px 192px'
                        }}
                      >
                        <div className="w-14 h-14 rounded-full border-2 border-teal-300 shadow-md overflow-hidden bg-white">
                          <img
                            src="/avatars/3.png"
                            alt="AI Twin 3"
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
                            className="w-full h-full bg-teal-400 flex items-center justify-center text-sm"
                            style={{ display: 'none' }}
                          >
                            🤖
                          </div>
                        </div>
                      </div>

                      {/* 环绕头像4 - 外层轨道 */}
                      <div 
                        className="absolute w-16 h-16 rounded-full z-10"
                        style={{
                          animation: 'orbit-outer 16s linear infinite',
                          transformOrigin: '192px 192px'
                        }}
                      >
                        <div className="w-16 h-16 rounded-full border-2 border-emerald-300 shadow-md overflow-hidden bg-white">
                          <img
                            src="/avatars/4.png"
                            alt="AI Twin 4"
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
                            className="w-full h-full bg-emerald-400 flex items-center justify-center text-sm"
                            style={{ display: 'none' }}
                          >
                            🤖
                          </div>
                        </div>
                      </div>

                      {/* 动态连接线 - 更精确的SVG实现 */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
                        <defs>
                          <linearGradient id="connectionGrowth" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.6" />
                          </linearGradient>
                        </defs>
                        
                        {/* 连接线到内层轨道头像（右上） */}
                        <line x1="50%" y1="50%" x2="65%" y2="35%" 
                              stroke="url(#connectionGrowth)" 
                              strokeWidth="3" 
                              strokeLinecap="round"
                              className="animate-connection-line" />
                        
                        {/* 连接线到中层轨道头像1（右侧） */}
                        <line x1="50%" y1="50%" x2="75%" y2="50%" 
                              stroke="url(#connectionGrowth)" 
                              strokeWidth="3" 
                              strokeLinecap="round"
                              className="animate-connection-line-delay-1" />
                        
                        {/* 连接线到中层轨道头像2（左侧） */}
                        <line x1="50%" y1="50%" x2="25%" y2="50%" 
                              stroke="url(#connectionGrowth)" 
                              strokeWidth="3" 
                              strokeLinecap="round"
                              className="animate-connection-line-delay-2" />
                        
                        {/* 连接线到外层轨道头像（下方） */}
                        <line x1="50%" y1="50%" x2="50%" y2="82%" 
                              stroke="url(#connectionGrowth)" 
                              strokeWidth="3" 
                              strokeLinecap="round"
                              className="animate-connection-line-delay-3" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 text-center mt-4">
                      Your AI Twin is reaching out to form meaningful connections
                    </p>
                  </div>
                </div>

                {/* 右侧内容区域 - 简洁的连接展示 */}
                <div className="flex items-center justify-center min-h-96">
                  {!showChatDialog ? (
                    // 空白版
                    <div className="w-full h-96 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-gray-400 text-sm">Waiting for connection...</p>
                      </div>
                    </div>
                  ) : (
                    // 连接成功展示
                    <div className="w-full space-y-6 animate-fade-in">
                      {/* 成功消息 */}
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Awesome! After chatting with all the other AI twins, your AI twin has found its first connection!
                        </h3>
                      </div>

                      {/* 连接卡片 */}
                      <div 
                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        onClick={() => setShowChatPopup(true)}
                      >
                        <div className="flex items-center justify-between">
                          {/* 左侧 - 用户AI Twin */}
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full border-2 border-emerald-300 overflow-hidden mb-2">
                              <img
                                src="/aiTwinProfile?.avatar || customAITwinAvatar}"
                                alt="Your AI Twin"
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
                                className="w-full h-full bg-emerald-400 flex items-center justify-center text-2xl"
                                style={{ display: 'none' }}
                              >
                                👤
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Your AI Twin</p>
                          </div>

                          {/* 中间 - 连接线 */}
                          <div className="flex-1 flex items-center justify-center px-4">
                            <div className="w-full border-t-2 border-emerald-400 relative">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white px-2">
                                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 右侧 - 连接的AI Twin */}
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full border-2 border-teal-300 overflow-hidden mb-2">
                              <img
                                src="/avatars/2.png"
                                alt="Connected AI Twin"
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
                                className="w-full h-full bg-teal-400 flex items-center justify-center text-2xl"
                                style={{ display: 'none' }}
                              >
                                🤖
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Alex's AI Twin</p>
                          </div>
                        </div>

                        {/* 连接信息 */}
                        <div className="mt-4 text-center">
                          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            <span>Connected • Click to view conversation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 完成连接按钮 */}
              <div className="text-center mt-12">
                <button
                  onClick={() => {
                    handleCompleteOnboarding();
                    navigate('/main');
                  }}
                  className="w-full max-w-md py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Your AI Twin Journey 🎉
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 聊天记录悬浮窗 - 扩大尺寸 */}
        {showChatPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowChatPopup(false)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* 弹窗头部 */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Conversation with Alex's AI Twin</h4>
                    <p className="text-sm text-emerald-600">• Connected</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChatPopup(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* 聊天内容 */}
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* 消息1 */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="text-sm text-gray-800">Hello! I'm Alex's AI Twin. I noticed we have similar goals around content creation.</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                </div>

                {/* 消息2 - 用户的AI Twin回复 */}
                <div className="flex items-start space-x-3 justify-end">
                  <div className="flex-1 text-right">
                    <div className="bg-teal-50 rounded-lg p-3 inline-block">
                      <p className="text-sm text-gray-800">Hi Alex! Yes, I'd love to discuss content strategies and learn from your experience.</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">👤</span>
                  </div>
                </div>

                {/* 消息3 */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="text-sm text-gray-800">Great! I've been working on building authentic engagement. What's been your biggest challenge lately?</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">1 minute ago</p>
                  </div>
                </div>

                {/* 消息4 */}
                <div className="flex items-start space-x-3 justify-end">
                  <div className="flex-1 text-right">
                    <div className="bg-teal-50 rounded-lg p-3 inline-block">
                      <p className="text-sm text-gray-800">My biggest challenge has been maintaining consistency across different platforms while keeping the content authentic to my voice.</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">1 minute ago</p>
                  </div>
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">👤</span>
                  </div>
                </div>

                {/* 消息5 */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="text-sm text-gray-800">That's such a common struggle! I've found that creating a content framework helps. Would you like me to share some strategies that have worked for me?</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Just now</p>
                  </div>
                </div>

                {/* 输入状态指示 */}
                <div className="flex items-start space-x-3 justify-end">
                  <div className="flex-1 text-right">
                    <div className="bg-gray-100 rounded-lg p-3 inline-block">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Typing...</p>
                  </div>
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">👤</span>
                  </div>
                </div>
              </div>

              {/* Interested In按钮 */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={async () => {
                    setShowChatPopup(false);
                    await handleCompleteOnboarding();
                  }}
                  disabled={isSavingToDatabase}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSavingToDatabase ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Complete Onboarding'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // OtherGoal页面 - 显示相似用户的目标
  if (showOtherGoal) {
    const mockSimilarUsers = [
      {
        id: 1,
        name: "Alex Thompson",
        avatar: "👨‍💻",
        goal: "I want to transition from backend development to machine learning and land a role at a tech company within the next year.",
        similarity: 95,
        background: "Software Engineer, 3 years experience"
      },
      {
        id: 2,
        name: "Sarah Chen",
        avatar: "👩‍🔬",
        goal: "Looking to build my own SaaS product while maintaining my current job, focusing on productivity tools for remote teams.",
        similarity: 92,
        background: "Product Manager, 5 years experience"
      },
      {
        id: 3,
        name: "Marcus Williams",
        avatar: "👨‍🎨",
        goal: "Want to combine my design skills with coding to become a full-stack developer and work on meaningful projects that impact society.",
        similarity: 88,
        background: "UI/UX Designer, 4 years experience"
      },
      {
        id: 4,
        name: "Emily Rodriguez",
        avatar: "👩‍💼",
        goal: "Planning to start my own consulting business in digital marketing while building a personal brand through content creation.",
        similarity: 85,
        background: "Marketing Specialist, 6 years experience"
      },
      {
        id: 5,
        name: "David Kim",
        avatar: "👨‍🏫",
        goal: "Transitioning from traditional education to EdTech, wanting to create online courses and educational platforms for underserved communities.",
        similarity: 82,
        background: "High School Teacher, 8 years experience"
      }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 py-8">
        <div className="w-full max-w-4xl mx-4 md:mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              People Similar to You
            </h1>
            <p className="text-lg text-gray-600">
              Here are goals from users with similar profiles and interests as yours
            </p>
          </div>

          {/* Similar Users Goals */}
          <div className="space-y-6">
            {mockSimilarUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* User Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-500 flex items-center justify-center text-2xl flex-shrink-0">
                      {user.avatar}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <span className="text-sm text-indigo-600 font-medium">{user.similarity}% similar</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{user.background}</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-800 leading-relaxed italic">
                          "{user.goal}"
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => {
                setShowOtherGoal(false);
                setShowGoalInput(true);
                setIsFirstGoalInput(false); // 确保返回时是第二次进入
              }}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors duration-200"
            >
              Back to My Goal
            </button>
            <button
              onClick={() => {
                // 完成整个onboarding流程
                // setShouldShowOnboarding(false); // Removed - no auth context
                if (forceTest) {
                  navigate('/');
                }
              }}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              I'm Inspired - Let's Start!
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* AI Friend Avatar - Fixed Position */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50">
        <div className="relative">
          {/* AI Friend Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
            <img
              src={aiTwinProfile?.avatar || customAITwinAvatar}
              alt="AI Friend"
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
            <div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center text-2xl"
              style={{ display: 'none' }}
            >
              🤖
            </div>
          </div>

          {/* Comment Bubble */}
          {showCommentBubble && aiFriendComment && (
            <div className="absolute top-1/2 left-24 transform -translate-y-1/2 animate-bounce-in">
              <div className="relative">
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-6 border-b-6 border-r-6 border-transparent border-r-white"></div>
                <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 min-w-80 max-w-96">
                  <div className="text-sm text-gray-800 leading-relaxed">
                    {aiFriendComment}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-4">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Step 3 of 3: Something Interesting</h2>
              <span className="text-sm text-gray-600">
                Question {currentIndex + 1} of {onboardingQuestions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${overallProgress}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-blue-500 rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardHeader className="text-center pb-6">
               <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                 {currentQuestion.title}
               </CardTitle>
               {currentQuestion.subtitle && (
                 <CardDescription className="text-lg text-gray-600">
                   {currentQuestion.subtitle}
                 </CardDescription>
               )}
            </CardHeader>
            <CardContent>
              {/* Options Grid */}
              <div className={`grid gap-4 mb-8 ${
                currentQuestion.options.length === 2 ? 'grid-cols-2' :
                currentQuestion.options.length === 5 ? 'grid-cols-5' :
                currentQuestion.options.length === 6 ? 'grid-cols-6' :
                currentQuestion.options.length === 9 ? 'grid-cols-3' :
                'grid-cols-3'
              }`}>
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={isAnimating}
                    className={`${
                      currentQuestion.id === 'daily-tools' ? 'p-4' : 'p-6'
                    } rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      selectedOptions.includes(option.id)
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    } ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                       <div className="text-4xl mb-2">
                         {option.avatar ? (
                           <img 
                             src={option.avatar.src} 
                             alt={option.avatar.alt}
                             className={`w-16 h-16 object-cover ${
                               currentQuestion.id === 'daily-tools' 
                                 ? 'rounded-lg' 
                                 : 'rounded-full'
                             }`}
                             onError={(e) => {
                               e.currentTarget.style.display = 'none';
                               const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                               if (fallback) {
                                 fallback.style.display = 'block';
                               }
                             }}
                           />
                         ) : null}
                         {option.icon && (
                           <span style={{ display: option.avatar ? 'none' : 'block' }}>
                             {option.icon}
                           </span>
                         )}
                       </div>
                       <span className="font-medium text-gray-900 text-sm leading-tight">
                         {option.label}
                       </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0 || isAnimating}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  onClick={skipToLastQuestion}
                  disabled={isAnimating}
                  className="text-sm"
                >
                  Skip to Last Question
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={selectedOptions.length === 0 || isAnimating}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {currentIndex === onboardingQuestions.length - 1 ? 'Complete' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
