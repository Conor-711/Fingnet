import { useState, useEffect } from 'react';
import { getAIConversationForGroup, type QuotedMessage } from '@/lib/supabase';

export function useQuote(selectedGroupId: string | null, userId: string | undefined) {
  const [aiConversationForQuote, setAIConversationForQuote] = useState<any | null>(null);
  const [isLoadingAIConversation, setIsLoadingAIConversation] = useState(false);
  const [quotedMessage, setQuotedMessage] = useState<QuotedMessage | null>(null);

  // 当选中的 Group 改变时，重置引用状态
  useEffect(() => {
    setQuotedMessage(null);
  }, [selectedGroupId]);

  // 加载 AI 对话
  const loadAIConversationForQuote = async () => {
    if (!selectedGroupId || !userId) {
      console.log('⚠️ No group selected or user not logged in');
      return;
    }

    setIsLoadingAIConversation(true);
    
    try {
      console.log('📖 Loading AI conversation for group:', selectedGroupId);
      
      const { data, error } = await getAIConversationForGroup(selectedGroupId, userId);
      
      if (error) {
        console.error('❌ Error loading AI conversation:', error);
        setAIConversationForQuote(null);
        return;
      }
      
      if (data) {
        console.log('✅ AI conversation loaded:', data);
        setAIConversationForQuote(data);
      } else {
        console.log('⚠️ No AI conversation found for this group');
        setAIConversationForQuote(null);
      }
    } catch (error) {
      console.error('❌ Exception loading AI conversation:', error);
      setAIConversationForQuote(null);
    } finally {
      setIsLoadingAIConversation(false);
    }
  };

  // 打开引用选择器
  const handleOpenQuoteSelector = () => {
    loadAIConversationForQuote();
  };

  // 选择引用消息
  const handleSelectQuotedMessage = (message: QuotedMessage) => {
    setQuotedMessage(message);
    console.log('💬 Quoted message selected:', message);
  };

  // 清除引用消息
  const handleClearQuotedMessage = () => {
    setQuotedMessage(null);
    console.log('🗑️ Quoted message cleared');
  };

  // 获取当前引用消息（用于发送时附加）
  const getCurrentQuotedMessage = () => {
    return quotedMessage;
  };

  return {
    aiConversationForQuote,
    isLoadingAIConversation,
    quotedMessage,
    handleOpenQuoteSelector,
    handleSelectQuotedMessage,
    handleClearQuotedMessage,
    getCurrentQuotedMessage
  };
}

