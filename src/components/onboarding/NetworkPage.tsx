import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type AITwinProfile } from '@/contexts/OnboardingContext';

interface NetworkPageProps {
  aiTwinProfile: AITwinProfile | null;
  customAITwinAvatar: string;
  onEnterConnect: () => void;
}

export default function NetworkPage({
  aiTwinProfile,
  customAITwinAvatar,
  onEnterConnect
}: NetworkPageProps) {
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

              {/* 右侧网络连接图 */}
              <div className="flex justify-center">
                <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 w-full max-w-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                    AI Twin Network Visualization
                  </h3>
                  <div className="relative w-full h-96 flex items-center justify-center">
                    {/* 中心头像 */}
                    <div className="absolute w-20 h-20 rounded-full border-4 border-purple-300 shadow-lg overflow-hidden z-20">
                      <img
                        src={aiTwinProfile?.avatar || customAITwinAvatar}
                        alt="Your AI Twin"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
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

                    {/* 环绕头像们 */}
                    {[1, 2, 3, 4].map((num) => (
                      <div 
                        key={num}
                        className="absolute w-12 h-12 rounded-full z-10"
                        style={{
                          animation: `orbit-${num === 1 ? 'inner' : num === 4 ? 'outer' : 'middle'} ${8 + num * 2}s linear infinite`,
                          transformOrigin: '192px 192px'
                        }}
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-blue-300 shadow-md overflow-hidden bg-white">
                          <img
                            src={`/avatars/${num}.png`}
                            alt={`AI Twin ${num}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
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
                    ))}

                    {/* 动态连接线 */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
                      <defs>
                        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>
                      <g stroke="url(#connectionGradient)" strokeWidth="2" fill="none">
                        <line x1="50%" y1="50%" x2="50%" y2="25%" className="animate-pulse" opacity="0.6" />
                        <line x1="50%" y1="50%" x2="75%" y2="50%" className="animate-pulse" opacity="0.6" style={{ animationDelay: '0.5s' }} />
                        <line x1="50%" y1="50%" x2="50%" y2="75%" className="animate-pulse" opacity="0.6" style={{ animationDelay: '1s' }} />
                        <line x1="50%" y1="50%" x2="25%" y2="50%" className="animate-pulse" opacity="0.6" style={{ animationDelay: '1.5s' }} />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 开始连接按钮 */}
            <div className="text-center mt-12">
              <button
                onClick={onEnterConnect}
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

