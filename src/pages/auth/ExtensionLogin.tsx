import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * 扩展专用登录页
 * 路径: /auth/extension-login
 * 
 * 功能:
 * 1. 检测请求来源（是否从插件打开）
 * 2. 检查当前登录状态
 * 3. 已登录 → 直接跳转 callback
 * 4. 未登录 → 触发 Google OAuth
 */
export default function ExtensionLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'redirecting' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleExtensionLogin = async () => {
      try {
        // 1. 验证来源（兼容两种参数格式）
        const source = searchParams.get('source');
        const extensionId = searchParams.get('ext_id') || searchParams.get('extension_id');

        console.log('🔍 Extension Login - Source:', source, 'Extension ID:', extensionId);

        // 检查是否从插件访问（兼容两种方式）
        const isFromExtension = source === 'extension' || extensionId;

        // 如果不是从插件访问，重定向到普通登录页
        if (!isFromExtension) {
          console.log('⚠️ 非插件访问，重定向到首页');
          navigate('/');
          return;
        }

        // 2. 检查登录状态
        console.log('🔐 检查当前登录状态...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ 获取 session 失败:', sessionError);
          throw new Error('Failed to check login status');
        }

        if (session) {
          // 已登录，直接跳转到 callback
          console.log('✅ 用户已登录，跳转到 callback');
          setStatus('redirecting');
          const callbackUrl = `/auth/extension-callback?ext_id=${extensionId || ''}`;
          navigate(callbackUrl);
        } else {
          // 未登录，触发 Google OAuth
          console.log('🔑 用户未登录，触发 Google OAuth');
          setStatus('redirecting');

          const redirectUrl = `${window.location.origin}/auth/extension-callback?ext_id=${extensionId || ''}`;
          
          const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              }
            }
          });

          if (oauthError) {
            console.error('❌ OAuth 失败:', oauthError);
            throw new Error('Failed to start OAuth flow');
          }
        }
      } catch (error) {
        console.error('❌ Extension Login 错误:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      }
    };

    handleExtensionLogin();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Connecting to Fingnet
        </h1>

        {/* Status Messages */}
        {status === 'checking' && (
          <>
            <p className="text-gray-600 mb-6">
              Checking your login status...
            </p>
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          </>
        )}

        {status === 'redirecting' && (
          <>
            <p className="text-gray-600 mb-6">
              Redirecting to authentication...
            </p>
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2">Connection Failed</p>
              <p className="text-gray-600 text-sm">{errorMessage}</p>
            </div>
            <button
              onClick={() => window.close()}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
            >
              Close Window
            </button>
          </>
        )}

        {/* Connection Animation */}
        {(status === 'checking' || status === 'redirecting') && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-150"></div>
          </div>
        )}
      </div>
    </div>
  );
}
