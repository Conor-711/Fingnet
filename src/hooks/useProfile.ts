import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  UpdateProfileRequest,
  AvatarUploadRequest,
  User
} from '@/types/auth';
import { userKeys } from './useUsers';

// Hook: 更新用户Profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (updates: UpdateProfileRequest) => {
      if (!user) {
        throw new Error('User must be authenticated to update profile');
      }
      return mockApi.auth.updateProfile(user.id, updates);
    },
    onMutate: async (updates) => {
      if (!user) return;

      // 取消相关查询以避免乐观更新被覆盖
      await queryClient.cancelQueries({ queryKey: userKeys.detail(user.id) });

      // 获取当前用户数据的快照
      const previousUser = queryClient.getQueryData<User>(userKeys.detail(user.id));

      // 乐观更新：立即更新用户信息
      const updatedUser = { ...user, ...updates };
      queryClient.setQueryData(userKeys.detail(user.id), updatedUser);

      // 更新AuthContext中的用户信息
      updateUser(updatedUser);

      return { previousUser };
    },
    onError: (error, updates, context) => {
      if (!user) return;

      // 回滚乐观更新
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(user.id), context.previousUser);
        updateUser(context.previousUser);
      }

      toast({
        title: 'Failed to update profile',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    },
    onSuccess: (updatedUser) => {
      // 更新缓存和AuthContext
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      updateUser(updatedUser);

      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['posts'] }); // 更新帖子中的作者信息
      queryClient.invalidateQueries({ queryKey: ['comments'] }); // 更新评论中的作者信息
      queryClient.invalidateQueries({ queryKey: ['users'] }); // 刷新所有用户查询

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    },
  });
}

// Hook: 上传头像
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => {
      if (!user) {
        throw new Error('User must be authenticated to upload avatar');
      }
      return mockApi.auth.uploadAvatar({ file, userId: user.id });
    },
    onMutate: async () => {
      if (!user) return;

      // 可以在这里显示上传进度或占位符
      const previousUser = queryClient.getQueryData<User>(userKeys.detail(user.id));
      return { previousUser };
    },
    onError: (error, file, context) => {
      if (!user) return;

      // 如果有需要，回滚用户数据
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(user.id), context.previousUser);
        updateUser(context.previousUser);
      }

      toast({
        title: 'Failed to upload avatar',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    },
    onSuccess: (response) => {
      if (!user) return;

      console.log('Avatar upload response:', response);

      // 上传成功后，头像URL已经在后端自动更新，需要获取最新用户信息
      const updatedUser = { ...user, avatar: response.avatarUrl };
      
      console.log('Updating user with new avatar:', updatedUser.avatar);
      
      // 更新React Query缓存中的用户数据
      queryClient.setQueryData(userKeys.detail(user.id), updatedUser);
      updateUser(updatedUser);

      // 刷新相关查询 - 更新帖子和评论中的作者头像
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['users'] }); // 刷新所有用户查询

      toast({
        title: 'Avatar updated',
        description: response.message,
      });
    },
  });
}

// Hook: 检查用户名可用性
export function useCheckUsername(username: string, enabled: boolean = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['username-availability', username, user?.id],
    queryFn: () => mockApi.auth.checkUsernameAvailability(username, user?.id),
    enabled: enabled && !!username && username.length >= 3,
    staleTime: 30 * 1000, // 30秒
    retry: false,
  });
}

// Hook: 验证用户名输入
export function useUsernameValidation(username: string) {
  const { user } = useAuth();
  const isCurrentUsername = user?.username === username;
  const shouldCheck = username.length >= 3 && !isCurrentUsername;
  
  const { data: isAvailable, isLoading, error } = useCheckUsername(username, shouldCheck);

  const getValidationStatus = () => {
    if (!username) return { isValid: false, message: '' };
    if (username.length < 3) return { isValid: false, message: 'Username must be at least 3 characters' };
    if (username.length > 20) return { isValid: false, message: 'Username must be less than 20 characters' };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
    if (isCurrentUsername) return { isValid: true, message: 'Current username' };
    if (isLoading) return { isValid: false, message: 'Checking availability...' };
    if (error) return { isValid: false, message: 'Error checking username' };
    if (isAvailable === false) return { isValid: false, message: 'Username is already taken' };
    if (isAvailable === true) return { isValid: true, message: 'Username is available' };
    
    return { isValid: false, message: '' };
  };

  return {
    ...getValidationStatus(),
    isLoading,
  };
}
