import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Quote, Sparkles } from 'lucide-react';
import { type QuotedMessage } from '@/lib/supabase';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp?: string;
}

interface AIConversation {
  id: string;
  partner_name: string;
  messages: Message[];
}

interface QuoteMessageSelectorProps {
  open: boolean;
  onClose: () => void;
  conversation: AIConversation | null;
  isLoading: boolean;
  onSelectMessage: (quotedMessage: QuotedMessage) => void;
}

export default function QuoteMessageSelector({
  open,
  onClose,
  conversation,
  isLoading,
  onSelectMessage
}: QuoteMessageSelectorProps) {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  // 重置选中状态
  useEffect(() => {
    if (!open) {
      setSelectedMessageId(null);
    }
  }, [open]);

  const handleSelectMessage = (message: Message) => {
    const quotedMessage: QuotedMessage = {
      id: message.id,
      content: message.content,
      sender: message.sender,
      source: 'ai_conversation',
      conversation_id: conversation?.id,
      timestamp: message.timestamp
    };
    
    onSelectMessage(quotedMessage);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Quote className="w-5 h-5 mr-2 text-emerald-600" />
            Quote AI Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-3" />
              <span className="text-gray-600">Loading conversation record...</span>
            </div>
          ) : !conversation || !conversation.messages || conversation.messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2">No AI conversation record</p>
              <p className="text-sm text-gray-500">
                The AI Twin conversation corresponding to this group has not been generated or saved
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  <strong>💡 Tip:</strong> Select an AI conversation message, click it to reference it in your reply
                </p>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {conversation.messages.map((message, index) => {
                    const isSelected = selectedMessageId === message.id;
                    const isAITwin = message.sender !== 'Your AI Twin';
                    
                    return (
                      <button
                        key={message.id || `msg-${index}`}
                        onClick={() => handleSelectMessage(message)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarFallback className={
                              isAITwin 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-emerald-100 text-emerald-700'
                            }>
                              {message.sender.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-gray-900 text-sm">
                                {message.sender}
                              </p>
                              {isSelected && (
                                <span className="text-xs font-medium text-emerald-600 flex items-center">
                                  <Quote className="w-3 h-3 mr-1" />
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Total {conversation.messages.length} conversations
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

