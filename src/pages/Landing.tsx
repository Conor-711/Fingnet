import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import NetworkBackground from '@/components/NetworkBackground';

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Network Background Animation */}
      <NetworkBackground />
      
      {/* Header */}
      <header className="w-full px-6 py-4 relative z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-xl font-outfit text-gray-900">
            Fingnet
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="space-y-8">
            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-outfit font-bold text-gray-900 leading-tight">
              A network that makes{' '}
              <span className="text-blue-600">AI twin</span>{' '}
              your{' '}
              <span className="text-emerald-600">Superconnector</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with like-minded individuals through intelligent AI twins that understand your Value.
            </p>

            {/* CTA Button */}
            <div className="pt-8">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Let your Value flow
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 text-left">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                AI Twin Creation
              </h3>
              <p className="text-gray-600">
                Create a personalized AI twin that reflects your personality, goals, and values.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Smart Networking
              </h3>
              <p className="text-gray-600">
                Connect with others through meaningful AI-powered conversations and shared interests.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Superconnector
              </h3>
              <p className="text-gray-600">
                Let your AI twin work as your superconnector, finding and building relationships 24/7.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          © 2025 Fingnet. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
