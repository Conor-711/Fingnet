import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  type Group,
  type GroupMessage,
  getUserGroups,
  getGroupMessages,
  sendGroupMessage,
  subscribeToGroupMessages
} from '@/lib/supabase';

interface UserProfile {
  name?: string;
  userNickname?: string;
}

export function useGroups(
  userId: string | undefined,
  userProfile?: UserProfile | null
) {
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // 加载用户的群组列表
  const loadUserGroups = async () => {
    if (!userId) return;

    setIsLoadingGroups(true);
    try {
      const { data, error } = await getUserGroups(userId);
      
      if (error) {
        console.error('Failed to load groups:', error);
        toast.error('Failed to load groups');
      } else {
        setUserGroups(data || []);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // 加载群组消息
  const loadGroupMessages = async (groupId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await getGroupMessages(groupId);
      
      if (error) {
        console.error('Failed to load messages:', error);
        toast.error('Failed to load messages');
      } else {
        setGroupMessages(data || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // 发送群组消息
  const handleSendGroupMessage = async () => {
    if (!userId || !selectedGroup || !newMessage.trim()) return;

    // 获取用户名称
    const senderName = userProfile?.name || userProfile?.userNickname || 'Anonymous';

    console.log('📤 Sending message:', {
      groupId: selectedGroup.id,
      userId,
      senderName,
      content: newMessage.trim()
    });

    setIsSendingMessage(true);
    try {
      const { error } = await sendGroupMessage(
        selectedGroup.id,
        userId,
        senderName,
        newMessage.trim()
      );

      if (error) {
        console.error('❌ Failed to send message:', error);
        toast.error('Failed to send message');
        return;
      }

      console.log('✅ Message sent successfully');
      // 清空输入框
      setNewMessage('');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // 选择群组
  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
  };

  // 当userId变化时加载群组
  useEffect(() => {
    if (userId) {
      loadUserGroups();
    }
  }, [userId]);

  // 当selectedGroup变化时加载消息并订阅实时更新
  useEffect(() => {
    if (selectedGroup) {
      loadGroupMessages(selectedGroup.id);

      // 订阅实时消息
      const subscription = subscribeToGroupMessages(selectedGroup.id, (newMessage) => {
        setGroupMessages((prev) => [...prev, newMessage]);
      });

      // 清理订阅
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedGroup]);

  return {
    userGroups,
    selectedGroup,
    groupMessages,
    newMessage,
    isLoadingGroups,
    isLoadingMessages,
    isSendingMessage,
    setNewMessage,
    loadUserGroups,
    loadGroupMessages,
    handleSendGroupMessage,
    handleSelectGroup
  };
}

