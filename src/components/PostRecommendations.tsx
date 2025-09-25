import { useFeedPosts } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types/post';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useMemo } from 'react';

interface PostRecommendationsProps {
  className?: string;
  maxPosts?: number;
  currentPostId?: string; // 当前帖子ID，用于排除
}

export const PostRecommendations = ({ 
  className = "",
  maxPosts = 3,
  currentPostId
}: PostRecommendationsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // 获取feed帖子作为推荐
  const { data: feedData, isLoading, error } = useFeedPosts();

  // 使用 useMemo 来稳定推荐列表，避免频繁重新计算
  const recommendedPosts = useMemo((): Post[] => {
    console.log('🔄 重新计算推荐帖子列表'); // 调试日志
    
    if (!feedData || !(feedData as any).posts || !Array.isArray((feedData as any).posts) || (feedData as any).posts.length === 0) {
      return [];
    }
    
    // 过滤掉当前帖子，只显示share类型的帖子
    const filteredPosts = ((feedData as any).posts as Post[]).filter(post => 
      post.id !== currentPostId && 
      post.type === 'share' &&
      post.images && post.images.length > 0 // 确保有图片
    );
    
    // 使用稳定的随机种子基于当前帖子ID
    const seed = currentPostId ? currentPostId.charCodeAt(0) : 42;
    
    // 创建伪随机函数，确保相同输入产生相同输出
    const seededRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };
    
    // 使用稳定的排序算法
    const shuffled = filteredPosts
      .map((post, index) => ({ post, sort: seededRandom(index) }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ post }) => post);
    
    console.log(`📋 推荐帖子: ${shuffled.length}个，当前帖子: ${currentPostId}`);
    return shuffled.slice(0, maxPosts);
  }, [feedData, currentPostId, maxPosts]); // 只有这些依赖变化时才重新计算

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  if (isLoading) {
    return (
      <div className={`bg-card rounded-2xl p-4 border border-border ${className}`}>
        <h3 className="text-lg font-bold mb-4">You might like</h3>
        <div className="space-y-3">
          {Array.from({ length: maxPosts }, (_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Failed to load post recommendations:', error);
    return null; // 静默失败，不影响页面其他部分
  }

  if (recommendedPosts.length === 0) {
    return null;
  }

  return (
    <div className={`bg-card rounded-2xl p-4 border border-border ${className}`}>
      <h3 className="text-lg font-bold mb-4">You might like</h3>
      <div className="space-y-3">
        {recommendedPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => handlePostClick(post.id)}
            className="flex gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors group"
          >
            {/* 帖子缩略图 */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {post.images && post.images.length > 0 && (
                <img
                  src={post.images[post.coverImageIndex || 0].thumbUrl || post.images[post.coverImageIndex || 0].url}
                  alt="Post thumbnail"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              )}
            </div>
            
            {/* 帖子信息 */}
            <div className="flex-1 min-w-0">
              {/* 帖子内容预览 */}
              <p className="text-sm font-medium text-foreground mb-1 overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {post.content || 'No content'}
              </p>
              
              {/* 作者和时间 */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>@{post.author?.username}</span>
                <span>{post.likesCount} likes</span>
                {/* <span>•</span> */}
                {/* <span>
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span> */}
              </div>
              
              {/* 互动数据 */}
              {/* <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>{post.likesCount} likes</span>
                <span>{post.repliesCount} comments</span>
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
