import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getOrCreateUser, type User as SupabaseUser } from '@/lib/supabase';

// 扩展User类型，包含Supabase的id
export interface User {
  id: string; // Supabase user UUID
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
  google_id: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (googleUserInfo: { sub: string; email: string; name: string; picture: string }) => Promise<User | null>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从Supabase和localStorage恢复会话
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 先检查localStorage
        const storedUser = localStorage.getItem('onlymsg_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('✅ 从localStorage恢复用户会话:', parsedUser.email);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('onlymsg_user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (googleUserInfo: { sub: string; email: string; name: string; picture: string }): Promise<User | null> => {
    try {
      console.log('🔐 开始登录流程...', googleUserInfo.email);

      // 在Supabase中获取或创建用户记录
      const { user: dbUser, error } = await getOrCreateUser({
        sub: googleUserInfo.sub,
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        picture: googleUserInfo.picture
      });

      if (error) {
        console.error('❌ 数据库操作失败:', error);
        throw new Error(`Failed to save user to database: ${error.message}`);
      }

      if (!dbUser) {
        throw new Error('Failed to create user in database');
      }

      console.log('✅ 用户信息已保存到数据库:', {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name
      });

      // 构建用户对象
      const user: User = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || '',
        picture: dbUser.picture || '',
        sub: dbUser.google_id,
        google_id: dbUser.google_id
      };

      // 保存到状态和localStorage
      setUser(user);
      localStorage.setItem('onlymsg_user', JSON.stringify(user));

      console.log('✅ 登录成功！用户信息已保存');

      return user; // 返回用户对象

    } catch (error) {
      console.error('❌ 登录失败:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('👋 用户登出...');
      
      // 只清除用户会话信息，不删除 onboarding 和 AI Twin 数据
      // 因为这些数据存储在数据库中，下次登录时会自动恢复
      setUser(null);
      localStorage.removeItem('onlymsg_user');

      console.log('✅ 登出成功');
    } catch (error) {
      console.error('❌ 登出失败:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

