import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type AITwinProfile } from '@/contexts/OnboardingContext';

interface SubscribePageProps {
  aiTwinProfile: AITwinProfile | null;
}

export default function SubscribePage({ aiTwinProfile }: SubscribePageProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">Unlock the full potential of {aiTwinProfile?.name || 'your AI Twin'}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Standard Plan */}
        <Card className="shadow-xl border-2 border-gray-200 hover:border-emerald-300 transition-colors">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-bold text-gray-900">Standard</CardTitle>
            <div className="mt-4">
              <span className="text-5xl font-bold text-emerald-600">$20</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Make {aiTwinProfile?.name || 'your AI Twin'} better</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">500 chat messages/month</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Priority support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Advanced {aiTwinProfile?.name || 'AI Twin'} features</span>
              </div>
            </div>
            <Button className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg">
              Choose Standard
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="shadow-xl border-2 border-emerald-400 hover:border-emerald-500 transition-colors relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-emerald-600 text-white px-4 py-1 text-sm font-semibold">
              MOST POPULAR
            </Badge>
          </div>
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-bold text-gray-900">Pro</CardTitle>
            <div className="mt-4">
              <span className="text-5xl font-bold text-emerald-600">$60</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Make {aiTwinProfile?.name || 'your AI Twin'} the best</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Unlimited chat messages</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">24/7 premium support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">All {aiTwinProfile?.name || 'AI Twin'} features</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-gray-700">Early access to new features</span>
              </div>
            </div>
            <Button className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 text-lg">
              Choose Pro
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">All plans include a 7-day free trial</p>
        <p className="text-sm text-gray-500">Cancel anytime. No hidden fees.</p>
      </div>
    </div>
  );
}

