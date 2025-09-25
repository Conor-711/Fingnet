import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PinterestCard } from './PinterestCard';
import { FeedFilterBar, type FeedFilters } from './FeedFilterBar';
import { useFeedPosts, useLikePost, useBookmarkPost } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/lib/mockApi';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 骨架屏组件
const PostSkeleton = () => (
  <div className="bg-card rounded-2xl overflow-hidden shadow-sm h-80 flex flex-col">
    <div className="h-48 p-4">
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
    <div className="p-3 flex-1 flex flex-col justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="mt-2">
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
  </div>
);

export const MainFeed = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 从URL读取筛选状态，包括专门的Dating和AI页面
  const getFiltersFromURL = (): FeedFilters => {
    const urlApps = searchParams.get('apps')?.split(',').filter(Boolean) || [];
    
    // 检查是否是专门的Dating或AI页面
    const isDatingPage = urlApps.includes('Dating');
    const isAIPage = urlApps.includes('AI');
    
    return {
      relationships: searchParams.get('relationships')?.split(',').filter(Boolean) || [],
      apps: urlApps,
      feelings: searchParams.get('feelings')?.split(',').filter(Boolean) || [],
    };
  };

  // 筛选状态
  const [filters, setFilters] = useState<FeedFilters>(getFiltersFromURL);

  // 将筛选状态同步到URL
  const handleFiltersChange = (newFilters: FeedFilters) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams(searchParams);
    
    // 更新或移除筛选参数
    if (newFilters.relationships.length > 0) {
      params.set('relationships', newFilters.relationships.join(','));
    } else {
      params.delete('relationships');
    }
    
    if (newFilters.apps.length > 0) {
      params.set('apps', newFilters.apps.join(','));
    } else {
      params.delete('apps');
    }
    
    if (newFilters.feelings.length > 0) {
      params.set('feelings', newFilters.feelings.join(','));
    } else {
      params.delete('feelings');
    }
    
    setSearchParams(params);
  };

  // 监听URL变化并更新筛选状态
  useEffect(() => {
    const urlFilters = getFiltersFromURL();
    setFilters(urlFilters);
  }, [searchParams]);
  
  // 使用增强的feed，为登录用户显示关注内容，支持筛选
  const { 
    data: feedData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery<{posts: any[], hasMore: boolean}>({
    queryKey: ['posts', 'enhanced-feed', user?.id, filters],
    queryFn: () => mockApi.feed.getEnhancedFeed(user?.id, {
      relationships: filters.relationships,
      apps: filters.apps,
      feelings: filters.feelings,
    }),
    staleTime: 3 * 60 * 1000, // 3分钟
    gcTime: 10 * 60 * 1000, // 10分钟 (新版本使用gcTime替代cacheTime)
  });

  useEffect(() => {
    console.log('📡 Feed 查询参数更新:', {
      userId: user?.id,
      filters
    });
  }, [user?.id, filters]);

  useEffect(() => {
    if (feedData) {
      console.log('📦 Feed 数据更新:', {
        posts: feedData.posts?.map((post) => ({
          id: post.id,
          type: post.type,
          visibility: post.visibility,
          authorId: post.authorId,
          author: post.author?.displayName
        })),
        hasMore: feedData.hasMore,
        total: feedData.posts?.length || 0
      });
    }
  }, [feedData]);
  
  const likeMutation = useLikePost();
  const bookmarkMutation = useBookmarkPost();

  // 处理点赞
  const handleLike = (postId: string, isLiked: boolean) => {
    likeMutation.mutate({ postId, isLiked });
  };

  // 处理收藏
  const handleBookmark = (postId: string, isBookmarked: boolean) => {
    bookmarkMutation.mutate({ postId, isBookmarked });
  };

  // 处理刷新
  const handleRefresh = () => {
    refetch();
  };

  // 检查当前是否在专门页面
  const isDatingPage = filters.apps.includes('Dating');
  const isAIPage = filters.apps.includes('AI');
  const isSpecialPage = isDatingPage || isAIPage;

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900">

      {/* Content */}
      <div className="p-4">
        
        {/* 专门页面标题 */}
        {isSpecialPage && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              {isDatingPage && (
                <>
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">💕</span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">Dating Stories</h1>
                </>
              )}
              {isAIPage && (
                <>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">AI Conversations</h1>
                </>
              )}
            </div>
            <p className="text-muted-foreground">
              {isDatingPage && "Discover dating app conversations and experiences from the community"}
              {isAIPage && "Explore AI chatbot conversations and interactions"}
            </p>
          </div>
        )}

        {/* 筛选栏 - 只在非专门页面显示，或显示适配的筛选项 */}
        {!isSpecialPage && (
          <div className="mb-6">
            <FeedFilterBar 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              className="mb-4"
            />
          </div>
        )}

        {/* 专门页面的筛选栏 - 隐藏apps筛选，只显示其他筛选项 */}
        {isSpecialPage && (
          <div className="mb-6">
            <FeedFilterBar 
              filters={{
                relationships: filters.relationships,
                apps: [], // 隐藏apps筛选
                feelings: filters.feelings
              }}
              onFiltersChange={(newFilters) => {
                // 保持当前的apps筛选不变
                handleFiltersChange({
                  ...newFilters,
                  apps: filters.apps
                });
              }}
              className="mb-4"
              hideAppsFilter={true} // 新增prop来隐藏apps筛选
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load posts. Please try again.
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {feedData?.posts && (
          <>
            {feedData.posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share something with the community!
                </p>
                <Button onClick={() => window.location.href = '/share'}>
                  Create First Post
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {feedData.posts.map((post) => (
                  <PinterestCard 
                    key={post.id}
                    post={post} 
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {feedData.hasMore && (
              <div className="text-center mt-8">
                <Button variant="outline" onClick={() => {
                  // TODO: 实现分页加载
                  console.log('Load more posts');
                }}>
                  Load More Posts
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};