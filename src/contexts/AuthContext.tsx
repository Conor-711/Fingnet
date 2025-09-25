import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, LoginRequest, RegisterRequest, AuthState } from '@/types/auth';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { OnboardingAnswer } from '@/types/post';

// 认证Action类型
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_ONBOARDING_ANSWERS'; payload: Record<string, OnboardingAnswer> }
  | { type: 'SET_SHOULD_SHOW_ONBOARDING'; payload: boolean };

// 认证Context类型
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  clearError: () => void;
  // Onboarding相关
  onboardingAnswers?: Record<string, OnboardingAnswer>;
  updateOnboardingAnswers: (answers: Record<string, OnboardingAnswer>) => void;
  shouldShowOnboarding: boolean;
}

// 初始状态
const initialState: AuthState & {
  onboardingAnswers?: Record<string, OnboardingAnswer>;
  shouldShowOnboarding: boolean;
} = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  onboardingAnswers: undefined,
  shouldShowOnboarding: false,
};

// Reducer函数
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS': {
      // 检查是否需要显示onboarding（新用户或未完成onboarding的用户）
      const savedOnboarding = localStorage.getItem('onlymsg_onboarding');
      const shouldShowOnboarding = !savedOnboarding || (() => {
        try {
          const parsed = JSON.parse(savedOnboarding);
          return !parsed.isCompleted;
        } catch {
          return true; // 如果解析失败，也显示onboarding
        }
      })();

      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
        error: null,
        shouldShowOnboarding,
      };
    }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      };
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_ONBOARDING_ANSWERS':
      return {
        ...state,
        onboardingAnswers: action.payload,
      };
    case 'SET_SHOULD_SHOW_ONBOARDING':
      return {
        ...state,
        shouldShowOnboarding: action.payload,
      };
    default:
      return state;
  }
}

// 创建Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider组件
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();

  // 从localStorage恢复会话
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // 检查token是否为损坏的数据
          if (token.includes('¢') || token.includes('Ü') || token.includes('µ') || !token.includes('.')) {
            console.warn('⚠️ 检测到损坏的token数据，正在清理...');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            dispatch({ type: 'LOGOUT' });
            return;
          }
          
          console.log('🔍 验证存储的认证token...');
          const user = await mockApi.auth.validateToken(token);
          if (user) {
            console.log('✅ Token验证成功，恢复用户会话:', user.email);
            dispatch({ type: 'RESTORE_SESSION', payload: user });
          } else {
            console.warn('⚠️ Token验证失败，清除会话数据');
            // Token无效，清除
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          console.log('📝 未找到存储的token，保持登出状态');
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('❌ 会话恢复失败:', error);
        // 清理所有认证相关的存储数据
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        dispatch({ type: 'LOGOUT' });
      }
    };

    restoreSession();
  }, []);

  // 登录函数
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await mockApi.auth.login(credentials);
      
      // 存储tokens
      localStorage.setItem('auth_token', response.tokens.accessToken);
      localStorage.setItem('refresh_token', response.tokens.refreshToken);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${response.user.displayName}!`,
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return false;
    }
  };

  // 注册函数
  const register = async (userData: RegisterRequest): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await mockApi.auth.register(userData);
      
      // 存储tokens
      localStorage.setItem('auth_token', response.tokens.accessToken);
      localStorage.setItem('refresh_token', response.tokens.refreshToken);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
      
      toast({
        title: 'Registration successful',
        description: `Welcome to OnlyText, ${response.user.displayName}!`,
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return false;
    }
  };

  // 登出函数
  const logout = async () => {
    try {
      console.log('🚪 用户登出...');
      // 这里可以添加服务器端登出逻辑，但目前只是客户端清理
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 清除本地存储
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      dispatch({ type: 'LOGOUT' });
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    }
  };

  // 更新用户信息
  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    // 同时更新localStorage中的用户数据
    localStorage.setItem('user_data', JSON.stringify(user));
  };

  // 清除错误
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // 更新onboarding答案
  const updateOnboardingAnswers = (answers: Record<string, OnboardingAnswer>) => {
    dispatch({ type: 'SET_ONBOARDING_ANSWERS', payload: answers });
  };

  // 设置是否显示onboarding
  const setShouldShowOnboarding = (shouldShow: boolean) => {
    dispatch({ type: 'SET_SHOULD_SHOW_ONBOARDING', payload: shouldShow });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    updateOnboardingAnswers,
    shouldShowOnboarding: state.shouldShowOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
