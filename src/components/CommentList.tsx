import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CommentItem } from './CommentItem';
import { usePostComments } from '@/hooks/useComments';
import { CommentsQuery } from '@/types/post';
import { AlertCircle, MessageCircle, RefreshCw } from 'lucide-react';

interface CommentListProps {
  postId: string;
  className?: string;
}

export const CommentList = ({ postId, className = '' }: CommentListProps) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [page, setPage] = useState(1);

  const query: CommentsQuery = {
    postId,
    page,
    limit: 20,
    sortBy,
    includeReplies: true,
  };

  const {
    data: commentsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = usePostComments(query);

  const handleSortChange = (newSortBy: 'newest' | 'oldest' | 'popular') => {
    setSortBy(newSortBy);
    setPage(1); // 重置到第一页
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleRefresh = () => {
    setPage(1);
    refetch();
  };

  // Loading skeleton
  const CommentSkeleton = () => (
    <div className="flex gap-3 p-3">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            Comments ({commentsData?.total || 0})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Selector */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load comments. Please try again.
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-2 h-6"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <CommentSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Comments List */}
      {commentsData && (
        <>
          {commentsData.comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="text-lg font-medium text-foreground mb-2">No comments yet</h4>
              <p className="text-muted-foreground">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {commentsData.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={postId}
                  level={0}
                  maxLevel={3}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {commentsData.hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="min-w-32"
              >
                {isLoading ? 'Loading...' : 'Load More Comments'}
              </Button>
            </div>
          )}

          {/* Comments Count Summary */}
          {commentsData.total > 0 && (
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              Showing {commentsData.comments.length} of {commentsData.total} comments
            </div>
          )}
        </>
      )}
    </div>
  );
};
