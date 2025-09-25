import { useQuery } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';
import { User } from '@/types/auth';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  byUsername: (username: string) => [...userKeys.all, 'byUsername', username] as const,
};

// Hook: 通过ID获取用户信息
export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => mockApi.users.getUserById(userId),
    staleTime: 10 * 60 * 1000, // 10分钟
    enabled: !!userId,
  });
}

// Hook: 通过用户名获取用户信息
export function useUserByUsername(username: string) {
  return useQuery({
    queryKey: userKeys.byUsername(username),
    queryFn: () => mockApi.users.getUserByUsername(username),
    staleTime: 10 * 60 * 1000,
    enabled: !!username,
  });
}
