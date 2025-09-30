import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { OnboardingAnswer, OnboardingProgress } from '@/types/post';
import { onboardingQuestions } from '@/data/onboardingData';

// Memory条目类型
export interface Memory {
  id: string;
  content: string;
  source: 'chat_summary' | 'user_input' | 'conversation';
  timestamp: string;
  groupName?: string; // 如果来自群聊，记录群聊名称
}

// AI Twin Profile数据类型
export interface AITwinProfile {
  // AI Twin基本信息
  name: string;
  avatar: string;
  // 用户档案信息
  profile: {
    gender: string;
    age: string;
    occupation: string;
    location: string;
  };
  // 支持多个goals、offers、lookings
  goals?: string[];  // 当前目标列表
  offers?: string[]; // 能提供的价值列表
  lookings?: string[]; // 寻找的价值列表
  // AI Twin记忆
  memories?: Memory[]; // 记忆列表
  // 向后兼容的单个字段
  goalRecently?: string;
  valueOffered?: string;
  valueDesired?: string;
}

interface OnboardingContextType {
  progress: OnboardingProgress;
  updateAnswer: (questionId: string, selectedOptions: string[]) => void;
  completeOnboarding: (answers: Record<string, OnboardingAnswer>) => void;
  skipOnboarding: () => void;
  isOnboardingRequired: boolean;
  resetOnboarding: () => void;
  aiTwinProfile: AITwinProfile | null;
  updateAITwinProfile: (profile: AITwinProfile) => void;
  updateAITwinBasicInfo: (name: string, avatar: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [progress, setProgress] = useState<OnboardingProgress>(() => {
    // 从localStorage恢复进度
    const saved = localStorage.getItem('onlymsg_onboarding');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // 如果解析失败，返回默认值
      }
    }

    return {
      currentStep: 0,
      totalSteps: onboardingQuestions.length,
      completedQuestions: [],
      answers: {},
      isCompleted: false
    };
  });

  // AI Twin Profile状态
  const [aiTwinProfile, setAITwinProfile] = useState<AITwinProfile | null>(() => {
    // 从localStorage恢复AI Twin Profile
    const saved = localStorage.getItem('onlymsg_ai_twin_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // 如果解析失败，返回null
      }
    }
    return null;
  });

  // 保存进度到localStorage
  const saveProgress = useCallback((newProgress: OnboardingProgress) => {
    setProgress(newProgress);
    localStorage.setItem('onlymsg_onboarding', JSON.stringify(newProgress));
  }, []);

  // 更新答案
  const updateAnswer = useCallback((questionId: string, selectedOptions: string[]) => {
    const answer: OnboardingAnswer = {
      questionId,
      selectedOptions,
      timestamp: new Date().toISOString()
    };

    const newAnswers = {
      ...progress.answers,
      [questionId]: answer
    };

    const isCompleted = Object.keys(newAnswers).length === onboardingQuestions.length;

    const newProgress: OnboardingProgress = {
      ...progress,
      answers: newAnswers,
      isCompleted,
      completedQuestions: Object.keys(newAnswers)
    };

    saveProgress(newProgress);
  }, [progress, saveProgress]);

  // 完成onboarding
  const completeOnboarding = useCallback((answers: Record<string, OnboardingAnswer>) => {
    const newProgress: OnboardingProgress = {
      ...progress,
      answers,
      isCompleted: true,
      completedQuestions: Object.keys(answers),
      currentStep: onboardingQuestions.length - 1
    };

    saveProgress(newProgress);
  }, [progress, saveProgress]);

  // 跳过onboarding
  const skipOnboarding = useCallback(() => {
    const newProgress: OnboardingProgress = {
      ...progress,
      isCompleted: true,
      completedQuestions: onboardingQuestions.map(q => q.id)
    };

    saveProgress(newProgress);
  }, [progress, saveProgress]);

  // 重置onboarding
  const resetOnboarding = useCallback(() => {
    const newProgress: OnboardingProgress = {
      currentStep: 0,
      totalSteps: onboardingQuestions.length,
      completedQuestions: [],
      answers: {},
      isCompleted: false
    };

    saveProgress(newProgress);
  }, [saveProgress]);

  // 更新AI Twin Profile
  const updateAITwinProfile = useCallback((profile: AITwinProfile) => {
    setAITwinProfile(profile);
    localStorage.setItem('onlymsg_ai_twin_profile', JSON.stringify(profile));
  }, []);

  // 更新AI Twin基本信息（名称和头像）
  const updateAITwinBasicInfo = useCallback((name: string, avatar: string) => {
    setAITwinProfile(prev => {
      const updatedProfile = prev ? {
        ...prev,
        name,
        avatar
      } : {
        name,
        avatar,
        profile: {
          gender: '',
          age: '',
          occupation: '',
          location: ''
        },
        goalRecently: '',
        valueOffered: '',
        valueDesired: ''
      };
      
      localStorage.setItem('onlymsg_ai_twin_profile', JSON.stringify(updatedProfile));
      return updatedProfile;
    });
  }, []);

  // 检查是否需要onboarding
  const isOnboardingRequired = !progress.isCompleted;

  const value: OnboardingContextType = {
    progress,
    updateAnswer,
    completeOnboarding,
    skipOnboarding,
    isOnboardingRequired,
    resetOnboarding,
    aiTwinProfile,
    updateAITwinProfile,
    updateAITwinBasicInfo
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
