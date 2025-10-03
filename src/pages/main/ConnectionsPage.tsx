import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageCircle, Sparkles } from 'lucide-react';

interface ConnectionsPageProps {
  conversations: any[];
  isLoadingConversations: boolean;
  onSendInvitation: (recipientId: string, message?: string) => Promise<void>;
  onViewConversation: (chat: any) => void;
}

export default function ConnectionsPage({
  conversations,
  isLoadingConversations,
  onSendInvitation,
  onViewConversation
}: ConnectionsPageProps) {
  // 显示推荐原因
  const getRecommendationReason = (chat: any) => {
    if (chat.reasons && chat.reasons.length > 0) {
      return chat.reasons.join(' · ');
    }
    return '✨ Potential connection';
  };

  if (isLoadingConversations) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-gray-600">Loading connections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Connections</h2>
        <p className="text-gray-600">
          Discover and connect with AI Twins in your network
        </p>
      </div>

      {/* Conversation History */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Conversation History</span>
            </div>
            <Badge className="bg-white/20 text-white">
              {conversations.length} connections
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No connections yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start discovering AI Twins and build your network!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conversations.map((chat: any) => (
                  <Card
                    key={chat.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-300"
                    onClick={() => onViewConversation(chat)}
                  >
                    <CardContent className="p-4">
                      {/* Avatar and Name */}
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={chat.avatar} alt={chat.partner} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            🤖
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {chat.partner}
                          </h4>
                          <p className="text-xs text-gray-500">{chat.topic}</p>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {chat.recommended && (
                          <Badge className="bg-emerald-600 text-white text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            RECOMMENDED
                          </Badge>
                        )}
                        {chat.matchingScore && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {chat.matchingScore.toFixed(1)}/10 Match
                          </Badge>
                        )}
                      </div>

                      {/* Recommendation Reason */}
                      {chat.recommended && (
                        <div className="bg-emerald-50 rounded-lg p-2 mb-3">
                          <p className="text-xs text-emerald-700 font-medium">
                            {getRecommendationReason(chat)}
                          </p>
                        </div>
                      )}

                      {/* Profile Info */}
                      <div className="text-xs text-gray-600 space-y-1 mb-3">
                        {chat.occupation && (
                          <p>💼 {chat.occupation}</p>
                        )}
                        {chat.location && (
                          <p>📍 {chat.location}</p>
                        )}
                        {chat.age && (
                          <p>👤 {chat.age}</p>
                        )}
                      </div>

                      {/* Goal Preview */}
                      {chat.goal && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Goal:</p>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {chat.goal}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendInvitation(chat.userId, `Hi! I'd love to connect with you.`);
                          }}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewConversation(chat);
                          }}
                        >
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

