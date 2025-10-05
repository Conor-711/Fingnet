import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import NetworkBackground from '@/components/NetworkBackground';
import { checkOnboardingCompleted } from '@/lib/supabase';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, user } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 如果已经登录，检查是否完成 onboarding 后再决定跳转
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (isAuthenticated && user) {
        console.log('🔍 用户已登录，检查 Onboarding 状态...');
        
        const { completed, error } = await checkOnboardingCompleted(user.id);
        
        if (error) {
          console.error('❌ 检查 Onboarding 状态失败:', error);
          // 出错时默认跳转到 onboarding
          navigate('/onboarding');
          return;
        }

        if (completed) {
          console.log('✅ Onboarding 已完成，跳转到主页');
          navigate('/main');
        } else {
          console.log('⏳ Onboarding 未完成，跳转到 onboarding');
          navigate('/onboarding');
        }
      }
    };

    checkAndRedirect();
  }, [isAuthenticated, user, navigate]);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoggingIn(true);
        
        console.log('🔑 Google OAuth成功，正在获取用户信息...');
        
        // 使用access token获取用户信息
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        const userInfo = await userInfoResponse.json();
        
        console.log('👤 获取到用户信息:', {
          email: userInfo.email,
          name: userInfo.name,
          sub: userInfo.sub
        });
        
        // 直接传递Google用户信息到login函数
        // login函数会将用户信息保存到Supabase数据库
        const loggedInUser = await login({
          sub: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        });
        
        console.log('✅ 登录完成，检查 Onboarding 状态...');
        
        // 登录成功后检查是否完成 onboarding
        if (loggedInUser) {
          const { completed } = await checkOnboardingCompleted(loggedInUser.id);
          
          if (completed) {
            console.log('✅ Onboarding 已完成，跳转到主页');
            navigate('/main');
          } else {
            console.log('⏳ Onboarding 未完成，跳转到 onboarding');
            navigate('/onboarding');
          }
        } else {
          // 如果没有返回用户信息，默认跳转到 onboarding
          navigate('/onboarding');
        }
      } catch (error) {
        console.error('❌ 登录失败:', error);
        alert(`登录失败: ${error instanceof Error ? error.message : '未知错误'}`);
        setIsLoggingIn(false);
      }
    },
    onError: (error) => {
      console.error('❌ Google OAuth失败:', error);
      alert('Google登录失败，请重试');
      setIsLoggingIn(false);
    },
  });

  const handleGetStarted = () => {
    handleGoogleLogin();
  };

  // 测试模式：创建一个临时测试用户
  const handleTestMode = async () => {
    try {
      setIsLoggingIn(true);
      
      console.log('🧪 进入测试模式...');
      
      // 创建一个模拟的测试用户
      const testUser = {
        sub: `test-user-${Date.now()}`, // 使用时间戳确保唯一性
        email: `test${Date.now()}@fingnet.dev`,
        name: 'Test User',
        picture: '/avatars/ai_friend.png'
      };
      
      console.log('👤 创建测试用户:', {
        email: testUser.email,
        name: testUser.name,
        sub: testUser.sub
      });
      
      // 使用测试用户信息登录
      await login(testUser);
      
      console.log('✅ 测试用户创建成功，跳转到onboarding...');
      
      // 跳转到onboarding
      navigate('/onboarding');
    } catch (error) {
      console.error('❌ 测试模式失败:', error);
      alert(`测试模式失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Network Background Animation */}
      <NetworkBackground />
      
      {/* Header */}
      <header className="w-full px-6 py-4 relative z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-xl font-outfit text-gray-900">
            Fingnet
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="space-y-8">
            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-outfit font-bold text-gray-900 leading-tight">
            A cleverly designed social networking system
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with like-minded individuals through intelligent AI twins that understand your Value.
            </p>

            {/* CTA Buttons */}
            <div className="pt-8 space-y-4">
              {/* Main Google Login Button */}
              <Button
                onClick={handleGetStarted}
                disabled={isLoggingIn}
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Connecting...
                  </>
                ) : (
                  <>
                    Let your Value flow
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500">
                Sign in with Google to get started
              </p>

              {/* Test Mode Button */}
              <div className="pt-4 border-t border-gray-200 mt-6">
                <Button
                  onClick={handleTestMode}
                  disabled={isLoggingIn}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
                >
                  🧪 Test Mode (Skip Google Login)
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  For testing purposes only
                </p>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 text-left">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                AI Twin Creation
              </h3>
              <p className="text-gray-600">
                Create a personalized AI twin that reflects your personality, goals, and values.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Smart Networking
              </h3>
              <p className="text-gray-600">
                Connect with others through meaningful AI-powered conversations and shared interests.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Superconnector
              </h3>
              <p className="text-gray-600">
                Let your AI twin work as your superconnector, finding and building relationships 24/7.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          © 2025 Fingnet. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
