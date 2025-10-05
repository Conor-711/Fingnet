import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * 扩展回调页
 * 路径: /auth/extension-callback
 * 
 * 功能:
 * 1. 接收 Supabase OAuth 回调
 * 2. 获取 session 和用户信息
 * 3. 判断是否首次登录（是否需要 onboarding）
 * 4. 通过 postMessage 安全地传递数据给插件
 * 5. 显示成功提示并自动关闭
 */
export default function ExtensionCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing login...');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Extension Callback - 开始处理...');

        // 1. 获取 session（Supabase 会自动处理 OAuth 回调）
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ 获取 session 失败:', sessionError);
          throw new Error('Failed to get session');
        }

        if (!session) {
          console.error('❌ Session 不存在');
          throw new Error('No session found');
        }

        console.log('✅ Session 获取成功:', {
          userId: session.user.id,
          email: session.user.email
        });

        // 2. 查询用户资料
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('❌ 查询用户资料失败:', profileError);
          throw new Error('Failed to fetch user profile');
        }

        // 3. 判断是否首次登录
        const isFirstLogin = !userProfile;
        console.log('🔍 首次登录?', isFirstLogin);

        let finalProfile = userProfile;

        if (isFirstLogin) {
          // 首次登录，创建用户记录
          console.log('📝 创建新用户记录...');
          
          const newUser = {
            id: session.user.id,
            google_id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || 
                  session.user.user_metadata?.name || 
                  session.user.email?.split('@')[0] || 
                  'User',
            picture: session.user.user_metadata?.avatar_url || 
                    session.user.user_metadata?.picture || 
                    null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert(newUser)
            .select()
            .single();

          if (createError) {
            console.error('❌ 创建用户失败:', createError);
            throw createError;
          }

          console.log('✅ 用户创建成功:', createdUser);
          finalProfile = createdUser;
        }

        // 4. 检查是否完成 onboarding
        const { data: onboardingData } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        const needsOnboarding = !onboardingData || !onboardingData.completed;
        console.log('🎯 需要 Onboarding?', needsOnboarding);

        // 5. 查询 AI Twin（如果存在）
        let aiTwin = null;
        if (!needsOnboarding) {
          const { data: aiTwinData } = await supabase
            .from('ai_twins')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (aiTwinData) {
            aiTwin = {
              id: aiTwinData.id,
              name: aiTwinData.name,
              avatar: aiTwinData.avatar
            };
            console.log('✅ AI Twin 数据:', aiTwin);
          }
        }

        // 6. 构建要发送的数据
        const payload = {
          type: 'FINGNET_AUTH_SUCCESS',
          timestamp: Date.now(),
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            expires_in: session.expires_in,
            user: {
              id: session.user.id,
              email: session.user.email,
              user_metadata: session.user.user_metadata
            }
          },
          profile: finalProfile,
          aiTwin: aiTwin,
          needsOnboarding,
          isFirstLogin
        };

        console.log('📤 准备发送数据给插件:', {
          userId: payload.session.user.id,
          needsOnboarding: payload.needsOnboarding,
          isFirstLogin: payload.isFirstLogin,
          hasAITwin: !!payload.aiTwin
        });

        // 7. 发送消息给插件
        if (window.opener) {
          // 发送到所有可能的 origin（插件和本地开发）
          window.opener.postMessage(payload, '*');
          console.log('✅ 消息已发送给插件');

          setStatus('success');
          setMessage('Login successful! This window will close automatically...');

          // 开始倒计时
          let count = 3;
          const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count <= 0) {
              clearInterval(timer);
              window.close();
            }
          }, 1000);
        } else {
          console.warn('⚠️ 没有 window.opener，可能是直接访问');
          setStatus('error');
          setMessage('This page should be opened from the extension.');
        }

      } catch (error) {
        console.error('❌ Callback 处理失败:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Login failed. Please try again.');

        // 发送错误消息给插件
        if (window.opener) {
          window.opener.postMessage({
            type: 'FINGNET_AUTH_ERROR',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, '*');
        }
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Loading State */}
        {status === 'loading' && (
          <>
            <div className="mb-6">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Login
            </h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Login Successful!
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {countdown}
              </div>
              <p className="text-sm text-gray-500">
                Closing in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            </div>
            <button
              onClick={() => window.close()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Close Now
            </button>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Login Failed
              </h2>
              <p className="text-gray-600">{message}</p>
            </div>
            <button
              onClick={() => window.close()}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
            >
              Close Window
            </button>
          </>
        )}

        {/* Decorative Elements */}
        {status === 'loading' && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-150"></div>
          </div>
        )}
      </div>
    </div>
  );
}
