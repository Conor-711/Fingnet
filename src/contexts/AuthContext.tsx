import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credential: string) => Promise<void>;
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

  // 从localStorage加载用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem('onlymsg_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('onlymsg_user');
      }
    }
    setIsLoading(false);
  }, []);

  // 解码Google JWT token
  const decodeJWT = (token: string): User => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  const login = async (credential: string) => {
    try {
      // 解码Google返回的JWT token
      const userData = decodeJWT(credential);
      
      const user: User = {
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        sub: userData.sub
      };

      // 保存用户信息
      setUser(user);
      localStorage.setItem('onlymsg_user', JSON.stringify(user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('onlymsg_user');
    localStorage.removeItem('onlymsg_onboarding');
    localStorage.removeItem('onlymsg_ai_twin_profile');
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

