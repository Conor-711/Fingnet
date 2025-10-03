import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Sparkles } from 'lucide-react';
import AITwinConnectionAnimation from '@/components/AITwinConnectionAnimation';
import AITwinProfileSidebar from '@/components/AITwinProfileSidebar';
import { type AITwinProfile } from '@/contexts/OnboardingContext';

interface ConnectionsPageProps {
  aiTwinName: string;
  aiTwinAvatar?: string;
  aiTwinProfile: AITwinProfile | null;
  user: any;
  conversations: any[];
  isLoadingConversations: boolean;
  onViewConversation: (chat: any) => void;
}

export default function ConnectionsPage({
  aiTwinName,
  aiTwinAvatar,
  aiTwinProfile,
  user,
  conversations,
  isLoadingConversations,
  onViewConversation
}: ConnectionsPageProps) {
  return (
    <div className="max-w-6xl mx-auto relative">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{aiTwinName}'s Connections</h1>
        <p className="text-gray-600">View and manage {aiTwinName}'s' conversations</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Conversation History */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Conversation History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[700px]">
                <div className="p-6 space-y-4">
                  {isLoadingConversations ? (
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <span className="text-sm font-medium font-outfit text-black">{aiTwinName} is chatting with friends</span>
                        <p className="text-xs text-gray-500 mt-1">Often takes 1-2 minutes to load</p>
                      </div>
                      <AITwinConnectionAnimation userAvatar={aiTwinAvatar} />
                    </div>
                  ) : (
                    <>
                      {conversations.map((chat, index) => (
                        <div
                          key={chat.id}
                          className={`p-4 border rounded-lg transition-all cursor-pointer animate-fade-in ${
                            chat.recommended 
                              ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 shadow-md' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                          onClick={() => onViewConversation(chat)}
                        >
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              {chat.recommended && (
                                <Badge className="bg-emerald-600 text-white text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  RECOMMENDED
                                </Badge>
                              )}
                              {chat.matchingScore && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">Match:</span>
                                  <Badge variant="outline" className="text-xs">
                                    {chat.matchingScore.toFixed(1)}/10
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={chat.avatar} alt={chat.partner} />
                              <AvatarFallback className="bg-teal-100 text-teal-700">
                                🤖
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {chat.partner}
                                </h4>
                              </div>
                            </div>
                          </div>
                          {/* 核心价值总结 */}
                          {chat.coreValue && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md px-3 py-2 mt-2">
                              <p className="text-sm font-medium text-blue-900 leading-relaxed">
                                💡 {chat.coreValue}
                              </p>
                            </div>
                          )}
                          {/* 推荐原因 */}
                          {chat.recommended && chat.recommendReason && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 mt-2">
                              <p className="text-xs text-emerald-800 leading-relaxed">
                                {chat.recommendReason}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Stats */}
        <div className="space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
              <CardTitle className="text-lg">Connection Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-3xl font-bold text-emerald-600">{conversations.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Active Chats</div>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-3xl font-bold text-teal-600">
                    {conversations.reduce((sum, chat) => sum + (chat.messageCount || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Messages</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {conversations.filter(chat => chat.recommended).length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Recommended</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-emerald-600">✓</span>
                  <p className="text-gray-600">Your AI Twin is actively networking</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-emerald-600">✓</span>
                  <p className="text-gray-600">High-quality matches found</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-emerald-600">✓</span>
                  <p className="text-gray-600">Building valuable connections</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Twin Profile Sidebar - 右侧悬浮 */}
      <AITwinProfileSidebar 
        aiTwinProfile={aiTwinProfile}
        user={user}
      />
    </div>
  );
}
