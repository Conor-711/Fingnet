import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Target, ChevronUp, ChevronDown } from 'lucide-react';
import { type AITwinProfile } from '@/contexts/OnboardingContext';

interface AITwinPageProps {
  aiTwinProfile: AITwinProfile | null;
  user: any;
  expandedFields: {
    goals: boolean;
    offers: boolean;
    lookings: boolean;
    memory: boolean;
    learnedFromUser: boolean;
  };
  toggleFieldExpansion: (field: 'goals' | 'offers' | 'lookings' | 'memory' | 'learnedFromUser') => void;
  onEditProfile: () => void;
}

export default function AITwinPage({
  aiTwinProfile,
  user,
  expandedFields,
  toggleFieldExpansion,
  onEditProfile
}: AITwinPageProps) {

  // 可折叠字段组件
  const CollapsibleField: React.FC<{
    fieldKey: 'goals' | 'offers' | 'lookings';
    items: string[];
    fallbackText: string;
  }> = ({ fieldKey, items, fallbackText }) => {
    const isExpanded = expandedFields[fieldKey];
    const displayItems = items.length > 0 ? items : [fallbackText];
    
    return (
      <div className="space-y-2">
        {displayItems.map((item, index) => {
          const shouldShow = isExpanded || index === 0;
          if (!shouldShow) return null;
          
          return (
            <div key={index} className="text-sm text-gray-700 leading-relaxed">
              <p className={!isExpanded && displayItems.length > 1 ? 'line-clamp-2' : ''}>
                {item}
              </p>
            </div>
          );
        })}
        
        {displayItems.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFieldExpansion(fieldKey)}
            className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-0 h-auto font-medium"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show More ({displayItems.length - 1} more)
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  if (!aiTwinProfile) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Profile Found</h3>
            <p className="text-gray-600">Please complete the onboarding process first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Your Profile
        </h2>
        <p className="text-gray-600">
          View and manage your personal information
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* User Profile */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">👤</span>
                <span>{user?.name || 'You'} Profile</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onEditProfile}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
              >
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* User Basic Info */}
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
              <Avatar className="w-20 h-20 ring-4 ring-white shadow-lg">
                <AvatarImage src={aiTwinProfile.userAvatar} alt={aiTwinProfile.userNickname} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                  {aiTwinProfile.userNickname?.charAt(0) || '👤'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{aiTwinProfile.userNickname || 'You'}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{aiTwinProfile.profile?.gender || 'N/A'}</span> • 
                    <span className="font-medium"> {aiTwinProfile.profile?.age || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-gray-700 font-medium">{aiTwinProfile.profile?.occupation || 'No occupation'}</p>
                  <p className="text-sm text-gray-600">📍 {aiTwinProfile.profile?.location || 'No location'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Separator />

              {/* Current Goals */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-600" />
                  Current Goals
                </h4>
                <CollapsibleField
                  fieldKey="goals"
                  items={aiTwinProfile.goals || []}
                  fallbackText={aiTwinProfile.goalRecently || 'No goals set'}
                />
              </div>

              <Separator />

              {/* What I Can Offer */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">💝</span>
                  What I Can Offer
                </h4>
                <CollapsibleField
                  fieldKey="offers"
                  items={aiTwinProfile.offers || []}
                  fallbackText={aiTwinProfile.valueOffered || 'No offers set'}
                />
              </div>

              <Separator />

              {/* What I'm Looking For */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">🌟</span>
                  What I'm Looking For
                </h4>
                <CollapsibleField
                  fieldKey="lookings"
                  items={aiTwinProfile.lookings || []}
                  fallbackText={aiTwinProfile.valueDesired || 'No lookings set'}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

