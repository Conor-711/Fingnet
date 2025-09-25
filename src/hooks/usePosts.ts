import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Post, 
  CreatePostRequest, 
  FeedQuery, 
  UserPostsQuery 
} from '@/types/post';

// Query Keys
export const postKeys = {
  all: ['posts'] as const,
  feeds: () => [...postKeys.all, 'feed'] as const,
  feed: (query?: FeedQuery) => [...postKeys.feeds(), query] as const,
  userPosts: () => [...postKeys.all, 'userPosts'] as const,
  userPost: (query: UserPostsQuery) => [...postKeys.userPosts(), query] as const,
  detail: (id: string) => [...postKeys.all, 'detail', id] as const,
};

// Hook: 获取主页feed
export function useFeedPosts(query?: FeedQuery) {
  return useQuery({
    queryKey: postKeys.feed(query),
    queryFn: () => mockApi.posts.getFeed(query),
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 10 * 60 * 1000, // 10分钟
  });
}

// Hook: 获取用户帖子
export function useUserPosts(query: UserPostsQuery) {
  return useQuery({
    queryKey: postKeys.userPost(query),
    queryFn: () => mockApi.posts.getUserPosts(query),
    staleTime: 3 * 60 * 1000, // 3分钟
    enabled: !!query.userId, // 只有当userId存在时才执行查询
  });
}

// Hook: 获取单个帖子详情
export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => mockApi.posts.getPostById(postId),
    staleTime: 5 * 60 * 1000,
    enabled: !!postId,
  });
}

// Hook: 创建帖子
export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (postData: CreatePostRequest) => {
      if (!user) {
        throw new Error('User must be authenticated to create posts');
      }
      return mockApi.posts.createPost(user.id, postData);
    },
    onSuccess: (newPost: Post) => {
      // 更新feed缓存 - 如果是share类型的帖子
      if (newPost.type === 'share') {
        queryClient.setQueryData(
          postKeys.feed(),
          (oldData: { posts: Post[], hasMore: boolean } | undefined) => {
            if (!oldData) return { posts: [newPost], hasMore: false };
            return {
              ...oldData,
              posts: [newPost, ...oldData.posts],
            };
          }
        );
      }

      // 更新用户帖子缓存
      if (user) {
        queryClient.setQueryData(
          postKeys.userPost({ userId: user.id }),
          (oldData: { posts: Post[], hasMore: boolean } | undefined) => {
            if (!oldData) return { posts: [newPost], hasMore: false };
            return {
              ...oldData,
              posts: [newPost, ...oldData.posts],
            };
          }
        );

        // 更新用户的帖子数量
        queryClient.setQueryData(
          ['users', user.id],
          (oldUser: any) => oldUser ? { ...oldUser, postsCount: oldUser.postsCount + 1 } : oldUser
        );
      }

      // 显示成功提示
      let successMessage = '';
      switch (newPost.type) {
        case 'share':
          successMessage = 'Your post has been shared publicly!';
          break;
        case 'post':
          successMessage = 'Your post has been added to your profile!';
          break;
        case 'memory':
          successMessage = 'Your memory has been saved privately!';
          break;
      }

      toast({
        title: 'Post created!',
        description: successMessage,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create post',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Hook: 点赞帖子 (后续实现)
export function useLikePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string, isLiked: boolean }) => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      return { postId, isLiked: !isLiked };
    },
    onMutate: async ({ postId, isLiked }) => {
      // 乐观更新
      const updatePost = (post: Post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLikedByCurrentUser: !isLiked,
            likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
          };
        }
        return post;
      };

      // 更新所有相关的查询缓存
      queryClient.setQueriesData(
        { queryKey: postKeys.all },
        (oldData: any) => {
          if (oldData?.posts) {
            return {
              ...oldData,
              posts: oldData.posts.map(updatePost),
            };
          }
          return oldData;
        }
      );

      // 更新单个帖子详情
      queryClient.setQueryData(
        postKeys.detail(postId),
        (oldPost: Post | undefined) => oldPost ? updatePost(oldPost) : oldPost
      );
    },
    onError: (error, { postId, isLiked }) => {
      // 回滚乐观更新
      const revertPost = (post: Post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLikedByCurrentUser: isLiked,
            likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1,
          };
        }
        return post;
      };

      queryClient.setQueriesData(
        { queryKey: postKeys.all },
        (oldData: any) => {
          if (oldData?.posts) {
            return {
              ...oldData,
              posts: oldData.posts.map(revertPost),
            };
          }
          return oldData;
        }
      );

      toast({
        title: 'Failed to update like',
        description: 'Please try again',
        variant: 'destructive',
      });
    },
  });
}

// Hook: 收藏帖子 (后续实现)
export function useBookmarkPost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, isBookmarked }: { postId: string, isBookmarked: boolean }) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { postId, isBookmarked: !isBookmarked };
    },
    onMutate: async ({ postId, isBookmarked }) => {
      const updatePost = (post: Post) => {
        if (post.id === postId) {
          return {
            ...post,
            isBookmarkedByCurrentUser: !isBookmarked,
            bookmarksCount: isBookmarked ? post.bookmarksCount - 1 : post.bookmarksCount + 1,
          };
        }
        return post;
      };

      queryClient.setQueriesData(
        { queryKey: postKeys.all },
        (oldData: any) => {
          if (oldData?.posts) {
            return {
              ...oldData,
              posts: oldData.posts.map(updatePost),
            };
          }
          return oldData;
        }
      );
    },
    onSuccess: ({ postId, isBookmarked }) => {
      toast({
        title: isBookmarked ? 'Post bookmarked' : 'Bookmark removed',
        description: isBookmarked ? 'Added to your bookmarks' : 'Removed from your bookmarks',
      });
    },
  });
}
