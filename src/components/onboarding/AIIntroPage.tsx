import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface AIIntroPageProps {
  customAITwinName: string;
  customAITwinAvatar: string;
  onNameChange: (name: string) => void;
  onAvatarChange: (avatar: string) => void;
  onStart: () => void;
  onSkipToLast: () => void;
}

const avatarOptions = [
  { id: 'default', src: '/avatars/ai_friend.png', name: 'Default' },
  { id: 'avatar1', src: '/avatars/1.png', name: 'Avatar 1' },
  { id: 'avatar2', src: '/avatars/2.png', name: 'Avatar 2' },
  { id: 'avatar3', src: '/avatars/3.png', name: 'Avatar 3' },
  { id: 'avatar4', src: '/avatars/4.png', name: 'Avatar 4' },
];

export default function AIIntroPage({
  customAITwinName,
  customAITwinAvatar,
  onNameChange,
  onAvatarChange,
  onStart,
  onSkipToLast
}: AIIntroPageProps) {
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  const handleAvatarSelect = (avatarSrc: string) => {
    onAvatarChange(avatarSrc);
    setShowAvatarOptions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center py-8">
      <div className="w-full max-w-7xl mx-4 flex gap-8">
        {/* 左侧：AI Twin介绍 */}
        <div className="flex-1">
          <Card className="shadow-xl border-0 h-full">
            <CardContent className="p-8 text-center flex flex-col justify-center h-full">
              {/* AI伙伴头像 */}
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
                      if (fallback) fallback.style.display = 'flex';
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

              {/* 头像选择 */}
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
                        <img src={option.src} alt={option.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 名称输入 */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Give your AI Twin a name:</p>
                <Input
                  type="text"
                  placeholder="Enter AI Twin name..."
                  value={customAITwinName}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="text-center text-lg font-medium"
                  maxLength={20}
                />
              </div>

              {/* 欢迎标题 */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Hi there! I'm {customAITwinName || '?'} 👋
              </h1>

              {/* 介绍内容 */}
              <div className="text-lg text-gray-700 leading-relaxed mb-8 space-y-4">
                <p>
                  I'm <span className="font-semibold text-rose-600">{customAITwinName || 'your AI Twin'}</span>. My job is to really understand what you're aiming for.
                </p>
                <p>
                  And the cool part? I'll also grow and get smarter through the connections you make.
                </p>
              </div>

              {/* 按钮 */}
              <div className="space-y-4">
                <button
                  onClick={onStart}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {customAITwinName.trim() ? `Let's Get Started with ${customAITwinName}! 🚀` : "Let's Get Started! 🚀"}
                </button>
                
                <button
                  onClick={onSkipToLast}
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

        {/* 右侧：流程展示 */}
        <div className="w-96">
          <Card className="shadow-xl border-0 h-full bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Share with {customAITwinName || 'your AI Twin'}
              </h2>

              <div className="space-y-6">
                {/* Step 1 */}
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
                  <div className="flex justify-center py-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Step 2 */}
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
                  <div className="flex justify-center py-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Step 3 */}
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

