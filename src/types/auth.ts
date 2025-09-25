// 用户数据类型
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  bio?: string;
  website?: string;
  location?: string;
  verified: boolean;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
  // Google认证相关字段
  googleId?: string;
  isGoogleAuth?: boolean;
}

// 认证令牌
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// JWT负载
export interface JWTPayload {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}

// 登录请求
export interface LoginRequest {
  email: string;
  password: string;
  // Google认证相关字段
  isGoogleAuth?: boolean;
  googleUser?: {
    sub: string;
    email: string;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
  };
}

// 注册请求
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

// 用户Profile更新请求
export interface UpdateProfileRequest {
  displayName?: string;
  username?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatar?: string; // 头像URL或base64
}

// 头像上传请求
export interface AvatarUploadRequest {
  file: File;
  userId: string;
}

// 头像上传响应
export interface AvatarUploadResponse {
  avatarUrl: string;
  message: string;
}

// 认证响应
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// 认证错误
export interface AuthError {
  message: string;
  field?: string;
}

// 认证状态
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  // Onboarding相关
  onboardingAnswers?: Record<string, unknown>;
  shouldShowOnboarding: boolean;
}
