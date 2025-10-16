import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import NetworkBackground from '@/components/NetworkBackground';
import NetworkEvolve from '@/components/NetworkEvolve';
import { checkOnboardingCompleted } from '@/lib/supabase';
import WaitlistForm from '@/components/WaitlistForm';
import logo from '@/assets/logo/logo.png';

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
    <div className="bg-white flex flex-col relative overflow-hidden">
      {/* Network Background Animation - Full Screen */}
      <NetworkBackground />

      {/* Main Content - Full Screen Split Layout */}
      <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative z-10">
        {/* Left Side - Logo and Brand Name Only */}
        <div className="flex items-center justify-center px-8 md:px-12 lg:px-16 py-12 md:py-0">
          <div className="flex items-center gap-5">
            <img 
              src={logo} 
              alt="Fingnet Logo" 
              className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain"
            />
            <div className="text-5xl md:text-6xl lg:text-7xl font-outfit font-bold text-gray-900">
              Fingnet
            </div>
          </div>
        </div>

        {/* Right Side - Slogan and Waitlist Section */}
        <div className="flex items-center justify-center px-8 md:px-12 lg:px-16 py-12 md:py-0">
          <div className="w-full max-w-lg space-y-12">
            {/* Slogan at Top */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-outfit font-bold text-gray-900 leading-tight">
              A cleverly designed social networking system
            </h1>

            {/* Join Waitlist Module */}
            <div className="space-y-8">
              {/* Title */}
              <h2 className="text-5xl md:text-6xl font-outfit font-bold text-gray-900">
                Join today.
              </h2>

              {/* Waitlist Form */}
              <div className="space-y-6">
                <p className="text-lg text-gray-600">
                  Join our waitlist for early access.
                </p>
                <WaitlistForm />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Network Evolution Timeline */}
      <NetworkEvolve />

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-gray-100 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Slogan */}
          <div className="text-center mb-6">
            <p className="text-gray-700 text-base font-medium italic">
              "We shape other people, therefore other people will shape us"
            </p>
          </div>
          
          {/* Footer Info */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © 2025 Fingnet. All rights reserved.
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <Link 
                to="/privacy" 
                className="text-gray-500 hover:text-gray-900 text-xs underline"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-300">·</span>
              <Link 
                to="/terms" 
                className="text-gray-500 hover:text-gray-900 text-xs underline"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
