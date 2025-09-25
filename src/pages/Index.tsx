import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { isAuthenticated, shouldShowOnboarding } = useAuth();
  const navigate = useNavigate();

  // 如果用户已认证且需要显示onboarding，重定向到onboarding页面
  useEffect(() => {
    if (isAuthenticated && shouldShowOnboarding) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, shouldShowOnboarding, navigate]);

  // 如果未认证，显示登录页面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">OnlyMsg</h1>
          <p className="text-gray-600 mb-8">Share your stories and connect with others</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return <Layout />;
};

export default Index;
