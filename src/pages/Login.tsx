import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { GoogleAuthDebug } from '@/components/GoogleAuthDebug';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequest } from '@/types/auth';
import { testAccounts } from '@/lib/mockData';

// 表单验证schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTestAccount, setSelectedTestAccount] = useState<number | null>(null);

  // 如果已经登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 表单设置
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 清除错误当输入改变时
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, []);

  // 提交表单
  const onSubmit = async (data: LoginFormData) => {
    const loginData: LoginRequest = {
      email: data.email,
      password: data.password,
    };
    const success = await login(loginData);
    if (success) {
      navigate('/', { replace: true });
    }
  };

  // 使用测试账号登录
  const useTestAccount = (index: number) => {
    const account = testAccounts[index];
    setValue('email', account.email);
    setValue('password', account.password);
    setSelectedTestAccount(index);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-xl">O</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your OnlyText account</p>
        </div>

        {/* Test Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🧪 Test Accounts</CardTitle>
            <CardDescription className="text-xs">
              Click to use pre-filled test credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {testAccounts.map((account, index) => (
              <Button
                key={account.email}
                variant={selectedTestAccount === index ? "default" : "outline"}
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => useTestAccount(index)}
              >
                <img 
                  src={account.user.avatar} 
                  alt={account.user.displayName}
                  className="w-5 h-5 rounded-full"
                />
                <div className="text-left">
                  <div className="font-medium">{account.user.displayName}</div>
                  <div className="text-muted-foreground">@{account.user.username}</div>
                </div>
                {account.user.verified && (
                  <div className="ml-auto w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                )}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Separator />

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Google Login Section */}
            <div className="space-y-4">
              <GoogleLoginButton 
                text="signin_with"
                size="large"
                onSuccess={() => {
                  console.log('Google login successful');
                }}
                onError={(errorMessage) => {
                  console.error('Google login error:', errorMessage);
                  // Google登录错误会在GoogleLoginButton内部处理
                }}
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>
          </CardContent>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-0">
              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link 
                    to="/forgot-password" 
                    className="text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Google Auth Debug Component - 开发时使用 */}
        {import.meta.env.VITE_DEV_MODE === 'true' && (
          <GoogleAuthDebug />
        )}
      </div>
    </div>
  );
};

export default Login;
