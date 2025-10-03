import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  type Invitation,
  sendInvitation,
  getInvitations,
  updateInvitationStatus,
  createGroup,
  addGroupMember
} from '@/lib/supabase';

export function useInvitations(userId: string | undefined) {
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);

  // 加载邀请列表
  const loadInvitations = async () => {
    if (!userId) return;
    
    setIsLoadingInvitations(true);
    try {
      // 加载发送的邀请
      const { data: sent, error: sentError } = await getInvitations(userId, 'sent');
      if (sentError) {
        console.error('Failed to load sent invitations:', sentError);
        toast.error('Failed to load sent invitations');
      } else {
        setSentInvitations(sent || []);
      }

      // 加载接收的邀请
      const { data: received, error: receivedError } = await getInvitations(userId, 'received');
      if (receivedError) {
        console.error('Failed to load received invitations:', receivedError);
        toast.error('Failed to load received invitations');
      } else {
        setReceivedInvitations(received || []);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  // 发送邀请
  const handleSendInvitation = async (recipientId: string, message?: string) => {
    if (!userId) {
      toast.error('Please log in to send invitations');
      return;
    }

    try {
      const { error } = await sendInvitation(userId, recipientId, message);
      
      if (error) {
        console.error('Failed to send invitation:', error);
        toast.error('Failed to send invitation');
        return;
      }

      toast.success('Invitation sent successfully!');
      loadInvitations(); // 重新加载邀请列表
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  // 接受邀请
  const handleAcceptInvitation = async (
    invitation: Invitation,
    onGroupCreated?: (groupId: string) => void
  ) => {
    if (!userId) {
      toast.error('Please log in to accept invitations');
      return;
    }

    try {
      // 更新邀请状态为已接受
      await updateInvitationStatus(invitation.id, 'accepted');

      // 自动创建群组
      const groupName = `Chat with ${invitation.sender_id.slice(0, 8)}...`;
      const { data: group, error: groupError } = await createGroup(groupName, userId);

      if (groupError || !group) {
        console.error('Failed to create group:', groupError);
        toast.error('Failed to create group');
        return;
      }

      // 添加成员到群组
      await addGroupMember(group.id, invitation.sender_id);
      await addGroupMember(group.id, userId);

      toast.success('Invitation accepted! Group created.');
      loadInvitations(); // 重新加载邀请列表

      // 通知父组件群组已创建
      if (onGroupCreated) {
        onGroupCreated(group.id);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    }
  };

  // 拒绝邀请
  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await updateInvitationStatus(invitationId, 'declined');
      toast.success('Invitation declined');
      loadInvitations(); // 重新加载邀请列表
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error('Failed to decline invitation');
    }
  };

  // 当userId变化时自动加载邀请
  useEffect(() => {
    if (userId) {
      loadInvitations();
    }
  }, [userId]);

  return {
    sentInvitations,
    receivedInvitations,
    isLoadingInvitations,
    loadInvitations,
    handleSendInvitation,
    handleAcceptInvitation,
    handleDeclineInvitation
  };
}

