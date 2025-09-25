import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Post } from '@/types/post';

interface PinterestCardProps {
  post: Post;
  onLike?: (postId: string, isLiked: boolean) => void;
  onBookmark?: (postId: string, isBookmarked: boolean) => void;
}

export const PinterestCard = ({ post, onLike, onBookmark }: PinterestCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or other interactive elements
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/post/${post.id}`);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡，避免触发卡片点击
    if (post.author?.id) {
      navigate(`/profile/${post.author.id}`);
    }
  };



  return (
    <div 
      className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-80"
      onClick={handleCardClick}
    >
      {/* Card header - Text content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="flex items-start gap-2">
          {post.author?.avatar && (
            <img
              src={post.author.avatar}
              alt={post.author.displayName || post.author.username || 'User'}
              className="w-8 h-8 rounded-full flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              onClick={handleAvatarClick}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium text-foreground truncate">
                {post.author?.displayName || post.author?.username || 'Unknown User'}
              </p>
              {post.author?.verified && (
                <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
              )}
            </div>
            {/* Story字段显示 - 加粗 */}
            {post.content && (
              <p className="text-sm font-bold text-foreground mt-1 line-clamp-3">
                {post.content}
              </p>
            )}
            
            {/* 点赞数显示 */}
            <div className="flex items-center gap-1 mt-2">
              <Heart className={`w-3 h-3 ${post.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground">{post.likesCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cover image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        {post.images && post.images.length > 0 ? (
          <img 
            src={post.images[post.coverImageIndex || 0].url} 
            alt={post.images[post.coverImageIndex || 0].altText || "Post content"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="p-4 text-center">
            <p className="text-foreground font-medium leading-relaxed line-clamp-6">
              {post.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};