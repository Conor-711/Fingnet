import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { generateDailyModelingQuestions, integrateDailyModelingAnswers } from '@/services/aiService';
import { type AITwinProfile } from '@/contexts/OnboardingContext';

interface DailyQuestion {
  question: string;
  type: 'valueOffered' | 'valueDesired';
}

export function useDailyModeling(
  userId: string | undefined,
  aiTwinProfile: AITwinProfile | null,
  updateAITwinProfile: (profile: AITwinProfile) => void
) {
  const [showDailyModeling, setShowDailyModeling] = useState(false);
  const [dailyQuestions, setDailyQuestions] = useState<{
    valueOfferedQuestion: string;
    valueDesiredQuestion: string;
  } | null>(null);
  const [currentDailyQuestion, setCurrentDailyQuestion] = useState<0 | 1>(0);
  const [dailyAnswers, setDailyAnswers] = useState<{
    valueOffered: string;
    valueDesired: string;
  }>({ valueOffered: '', valueDesired: '' });
  const [dailyInputValue, setDailyInputValue] = useState('');
  const [isLoadingDailyQuestions, setIsLoadingDailyQuestions] = useState(false);
  const [isProcessingDailyAnswer, setIsProcessingDailyAnswer] = useState(false);

  // 获取当前日期（考虑测试日期覆盖）
  const getCurrentDate = () => {
    if (!userId) return new Date().toDateString();
    const testDate = localStorage.getItem(`dailyModeling_testDate`);
    if (testDate) {
      const date = new Date(testDate);
      return date.toDateString();
    }
    return new Date().toDateString();
  };

  // 检查并初始化Daily Modeling
  const checkAndInitializeDailyModeling = async () => {
    if (!userId || !aiTwinProfile) return;

    const today = getCurrentDate();
    const lastCompletionDate = localStorage.getItem(`dailyModeling_${userId}_lastCompletion`);

    // 如果今天还没完成，显示Daily Modeling
    if (lastCompletionDate !== today) {
      setIsLoadingDailyQuestions(true);
      try {
        const questions = await generateDailyModelingQuestions({
          name: aiTwinProfile.userNickname || 'User',
          occupation: aiTwinProfile.profile?.occupation || '',
          age: aiTwinProfile.profile?.age || '',
          location: aiTwinProfile.profile?.location || '',
          recentGoal: aiTwinProfile.goalRecently || '',
          previousOffered: aiTwinProfile.valueOffered || '',
          previousDesired: aiTwinProfile.valueDesired || ''
        });

        setDailyQuestions(questions);
        setShowDailyModeling(true);
        setCurrentDailyQuestion(0);
      } catch (error) {
        console.error('Failed to generate daily questions:', error);
        toast.error('Failed to generate daily questions');
      } finally {
        setIsLoadingDailyQuestions(false);
      }
    }
  };

  // 处理Daily Modeling答案提交
  const handleDailyAnswerSubmit = async () => {
    if (!dailyInputValue.trim() || !userId || !aiTwinProfile || !dailyQuestions) return;

    setIsProcessingDailyAnswer(true);
    try {
      const questionType = currentDailyQuestion === 0 ? 'valueOffered' : 'valueDesired';
      
      // 保存答案
      setDailyAnswers(prev => ({
        ...prev,
        [questionType]: dailyInputValue.trim()
      }));

      // 如果是第一个问题，进入第二个问题
      if (currentDailyQuestion === 0) {
        setCurrentDailyQuestion(1);
        setDailyInputValue('');
      } else {
        // 如果是第二个问题，完成并集成答案
        const finalAnswers = {
          valueOffered: dailyAnswers.valueOffered,
          valueDesired: dailyInputValue.trim()
        };

        // 调用AI服务集成答案
        const updatedProfile = await integrateDailyModelingAnswers(
          aiTwinProfile,
          finalAnswers
        );

        // 更新profile
        updateAITwinProfile(updatedProfile);

        // 保存历史记录
        const today = getCurrentDate();
        const history = JSON.parse(
          localStorage.getItem(`dailyModeling_${userId}_history`) || '[]'
        );
        history.push({
          date: today,
          questions: {
            valueOffered: dailyQuestions.valueOfferedQuestion,
            valueDesired: dailyQuestions.valueDesiredQuestion
          },
          answers: finalAnswers
        });
        localStorage.setItem(`dailyModeling_${userId}_history`, JSON.stringify(history));

        // 标记今天已完成
        localStorage.setItem(`dailyModeling_${userId}_lastCompletion`, today);

        // 隐藏模块
        setTimeout(() => {
          setShowDailyModeling(false);
          setDailyQuestions(null);
          setCurrentDailyQuestion(0);
          setDailyAnswers({ valueOffered: '', valueDesired: '' });
          setDailyInputValue('');
          toast.success('Daily modeling completed! Your AI Twin has learned more about you.');
        }, 500);
      }
    } catch (error) {
      console.error('Failed to process daily answer:', error);
      toast.error('Failed to process your answer');
    } finally {
      setIsProcessingDailyAnswer(false);
    }
  };

  // 测试功能：跳到下一天
  const handleTestNextDay = () => {
    const testDate = localStorage.getItem(`dailyModeling_testDate`);
    let nextDate: Date;
    
    if (testDate) {
      nextDate = new Date(testDate);
      nextDate.setDate(nextDate.getDate() + 1);
    } else {
      nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    localStorage.setItem(`dailyModeling_testDate`, nextDate.toISOString());
    
    // 重置Daily Modeling状态
    setShowDailyModeling(false);
    setDailyQuestions(null);
    setCurrentDailyQuestion(0);
    setDailyAnswers({ valueOffered: '', valueDesired: '' });
    setDailyInputValue('');
    
    toast.success(`Test date advanced to ${nextDate.toDateString()}`);
    
    // 重新初始化
    setTimeout(() => {
      checkAndInitializeDailyModeling();
    }, 1000);
  };

  // 重置测试日期
  const handleResetTestDate = () => {
    localStorage.removeItem(`dailyModeling_testDate`);
    toast.success('Test date reset to today');
    
    // 重新初始化
    setTimeout(() => {
      checkAndInitializeDailyModeling();
    }, 500);
  };

  // 当用户和profile加载完成时，延迟2秒初始化Daily Modeling
  useEffect(() => {
    if (userId && aiTwinProfile) {
      const timer = setTimeout(() => {
        checkAndInitializeDailyModeling();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [userId, aiTwinProfile]);

  return {
    showDailyModeling,
    dailyQuestions,
    currentDailyQuestion,
    dailyAnswers,
    dailyInputValue,
    isLoadingDailyQuestions,
    isProcessingDailyAnswer,
    setDailyInputValue,
    handleDailyAnswerSubmit,
    handleTestNextDay,
    handleResetTestDate,
    checkAndInitializeDailyModeling
  };
}

