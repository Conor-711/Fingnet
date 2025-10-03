import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Users as UsersIcon, Brain, Inbox, Check, X, ChevronUp, ChevronDown, Quote, UserPlus } from 'lucide-react';
import { type Group, type GroupMessage, type Invitation, type QuotedMessage } from '@/lib/supabase';
import QuoteMessageSelector from '@/components/QuoteMessageSelector';

interface GroupChatPageProps {
  userGroups: Group[];
  selectedGroup: Group | null;
  groupMessages: GroupMessage[];
  newMessage: string;
  isLoadingGroups: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  isSummarizing: boolean;
  chatSummary: string | null;
  showSummary: boolean;
  isMemorySaved: boolean;
  currentUserId: string;
  // Invitations props
  sentInvitations: Invitation[];
  receivedInvitations: Invitation[];
  isLoadingInvitations: boolean;
  // Quote props
  aiConversationForQuote: any | null;
  isLoadingAIConversation: boolean;
  quotedMessage: QuotedMessage | null;
  // Event handlers
  onSelectGroup: (group: Group, testMessages?: GroupMessage[], testConversation?: any) => void;
  onSendMessage: () => void;
  onNewMessageChange: (value: string) => void;
  onSummarizeChat: () => void;
  onSaveMemory: () => void;
  onAcceptInvitation: (invitation: Invitation) => Promise<void>;
  onDeclineInvitation: (invitationId: string) => Promise<void>;
  onOpenQuoteSelector: () => void;
  onSelectQuotedMessage: (message: QuotedMessage) => void;
  onClearQuotedMessage: () => void;
}

export default function GroupChatPage({
  userGroups,
  selectedGroup,
  groupMessages,
  newMessage,
  isLoadingGroups,
  isLoadingMessages,
  isSendingMessage,
  isSummarizing,
  chatSummary,
  showSummary,
  isMemorySaved,
  currentUserId,
  sentInvitations,
  receivedInvitations,
  isLoadingInvitations,
  aiConversationForQuote,
  isLoadingAIConversation,
  quotedMessage,
  onSelectGroup,
  onSendMessage,
  onNewMessageChange,
  onSummarizeChat,
  onSaveMemory,
  onAcceptInvitation,
  onDeclineInvitation,
  onOpenQuoteSelector,
  onSelectQuotedMessage,
  onClearQuotedMessage
}: GroupChatPageProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-700">Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-700">Declined</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const [isInvitationsCollapsed, setIsInvitationsCollapsed] = useState(false);
  const [showQuoteSelector, setShowQuoteSelector] = useState(false);
  const pendingReceivedCount = receivedInvitations.filter(inv => inv.status === 'pending').length;

  const handleOpenQuoteSelector = () => {
    onOpenQuoteSelector();
    setShowQuoteSelector(true);
  };

  const handleCloseQuoteSelector = () => {
    setShowQuoteSelector(false);
  };

  const handleSelectQuote = (message: QuotedMessage) => {
    onSelectQuotedMessage(message);
    setShowQuoteSelector(false);
  };

  // 测试：创建虚拟 Group Chat
  const handleCreateTestGroup = () => {
    const testGroupId = 'test-group-' + Date.now();
    const testGroup: Group = {
      id: testGroupId,
      name: 'Test Group',
      avatar: null,
      created_by: currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 创建测试消息
    const testMessages: GroupMessage[] = [
      {
        id: 'test-msg-1',
        group_id: testGroupId,
        sender_id: 'other-user-123',
        sender_name: 'Test User A',
        content: 'Hi! I heard you are working on a new project. What is it about?',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'test-msg-2',
        group_id: testGroupId,
        sender_id: currentUserId,
        sender_name: 'You',
        content: "Yes! I'm building a social networking platform that connects people based on their goals and values.",
        created_at: new Date(Date.now() - 3000000).toISOString()
      },
      {
        id: 'test-msg-3',
        group_id: testGroupId,
        sender_id: 'other-user-123',
        sender_name: 'Test User A',
        content: 'That sounds amazing! I have experience in community building and user engagement strategies. How can I help?',
        created_at: new Date(Date.now() - 2400000).toISOString()
      },
      {
        id: 'test-msg-4',
        group_id: testGroupId,
        sender_id: currentUserId,
        sender_name: 'You',
        content: "I'd love to learn more about your strategies! Especially around keeping users engaged long-term.",
        quoted_message: {
          id: 'ai-msg-2',
          content: 'I can help you develop a sustainable growth strategy for your platform',
          sender: 'AI Twin B',
          source: 'ai_conversation',
          conversation_id: 'test-conv-123'
        },
        created_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'test-msg-5',
        group_id: testGroupId,
        sender_id: 'other-user-123',
        sender_name: 'Test User A',
        content: "Great! I can share some case studies from my previous projects. Let's schedule a call next week?",
        created_at: new Date(Date.now() - 600000).toISOString()
      }
    ];
    
    // 创建测试 AI 对话
    const testConversation = {
      id: 'test-conv-123',
      partner_name: 'AI Twin B',
      messages: [
        {
          id: 'ai-msg-1',
          sender: 'Your AI Twin',
          content: "Hi! I'm looking for someone who can help me with growth strategies for my social platform."
        },
        {
          id: 'ai-msg-2',
          sender: 'AI Twin B',
          content: 'I can help you develop a sustainable growth strategy for your platform'
        },
        {
          id: 'ai-msg-3',
          sender: 'Your AI Twin',
          content: 'That would be perfect! What kind of experience do you have in this area?'
        },
        {
          id: 'ai-msg-4',
          sender: 'AI Twin B',
          content: "I've helped multiple startups achieve 10x user growth through community-driven strategies and data-driven engagement tactics."
        },
        {
          id: 'ai-msg-5',
          sender: 'Your AI Twin',
          content: "Impressive! I'd love to learn about your approach to measuring user engagement."
        },
        {
          id: 'ai-msg-6',
          sender: 'AI Twin B',
          content: "I focus on key metrics like DAU/MAU ratio, retention cohorts, and NPS scores. Let's collaborate!"
        }
      ]
    };
    
    // 通知父组件选择这个测试群组，并传递测试数据
    onSelectGroup(testGroup, testMessages, testConversation);
    
    console.log('✅ 创建测试群组:', {
      group: testGroup,
      messages: testMessages.length,
      conversation: testConversation.messages.length
    });
  };

  return (
    <div className="space-y-6">
      {/* Invitations Module - 放在顶部 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Inbox className="w-6 h-6 mr-2 text-emerald-600" />
              Invitations
              {pendingReceivedCount > 0 && (
                <Badge className="ml-3 bg-red-500 text-white">
                  {pendingReceivedCount} new
                </Badge>
              )}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsInvitationsCollapsed(!isInvitationsCollapsed)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isInvitationsCollapsed ? (
                <>
                  <ChevronDown className="w-5 h-5 mr-1" />
                  <span className="text-sm">Expand</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-5 h-5 mr-1" />
                  <span className="text-sm">Collapse</span>
                </>
              )}
            </Button>
          </div>

          {!isInvitationsCollapsed && (
            <>
              {isLoadingInvitations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span className="ml-2 text-gray-600">Loading invitations...</span>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
              {/* Received Invitations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Received ({receivedInvitations.length})
                </h3>
                <div className="space-y-3">
                  {receivedInvitations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <Inbox className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No invitations received</p>
                    </div>
                  ) : (
                    receivedInvitations.map((invitation) => (
                      <Card key={invitation.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-gray-900">From: {invitation.sender_id.slice(0, 8)}...</p>
                                {getStatusBadge(invitation.status)}
                              </div>
                              {invitation.message && (
                                <p className="text-sm text-gray-600 mt-2">{invitation.message}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">{formatDate(invitation.created_at)}</p>
                            </div>
                          </div>
                          {invitation.status === 'pending' && (
                            <div className="flex space-x-2 mt-3">
                              <Button
                                onClick={() => onAcceptInvitation(invitation)}
                                size="sm"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                onClick={() => onDeclineInvitation(invitation.id)}
                                size="sm"
                                variant="outline"
                                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Sent Invitations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sent ({sentInvitations.length})
                </h3>
                <div className="space-y-3">
                  {sentInvitations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <Send className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No invitations sent</p>
                    </div>
                  ) : (
                    sentInvitations.map((invitation) => (
                      <Card key={invitation.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-gray-900">To: {invitation.recipient_id.slice(0, 8)}...</p>
                                {getStatusBadge(invitation.status)}
                              </div>
                              {invitation.message && (
                                <p className="text-sm text-gray-600 mt-2">{invitation.message}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">{formatDate(invitation.created_at)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Group Chat Module - 原有内容 */}
      <div className="h-full flex">
      {/* Left Sidebar - Group List */}
      <div className="w-80 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <UsersIcon className="w-5 h-5 mr-2" />
            Your Groups
          </h3>
          {isLoadingGroups && (
            <p className="text-sm text-gray-500 mt-1">Loading...</p>
          )}
          
          {/* 测试按钮 */}
          <Button
            onClick={handleCreateTestGroup}
            variant="outline"
            size="sm"
            className="w-full mt-3 border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Test Group
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          {userGroups.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 text-sm">No groups yet</p>
              <p className="text-gray-400 text-xs mt-2">
                Accept an invitation to create a group
              </p>
            </div>
          ) : (
            <div className="p-2">
              {userGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className={`w-full p-4 rounded-lg mb-2 text-left transition-all ${
                    selectedGroup?.id === group.id
                      ? 'bg-emerald-100 border-2 border-emerald-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={group.avatar || undefined} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {group.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {group.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created {new Date(group.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        {!selectedGroup ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a group to start chatting
              </h3>
              <p className="text-gray-600">
                Choose a group from the left sidebar
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedGroup.avatar || undefined} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {selectedGroup.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedGroup.name}</h3>
                    <p className="text-sm text-gray-500">
                      {groupMessages.length} messages
                    </p>
                  </div>
                </div>

                {/* Summarize Button */}
                {groupMessages.length > 0 && (
                  <Button
                    onClick={onSummarizeChat}
                    disabled={isSummarizing}
                    variant="outline"
                    size="sm"
                    className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  >
                    {isSummarizing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Summarizing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Summarize
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
                  <span className="text-gray-600">Loading messages...</span>
                </div>
              ) : groupMessages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Start the conversation!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupMessages.map((message) => {
                    const isCurrentUser = message.sender_id === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            isCurrentUser
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white text-gray-900'
                          } rounded-lg p-4 shadow-sm`}
                        >
                          {/* 引用消息显示 */}
                          {message.quoted_message && (
                            <div className={`mb-3 p-3 rounded-md border-l-4 ${
                              isCurrentUser
                                ? 'bg-emerald-600/30 border-emerald-300'
                                : 'bg-gray-100 border-gray-400'
                            }`}>
                              <div className="flex items-center space-x-1 mb-1">
                                <Quote className={`w-3 h-3 ${
                                  isCurrentUser ? 'text-emerald-200' : 'text-gray-500'
                                }`} />
                                <p className={`text-xs font-medium ${
                                  isCurrentUser ? 'text-emerald-100' : 'text-gray-600'
                                }`}>
                                  {message.quoted_message.sender}
                                </p>
                              </div>
                              <p className={`text-xs leading-relaxed line-clamp-2 ${
                                isCurrentUser ? 'text-emerald-50' : 'text-gray-700'
                              }`}>
                                {message.quoted_message.content}
                              </p>
                            </div>
                          )}
                          
                          {/* 消息内容 */}
                          <div className="flex items-center space-x-2 mb-1">
                            <p className={`text-xs font-medium ${
                              isCurrentUser ? 'text-emerald-100' : 'text-emerald-600'
                            }`}>
                              {message.sender_name}
                            </p>
                            <p className={`text-xs ${
                              isCurrentUser ? 'text-emerald-200' : 'text-gray-500'
                            }`}>
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Summary Display */}
            {showSummary && chatSummary && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Brain className="w-4 h-4 mr-2 text-indigo-600" />
                    Chat Summary
                  </h4>
                  {!isMemorySaved && (
                    <Button
                      onClick={onSaveMemory}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Save to Memory
                    </Button>
                  )}
                  {isMemorySaved && (
                    <Badge className="bg-green-100 text-green-700">
                      ✓ Saved to Memory
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {chatSummary}
                </p>
              </div>
            )}

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {/* 引用预览 */}
              {quotedMessage && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200 relative">
                  <button
                    onClick={onClearQuotedMessage}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center space-x-2 mb-1">
                    <Quote className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-medium text-blue-800">
                      Quote AI Conversation - {quotedMessage.sender}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {quotedMessage.content}
                  </p>
                </div>
              )}

              {/* 引用按钮 */}
              <div className="flex items-center space-x-2 mb-3">
                <Button
                  onClick={handleOpenQuoteSelector}
                  variant="outline"
                  size="sm"
                  className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                >
                  <Quote className="w-4 h-4 mr-1" />
                  Quote AI Conversation
                </Button>
              </div>

              <div className="flex space-x-3">
                <Textarea
                  value={newMessage}
                  onChange={(e) => onNewMessageChange(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message... (Shift + Enter for new line)"
                  className="flex-1 resize-none min-h-[60px] max-h-[120px]"
                  disabled={isSendingMessage}
                />
                <Button
                  onClick={onSendMessage}
                  disabled={!newMessage.trim() || isSendingMessage}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white self-end"
                >
                  {isSendingMessage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
      </div>

      {/* 引用消息选择器 */}
      <QuoteMessageSelector
        open={showQuoteSelector}
        onClose={handleCloseQuoteSelector}
        conversation={aiConversationForQuote}
        isLoading={isLoadingAIConversation}
        onSelectMessage={handleSelectQuote}
      />
    </div>
  );
}

