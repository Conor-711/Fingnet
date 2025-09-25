import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { OnboardingAnswer, OnboardingProgress } from '@/types/post';
import { onboardingQuestions } from '@/data/onboardingData';

interface OnboardingContextType {
  progress: OnboardingProgress;
  updateAnswer: (questionId: string, selectedOptions: string[]) => void;
  completeOnboarding: (answers: Record<string, OnboardingAnswer>) => void;
  skipOnboarding: () => void;
  isOnboardingRequired: boolean;
  resetOnboarding: () => void;
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

  // 检查是否需要onboarding
  const isOnboardingRequired = !progress.isCompleted;

  const value: OnboardingContextType = {
    progress,
    updateAnswer,
    completeOnboarding,
    skipOnboarding,
    isOnboardingRequired,
    resetOnboarding
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
