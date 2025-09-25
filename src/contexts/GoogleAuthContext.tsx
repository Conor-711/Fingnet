import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GoogleCredentialResponse, GoogleUser } from '@/types/google-auth';
import { jwtDecode } from 'jwt-decode';

interface GoogleAuthContextType {
  isGoogleReady: boolean;
  isLoading: boolean;
  error: string | null;
  handleGoogleLogin: (response: GoogleCredentialResponse) => Promise<GoogleUser | null>;
  initializeGoogle: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | null>(null);

interface GoogleAuthProviderProps {
  children: ReactNode;
}

export const GoogleAuthProvider: React.FC<GoogleAuthProviderProps> = ({ children }) => {
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载Google Identity Services脚本
  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // 如果已经加载，直接返回
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      // 检查脚本是否已存在
      const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google script')));
        return;
      }

      // 创建并加载脚本
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // 等待一小段时间确保Google对象完全初始化
        setTimeout(() => {
          if (window.google?.accounts?.id) {
            resolve();
          } else {
            reject(new Error('Google Identity Services not available'));
          }
        }, 100);
      };
      
      script.onerror = () => reject(new Error('Failed to load Google script'));
      
      document.head.appendChild(script);
    });
  };

  // 初始化Google Identity Services
  const initializeGoogle = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === 'demo_client_id_replace_with_real_one') {
      setError('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await loadGoogleScript();

      // 初始化Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: () => {}, // 这里会被具体的登录组件覆盖
        auto_prompt: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup',
        use_fedcm_for_prompt: false,
      });

      setIsGoogleReady(true);
      console.log('✅ Google Identity Services initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Google auth';
      setError(errorMessage);
      console.error('❌ Google Identity Services initialization failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理Google登录响应
  const handleGoogleLogin = async (response: GoogleCredentialResponse): Promise<GoogleUser | null> => {
    try {
      console.log('🔑 Processing Google login response...');
      
      // 解码JWT Token
      const userInfo = jwtDecode<GoogleUser>(response.credential);
      console.log('✅ Google user info decoded:', {
        sub: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      });

      return userInfo;
    } catch (err) {
      console.error('❌ Failed to decode Google credential:', err);
      setError('Failed to process Google login');
      return null;
    }
  };

  // 组件挂载时初始化
  useEffect(() => {
    initializeGoogle();
  }, []);

  const value: GoogleAuthContextType = {
    isGoogleReady,
    isLoading,
    error,
    handleGoogleLogin,
    initializeGoogle,
  };

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

// 自定义Hook
export const useGoogleAuth = (): GoogleAuthContextType => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};
