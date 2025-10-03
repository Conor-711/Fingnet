import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { type AITwinProfile } from '@/contexts/OnboardingContext';

interface TwinAnalysisPageProps {
  twinAnalysisProgress: number;
  isAIProcessing: boolean;
  aiProcessingStep: string;
  aiTwinProfile: AITwinProfile | null;
  customAITwinName: string;
  customAITwinAvatar: string;
}

export default function TwinAnalysisPage({
  twinAnalysisProgress,
  isAIProcessing,
  aiProcessingStep,
  aiTwinProfile,
  customAITwinName,
  customAITwinAvatar
}: TwinAnalysisPageProps) {
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

