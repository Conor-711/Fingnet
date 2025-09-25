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
  getPreviousQuestion
} from '@/data/onboardingData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete?: (answers: Record<string, OnboardingAnswer>) => void;
  onSkip?: () => void;
}

export const Onboarding = ({ onComplete, onSkip }: OnboardingProps) => {
  const [currentQuestionId, setCurrentQuestionId] = useState(onboardingQuestions[0]?.id || '');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const { updateOnboardingAnswers, completeOnboarding, skipOnboarding } = useAuth();

  const currentQuestion = getQuestionById(currentQuestionId);
  const currentIndex = onboardingQuestions.findIndex(q => q.id === currentQuestionId);
  const progress = ((currentIndex + 1) / onboardingQuestions.length) * 100;

  // 处理选项选择
  const handleOptionSelect = useCallback((optionId: string) => {
    if (!currentQuestion) return;

    if (currentQuestion.type === 'single-choice') {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev => {
        if (prev.includes(optionId)) {
          return prev.filter(id => id !== optionId);
        } else {
          return [...prev, optionId];
        }
      });
    }
  }, [currentQuestion]);

  // 处理下一题
  const handleNext = useCallback(async () => {
    if (!currentQuestion || selectedOptions.length === 0) return;

    setIsAnimating(true);

    // 保存当前问题的答案
    const answer: OnboardingAnswer = {
      questionId: currentQuestion.id,
      selectedOptions,
      timestamp: new Date().toISOString()
    };

    // 更新AuthContext中的答案
    updateOnboardingAnswers({
      [currentQuestion.id]: answer
    });

    // 获取下一题
    const nextQuestion = getNextQuestion(currentQuestion.id);

    // 动画延迟后跳转
    setTimeout(() => {
      if (nextQuestion) {
        setCurrentQuestionId(nextQuestion.id);
        setSelectedOptions([]);
      } else {
        // 完成onboarding
        const finalAnswers = {
          [currentQuestion.id]: answer
        };

        if (onComplete) {
          onComplete(finalAnswers);
        } else {
          // 使用AuthContext完成onboarding
          completeOnboarding(finalAnswers);
          navigate('/');
        }
      }
      setIsAnimating(false);
    }, 300);
  }, [currentQuestion, selectedOptions, updateOnboardingAnswers, completeOnboarding, onComplete, navigate]);

  // 处理上一题
  const handlePrevious = useCallback(() => {
    const prevQuestion = getPreviousQuestion(currentQuestionId);

    if (prevQuestion) {
      setIsAnimating(true);

      setTimeout(() => {
        setCurrentQuestionId(prevQuestion.id);
        // 从AuthContext中恢复之前选择的答案
        // 注意：这个需要通过props从父组件传递答案数据
        setSelectedOptions([]);
        setIsAnimating(false);
      }, 300);
    }
  }, [currentQuestionId]);

  // 键盘导航
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && selectedOptions.length > 0 && !isAnimating) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && getPreviousQuestion(currentQuestionId)) {
        handlePrevious();
      } else if (e.key === 'ArrowRight' && selectedOptions.length > 0 && !isAnimating) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedOptions, isAnimating, currentQuestionId, handleNext, handlePrevious]);

  // 防止在动画期间操作
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentIndex + 1} of {onboardingQuestions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {currentQuestion.title}
            </CardTitle>
            {currentQuestion.subtitle && (
              <CardDescription className="text-lg text-gray-600">
                {currentQuestion.subtitle}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedOptions.includes(option.id)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  {option.avatar && (
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-16 h-16 rounded-full ${option.avatar.bgColor} flex items-center justify-center text-2xl`}>
                        {option.avatar.src}
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {option.label}
                    </h3>
                    {option.description && (
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    )}
                  </div>

                  {selectedOptions.includes(option.id) && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!getPreviousQuestion(currentQuestionId)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Press Enter or →</span>
          </div>

          <Button
            onClick={handleNext}
            disabled={selectedOptions.length === 0}
            className="flex items-center gap-2"
          >
            {getNextQuestion(currentQuestionId) ? 'Next' : 'Complete'}
            {getNextQuestion(currentQuestionId) ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              if (onSkip) {
                onSkip();
              } else {
                skipOnboarding();
                navigate('/');
              }
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip onboarding
          </Button>
        </div>
      </div>
    </div>
  );
};
