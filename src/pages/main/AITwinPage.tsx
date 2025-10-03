import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Brain, Target, ChevronUp, ChevronDown } from 'lucide-react';
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
  // 获取Daily Modeling历史记录
  const getDailyModelingHistory = () => {
    if (!user) return [];
    const history = JSON.parse(localStorage.getItem(`dailyModeling_${user.id}_history`) || '[]');
    return history.slice(-10).reverse();
  };

  const dailyHistory = getDailyModelingHistory();

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
    <div className="max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          You & {aiTwinProfile?.name || 'Your AI Twin'}
        </h2>
        <p className="text-gray-600">
          Explore your profile and {aiTwinProfile?.name || 'Your AI Twin'}'s learned insights
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Side - User Profile */}
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

        {/* Right Side - AI Profile */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>{aiTwinProfile?.name || 'Your AI Twin'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* AI Twin Basic Info */}
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
              <Avatar className="w-20 h-20 ring-4 ring-white shadow-lg">
                <AvatarImage src={aiTwinProfile.avatar} alt={aiTwinProfile.name} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl">
                  🤖
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{aiTwinProfile.name || 'Your AI Twin'}</h3>
                <p className="text-sm text-gray-600 mt-1">Your intelligent digital companion</p>
                <Badge variant="outline" className="mt-2 bg-white">
                  <span className="text-emerald-600">● Active</span>
                </Badge>
              </div>
            </div>

            <div className="space-y-6">
              {/* Learned from User */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-emerald-600" />
                  Learned from User
                </h4>
                {dailyHistory.length > 0 ? (
                  <div className="space-y-3">
                    {dailyHistory.slice(0, expandedFields.learnedFromUser ? dailyHistory.length : 3).map((entry: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-emerald-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700">
                            📅 Daily Modeling
                          </Badge>
                          <span className="text-xs text-gray-500">{entry.date}</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-emerald-600 mb-1">💝 Value Offered:</p>
                            <p className="text-sm text-gray-700">{entry.answers.valueOffered}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-emerald-600 mb-1">🌟 Value Desired:</p>
                            <p className="text-sm text-gray-700">{entry.answers.valueDesired}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {dailyHistory.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFieldExpansion('learnedFromUser')}
                        className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-0 h-auto font-medium w-full"
                      >
                        {expandedFields.learnedFromUser ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Show More ({dailyHistory.length - 3} more)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No daily modeling data yet. Complete daily questions to help your AI Twin learn about you.
                  </p>
                )}
              </div>

              <Separator />

              {/* Memory */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-indigo-600" />
                  Memory
                </h4>
                {(aiTwinProfile.memories && aiTwinProfile.memories.length > 0) ? (
                  <div className="space-y-3">
                    {(expandedFields.memory 
                      ? aiTwinProfile.memories.slice().reverse() 
                      : aiTwinProfile.memories.slice().reverse().slice(0, 2)
                    ).map((memory) => (
                      <div key={memory.id} className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">
                            {memory.source === 'chat_summary' ? '💬 Chat Summary' : 
                             memory.source === 'user_input' ? '✍️ User Input' : 
                             '🤝 Conversation'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(memory.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {memory.groupName && (
                          <p className="text-xs text-indigo-600 mb-2 font-medium">
                            From: {memory.groupName}
                          </p>
                        )}
                        <p className={`text-sm text-gray-700 leading-relaxed ${!expandedFields.memory ? 'line-clamp-2' : ''}`}>
                          {memory.content}
                        </p>
                      </div>
                    ))}
                    {aiTwinProfile.memories.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFieldExpansion('memory')}
                        className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-0 h-auto font-medium w-full"
                      >
                        {expandedFields.memory ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Show More ({aiTwinProfile.memories.length - 2} more)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No memories yet. Summarize conversations to build {aiTwinProfile?.name || 'Your AI Twin'}'s memory.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

