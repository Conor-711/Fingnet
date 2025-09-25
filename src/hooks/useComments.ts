import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Comment, 
  CreateCommentRequest, 
  UpdateCommentRequest,
  CommentsQuery,
  CommentsResponse 
} from '@/types/post';

// Query Keys
export const commentKeys = {
  all: ['comments'] as const,
  postComments: (postId: string) => [...commentKeys.all, 'post', postId] as const,
  comment: (commentId: string) => [...commentKeys.all, 'detail', commentId] as const,
};

// Hook: 获取帖子评论
export function usePostComments(query: CommentsQuery) {
  return useQuery({
    queryKey: commentKeys.postComments(query.postId),
    queryFn: () => mockApi.comments.getPostComments(query),
    staleTime: 3 * 60 * 1000, // 3分钟
    cacheTime: 10 * 60 * 1000, // 10分钟
    enabled: !!query.postId,
  });
}

// Hook: 创建评论
export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (commentData: CreateCommentRequest) => {
      if (!user) {
        throw new Error('User must be authenticated to create comments');
      }
      return mockApi.comments.createComment(user.id, commentData);
    },
    onMutate: async (newCommentData) => {
      // 取消当前进行的查询以避免乐观更新被覆盖
      await queryClient.cancelQueries({ 
        queryKey: commentKeys.postComments(newCommentData.postId) 
      });

      // 获取当前评论数据的快照
      const previousComments = queryClient.getQueryData<CommentsResponse>(
        commentKeys.postComments(newCommentData.postId)
      );

      // 乐观更新：立即添加新评论
      if (previousComments && user) {
        const optimisticComment: Comment = {
          id: `temp-${Date.now()}`,
          postId: newCommentData.postId,
          authorId: user.id,
          content: newCommentData.content,
          parentId: newCommentData.parentId,
          likesCount: 0,
          repliesCount: 0,
          depth: newCommentData.parentId ? 1 : 0, // 简化深度计算
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isEdited: false,
          isDeleted: false,
          isLikedByCurrentUser: false,
          author: user,
          replies: [],
        };

        // 如果是顶级评论，直接添加到列表
        if (!newCommentData.parentId) {
          queryClient.setQueryData<CommentsResponse>(
            commentKeys.postComments(newCommentData.postId),
            (old) => {
              if (!old) return old;
              return {
                ...old,
                comments: [optimisticComment, ...old.comments],
                total: old.total + 1,
              };
            }
          );
        } else {
          // 如果是回复，需要找到父评论并添加到其replies中
          queryClient.setQueryData<CommentsResponse>(
            commentKeys.postComments(newCommentData.postId),
            (old) => {
              if (!old) return old;
              
              const updateCommentReplies = (comments: Comment[]): Comment[] => {
                return comments.map(comment => {
                  if (comment.id === newCommentData.parentId) {
                    return {
                      ...comment,
                      replies: [...(comment.replies || []), optimisticComment],
                      repliesCount: comment.repliesCount + 1,
                    };
                  }
                  if (comment.replies && comment.replies.length > 0) {
                    return {
                      ...comment,
                      replies: updateCommentReplies(comment.replies),
                    };
                  }
                  return comment;
                });
              };

              return {
                ...old,
                comments: updateCommentReplies(old.comments),
                total: old.total + 1,
              };
            }
          );
        }
      }

      // 返回上下文用于错误回滚
      return { previousComments };
    },
    onError: (error, newCommentData, context) => {
      // 回滚乐观更新
      if (context?.previousComments) {
        queryClient.setQueryData(
          commentKeys.postComments(newCommentData.postId),
          context.previousComments
        );
      }

      toast({
        title: 'Failed to create comment',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    },
    onSuccess: (newComment) => {
      // 用真实数据替换乐观更新的临时数据
      queryClient.setQueryData<CommentsResponse>(
        commentKeys.postComments(newComment.postId),
        (old) => {
          if (!old) return old;
          
          const replaceOptimisticComment = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id.startsWith('temp-')) {
                return newComment;
              }
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: replaceOptimisticComment(comment.replies),
                };
              }
              return comment;
            });
          };

          return {
            ...old,
            comments: replaceOptimisticComment(old.comments),
          };
        }
      );

      // 更新帖子的评论数（如果帖子数据在缓存中）
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: any) => {
          if (oldData?.posts) {
            return {
              ...oldData,
              posts: oldData.posts.map((post: any) => 
                post.id === newComment.postId 
                  ? { ...post, repliesCount: post.repliesCount + 1 }
                  : post
              ),
            };
          }
          return oldData;
        }
      );

      toast({
        title: 'Comment posted!',
        description: 'Your comment has been added successfully.',
      });
    },
  });
}

// Hook: 更新评论
export function useUpdateComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ commentId, updateData }: { commentId: string; updateData: UpdateCommentRequest }) => {
      if (!user) {
        throw new Error('User must be authenticated to update comments');
      }
      return mockApi.comments.updateComment(commentId, user.id, updateData);
    },
    onSuccess: (updatedComment) => {
      // 更新所有相关的查询缓存
      queryClient.setQueriesData(
        { queryKey: commentKeys.all },
        (oldData: any) => {
          if (oldData?.comments) {
            const updateCommentInList = (comments: Comment[]): Comment[] => {
              return comments.map(comment => {
                if (comment.id === updatedComment.id) {
                  return updatedComment;
                }
                if (comment.replies && comment.replies.length > 0) {
                  return {
                    ...comment,
                    replies: updateCommentInList(comment.replies),
                  };
                }
                return comment;
              });
            };

            return {
              ...oldData,
              comments: updateCommentInList(oldData.comments),
            };
          }
          return oldData;
        }
      );

      toast({
        title: 'Comment updated!',
        description: 'Your comment has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update comment',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Hook: 删除评论
export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ commentId, postId }: { commentId: string; postId: string }) => {
      if (!user) {
        throw new Error('User must be authenticated to delete comments');
      }
      return mockApi.comments.deleteComment(commentId, user.id);
    },
    onSuccess: (_, { commentId, postId }) => {
      // 从评论列表中移除已删除的评论
      queryClient.setQueryData<CommentsResponse>(
        commentKeys.postComments(postId),
        (old) => {
          if (!old) return old;

          const removeDeletedComment = (comments: Comment[]): Comment[] => {
            return comments.filter(comment => {
              if (comment.id === commentId) {
                return false; // 移除已删除的评论
              }
              if (comment.replies && comment.replies.length > 0) {
                comment.replies = removeDeletedComment(comment.replies);
              }
              return true;
            });
          };

          return {
            ...old,
            comments: removeDeletedComment(old.comments),
            total: Math.max(0, old.total - 1),
          };
        }
      );

      // 更新帖子的评论数
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: any) => {
          if (oldData?.posts) {
            return {
              ...oldData,
              posts: oldData.posts.map((post: any) => 
                post.id === postId 
                  ? { ...post, repliesCount: Math.max(0, post.repliesCount - 1) }
                  : post
              ),
            };
          }
          return oldData;
        }
      );

      toast({
        title: 'Comment deleted!',
        description: 'Your comment has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete comment',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Hook: 点赞评论
export function useLikeComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
      if (!user) {
        throw new Error('User must be authenticated to like comments');
      }
      return mockApi.comments.likeComment(commentId, user.id);
    },
    onMutate: async ({ commentId, isLiked }) => {
      // 乐观更新
      const updateCommentLike = (comment: Comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLikedByCurrentUser: !isLiked,
            likesCount: isLiked ? comment.likesCount - 1 : comment.likesCount + 1,
          };
        }
        return comment;
      };

      // 更新所有相关的查询缓存
      queryClient.setQueriesData(
        { queryKey: commentKeys.all },
        (oldData: any) => {
          if (oldData?.comments) {
            const updateCommentsRecursively = (comments: Comment[]): Comment[] => {
              return comments.map(comment => {
                const updatedComment = updateCommentLike(comment);
                if (updatedComment.replies && updatedComment.replies.length > 0) {
                  updatedComment.replies = updateCommentsRecursively(updatedComment.replies);
                }
                return updatedComment;
              });
            };

            return {
              ...oldData,
              comments: updateCommentsRecursively(oldData.comments),
            };
          }
          return oldData;
        }
      );
    },
    onError: (error, { commentId, isLiked }) => {
      // 回滚乐观更新
      const revertCommentLike = (comment: Comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLikedByCurrentUser: isLiked,
            likesCount: isLiked ? comment.likesCount + 1 : comment.likesCount - 1,
          };
        }
        return comment;
      };

      queryClient.setQueriesData(
        { queryKey: commentKeys.all },
        (oldData: any) => {
          if (oldData?.comments) {
            const revertCommentsRecursively = (comments: Comment[]): Comment[] => {
              return comments.map(comment => {
                const revertedComment = revertCommentLike(comment);
                if (revertedComment.replies && revertedComment.replies.length > 0) {
                  revertedComment.replies = revertCommentsRecursively(revertedComment.replies);
                }
                return revertedComment;
              });
            };

            return {
              ...oldData,
              comments: revertCommentsRecursively(oldData.comments),
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
