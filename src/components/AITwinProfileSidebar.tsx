import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Brain, Target, ChevronUp, ChevronDown, ChevronLeft } from 'lucide-react';
import { type AITwinProfile } from '@/contexts/OnboardingContext';

interface AITwinProfileSidebarProps {
  aiTwinProfile: AITwinProfile | null;
  user: any;
}

export default function AITwinProfileSidebar({ aiTwinProfile, user }: AITwinProfileSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedFields, setExpandedFields] = useState({
    memory: false,
    learnedFromUser: false
  });

  // 获取Daily Modeling历史记录
  const getDailyModelingHistory = () => {
    if (!user) return [];
    const history = JSON.parse(localStorage.getItem(`dailyModeling_${user.id}_history`) || '[]');
    return history.slice(-10).reverse();
  };

  const dailyHistory = getDailyModelingHistory();

  const toggleFieldExpansion = (field: 'memory' | 'learnedFromUser') => {
    setExpandedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!aiTwinProfile) {
    return null;
  }

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-[400px] bg-gradient-to-br from-emerald-50 to-teal-50 shadow-2xl border-l border-emerald-200 transition-transform duration-300 ease-in-out z-40 ${
        isExpanded ? 'translate-x-0' : 'translate-x-[360px]'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* 左侧手柄 */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-8 rounded-l-lg shadow-lg cursor-pointer flex flex-col items-center space-y-2">
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          <Brain className="w-5 h-5" />
          <div className="text-xs font-medium vertical-text">{aiTwinProfile?.name || 'Your AI Twin'}</div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="h-full overflow-y-auto p-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>{aiTwinProfile?.name || 'Your AI Twin'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* AI Twin Basic Info */}
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
              <Avatar className="w-16 h-16 ring-4 ring-white shadow-lg">
                <AvatarImage src={aiTwinProfile.avatar} alt={aiTwinProfile.name} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl">
                  🤖
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{aiTwinProfile.name || 'Your AI Twin'}</h3>                <Badge variant="outline" className="mt-2 bg-white">
                  <span className="text-emerald-600">● Active</span>
                </Badge>
              </div>
            </div>

            <div className="space-y-6">
              {/* Learned from User */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-emerald-600" />
                  Learned from {user?.name || 'You'}
                </h4>
                {dailyHistory.length > 0 ? (
                  <div className="space-y-3">
                    {dailyHistory.slice(0, expandedFields.learnedFromUser ? dailyHistory.length : 2).map((entry: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700">
                            📅 Daily Modeling
                          </Badge>
                          <span className="text-xs text-gray-500">{entry.date}</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-emerald-600 mb-1">💝 Value Offered:</p>
                            <p className="text-xs text-gray-700 line-clamp-2">{entry.answers.valueOffered}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-emerald-600 mb-1">🌟 Value Desired:</p>
                            <p className="text-xs text-gray-700 line-clamp-2">{entry.answers.valueDesired}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {dailyHistory.length > 2 && (
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
                            Show More ({dailyHistory.length - 2} more)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
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
                      <div key={memory.id} className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
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
                        <p className={`text-xs text-gray-700 leading-relaxed ${!expandedFields.memory ? 'line-clamp-2' : ''}`}>
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
                  <p className="text-xs text-gray-500 italic">
                    No memories yet. Summarize conversations to build {aiTwinProfile?.name || 'Your AI Twin'}'s memory.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSS for vertical text */}
      <style>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  );
}

