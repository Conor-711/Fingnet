import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type AITwinProfile } from '@/contexts/OnboardingContext';
import { onboardingQuestions } from '@/data/onboardingData';

interface BasicInfo {
  avatar: string;
  nickname: string;
  gender: string;
  ageRange: string;
  occupation: string;
  industry: string;
  location: string;
}

interface ConversationExtractedInfo {
  goal?: string;
  valueOffered?: string;
  valueDesired?: string;
}

interface ProfileSummaryPageProps {
  basicInfo: BasicInfo;
  conversationContext: {
    extractedInfo: ConversationExtractedInfo;
    userGoal: string;
  };
  onboardingAnswers: Record<string, string | string[]>;
  aiTwinProfile: AITwinProfile | null;
  customAITwinName: string;
  customAITwinAvatar: string;
  onContinue: () => void;
}

export default function ProfileSummaryPage({
  basicInfo,
  conversationContext,
  onboardingAnswers,
  aiTwinProfile,
  customAITwinName,
  customAITwinAvatar,
  onContinue
}: ProfileSummaryPageProps) {
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
                onClick={onContinue}
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

