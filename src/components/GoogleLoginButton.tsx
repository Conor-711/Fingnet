import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleCredentialResponse } from '@/types/google-auth';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  size?: 'large' | 'medium' | 'small';
  className?: string;
  disabled?: boolean;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  text = 'signin_with',
  size = 'large',
  className = '',
  disabled = false,
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isGoogleReady, isLoading, error, handleGoogleLogin } = useGoogleAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 处理Google登录回调
  const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
    if (disabled || isProcessing) return;

    try {
      setIsProcessing(true);
      console.log('🚀 Starting Google authentication process...');

      // 解码Google用户信息
      const googleUser = await handleGoogleLogin(response);
      if (!googleUser) {
        throw new Error('Failed to process Google authentication');
      }

      // 直接使用Mock API进行Google认证
      const success = await login({
        email: googleUser.email,
        password: '', // Google登录不需要密码
        isGoogleAuth: true,
        googleUser: googleUser,
      });

      if (success) {
        console.log('✅ Google authentication successful');
        onSuccess?.();
        navigate('/', { replace: true });
      } else {
        throw new Error('Failed to login with Google account');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      console.error('❌ Google authentication error:', err);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // 渲染Google按钮
  useEffect(() => {
    if (!isGoogleReady || !buttonRef.current || disabled) return;

    try {
      // 清空之前的内容
      buttonRef.current.innerHTML = '';

      // 初始化Google按钮的回调
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_prompt: false,
      });

      // 渲染Google登录按钮
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        size: size,
        text: text,
        theme: 'outline',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '100%',
      });

      console.log('✅ Google login button rendered');
    } catch (err) {
      console.error('❌ Failed to render Google button:', err);
      onError?.('Failed to initialize Google login button');
    }
  }, [isGoogleReady, text, size, disabled]);

  // 如果Google服务未准备好，显示加载状态
  if (isLoading) {
    return (
      <Button disabled className={`w-full ${className}`}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading Google...
      </Button>
    );
  }

  // 如果有错误，显示错误状态
  if (error) {
    return (
      <Button disabled variant="outline" className={`w-full ${className}`}>
        <span className="text-red-500">Google Auth Error</span>
      </Button>
    );
  }

  // 如果正在处理登录，显示处理状态
  if (isProcessing) {
    return (
      <Button disabled className={`w-full ${className}`}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Signing in...
      </Button>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div ref={buttonRef} className="w-full" />
      {disabled && (
        <div className="absolute inset-0 bg-background/50 cursor-not-allowed rounded" />
      )}
    </div>
  );
};
