import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  FollowQuery,
  FollowResponse,
  FollowStats,
  FollowStatus,
  BatchFollowStatusQuery,
  BatchFollowStatusResponse
} from '@/types/follow';

// Query Keys
export const followKeys = {
  all: ['follows'] as const,
  followStatus: (currentUserId: string, targetUserId: string) => 
    [...followKeys.all, 'status', currentUserId, targetUserId] as const,
  followers: (userId: string) => [...followKeys.all, 'followers', userId] as const,
  following: (userId: string) => [...followKeys.all, 'following', userId] as const,
  stats: (userId: string) => [...followKeys.all, 'stats', userId] as const,
  batchStatus: (currentUserId: string, targetUserIds: string[]) => 
    [...followKeys.all, 'batchStatus', currentUserId, ...targetUserIds.sort()] as const,
};

// Hook: 获取关注状态
export function useFollowStatus(targetUserId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: followKeys.followStatus(user?.id || '', targetUserId),
    queryFn: () => mockApi.follows.getFollowStatus(user!.id, targetUserId),
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}

// Hook: 获取关注者列表
export function useFollowers(query: FollowQuery) {
  return useQuery({
    queryKey: [...followKeys.followers(query.userId), query],
    queryFn: () => mockApi.follows.getFollowers(query),
    staleTime: 5 * 60 * 1000, // 5分钟
    enabled: !!query.userId,
  });
}

// Hook: 获取关注列表
export function useFollowing(query: FollowQuery) {
  return useQuery({
    queryKey: [...followKeys.following(query.userId), query],
    queryFn: () => mockApi.follows.getFollowing(query),
    staleTime: 5 * 60 * 1000, // 5分钟
    enabled: !!query.userId,
  });
}

// Hook: 获取关注统计
export function useFollowStats(userId: string) {
  return useQuery({
    queryKey: followKeys.stats(userId),
    queryFn: () => mockApi.follows.getFollowStats(userId),
    staleTime: 3 * 60 * 1000, // 3分钟
    enabled: !!userId,
  });
}

// Hook: 批量获取关注状态
export function useBatchFollowStatus(targetUserIds: string[]) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: followKeys.batchStatus(user?.id || '', targetUserIds),
    queryFn: () => mockApi.follows.batchGetFollowStatus(user!.id, targetUserIds),
    enabled: !!user && targetUserIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}

// Hook: 关注用户
export function useFollowUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (targetUserId: string) => {
      if (!user) {
        throw new Error('User must be authenticated to follow users');
      }
      return mockApi.follows.followUser(user.id, targetUserId);
    },
    onMutate: async (targetUserId) => {
      if (!user) return;

      // 取消相关查询以避免乐观更新被覆盖
      await queryClient.cancelQueries({ 
        queryKey: followKeys.followStatus(user.id, targetUserId) 
      });

      // 获取当前关注状态的快照
      const previousStatus = queryClient.getQueryData<FollowStatus>(
        followKeys.followStatus(user.id, targetUserId)
      );

      // 乐观更新：立即更新关注状态
      queryClient.setQueryData<FollowStatus>(
        followKeys.followStatus(user.id, targetUserId),
        (old) => ({
          isFollowing: true,
          isFollowedBy: old?.isFollowedBy || false,
          isMutual: old?.isFollowedBy || false,
        })
      );

      // 乐观更新：增加目标用户的关注者数量
      queryClient.setQueryData<FollowStats>(
        followKeys.stats(targetUserId),
        (old) => old ? {
          ...old,
          followersCount: old.followersCount + 1,
        } : undefined
      );

      // 乐观更新：增加当前用户的关注数量
      queryClient.setQueryData<FollowStats>(
        followKeys.stats(user.id),
        (old) => old ? {
          ...old,
          followingCount: old.followingCount + 1,
        } : undefined
      );

      return { previousStatus };
    },
    onError: (error, targetUserId, context) => {
      if (!user) return;

      // 回滚乐观更新
      if (context?.previousStatus) {
        queryClient.setQueryData(
          followKeys.followStatus(user.id, targetUserId),
          context.previousStatus
        );
      }

      // 回滚统计数据
      queryClient.setQueryData<FollowStats>(
        followKeys.stats(targetUserId),
        (old) => old ? {
          ...old,
          followersCount: Math.max(0, old.followersCount - 1),
        } : undefined
      );

      queryClient.setQueryData<FollowStats>(
        followKeys.stats(user.id),
        (old) => old ? {
          ...old,
          followingCount: Math.max(0, old.followingCount - 1),
        } : undefined
      );

      toast({
        title: 'Failed to follow user',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    },
    onSuccess: (followData, targetUserId) => {
      if (!user) return;

      // 使真实数据更新缓存
      queryClient.setQueryData<FollowStatus>(
        followKeys.followStatus(user.id, targetUserId),
        {
          isFollowing: true,
          isFollowedBy: followData.following?.id === user.id || false,
          isMutual: followData.following?.id === user.id || false,
        }
      );

      // 刷新相关的关注列表
      queryClient.invalidateQueries({ 
        queryKey: followKeys.following(user.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: followKeys.followers(targetUserId) 
      });

      // 刷新增强的feed（可能包含新关注用户的内容）
      queryClient.invalidateQueries({ 
        queryKey: ['posts', 'feed'] 
      });

      toast({
        title: 'Following user',
        description: `You are now following ${followData.following?.displayName}`,
      });
    },
  });
}

// Hook: 取消关注用户
export function useUnfollowUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (targetUserId: string) => {
      if (!user) {
        throw new Error('User must be authenticated to unfollow users');
      }
      return mockApi.follows.unfollowUser(user.id, targetUserId);
    },
    onMutate: async (targetUserId) => {
      if (!user) return;

      // 取消相关查询
      await queryClient.cancelQueries({ 
        queryKey: followKeys.followStatus(user.id, targetUserId) 
      });

      // 获取当前关注状态的快照
      const previousStatus = queryClient.getQueryData<FollowStatus>(
        followKeys.followStatus(user.id, targetUserId)
      );

      // 乐观更新：立即更新关注状态
      queryClient.setQueryData<FollowStatus>(
        followKeys.followStatus(user.id, targetUserId),
        (old) => ({
          isFollowing: false,
          isFollowedBy: old?.isFollowedBy || false,
          isMutual: false,
        })
      );

      // 乐观更新：减少目标用户的关注者数量
      queryClient.setQueryData<FollowStats>(
        followKeys.stats(targetUserId),
        (old) => old ? {
          ...old,
          followersCount: Math.max(0, old.followersCount - 1),
        } : undefined
      );

      // 乐观更新：减少当前用户的关注数量
      queryClient.setQueryData<FollowStats>(
        followKeys.stats(user.id),
        (old) => old ? {
          ...old,
          followingCount: Math.max(0, old.followingCount - 1),
        } : undefined
      );

      return { previousStatus };
    },
    onError: (error, targetUserId, context) => {
      if (!user) return;

      // 回滚乐观更新
      if (context?.previousStatus) {
        queryClient.setQueryData(
          followKeys.followStatus(user.id, targetUserId),
          context.previousStatus
        );
      }

      // 回滚统计数据
      queryClient.setQueryData<FollowStats>(
        followKeys.stats(targetUserId),
        (old) => old ? {
          ...old,
          followersCount: old.followersCount + 1,
        } : undefined
      );

      queryClient.setQueryData<FollowStats>(
        followKeys.stats(user.id),
        (old) => old ? {
          ...old,
          followingCount: old.followingCount + 1,
        } : undefined
      );

      toast({
        title: 'Failed to unfollow user',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    },
    onSuccess: (_, targetUserId) => {
      if (!user) return;

      // 刷新相关的关注列表
      queryClient.invalidateQueries({ 
        queryKey: followKeys.following(user.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: followKeys.followers(targetUserId) 
      });

      // 刷新增强的feed
      queryClient.invalidateQueries({ 
        queryKey: ['posts', 'feed'] 
      });

      toast({
        title: 'Unfollowed user',
        description: 'You are no longer following this user',
      });
    },
  });
}

// Hook: 切换关注状态（关注/取消关注）
export function useToggleFollow(targetUserId: string) {
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const { data: followStatus } = useFollowStatus(targetUserId);

  const toggleFollow = () => {
    if (followStatus?.isFollowing) {
      unfollowMutation.mutate(targetUserId);
    } else {
      followMutation.mutate(targetUserId);
    }
  };

  return {
    toggleFollow,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
    isFollowing: followStatus?.isFollowing || false,
    isMutual: followStatus?.isMutual || false,
  };
}
