import { ArrowLeft, MoreHorizontal, Calendar, Link as LinkIcon, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileTabs } from './ProfileTabs';
import { PinterestCard } from './PinterestCard';
import { EditPostDialog } from './EditPostDialog';
import { FollowButton } from './FollowButton';
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPosts, useLikePost, useBookmarkPost } from '@/hooks/usePosts';
import { useUser } from '@/hooks/useUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'react-router-dom';

export const ProfileMain = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('posts');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  
  // 确定要查看的用户ID：URL参数中的userId或当前登录用户的ID
  const targetUserId = userId || currentUser?.id || '';
  const isOwnProfile = !userId || userId === currentUser?.id;
  
  // 获取目标用户信息
  const { 
    data: profileUser, 
    isLoading: userLoading 
  } = useUser(targetUserId);
  
  // 使用目标用户的ID获取帖子
  const { 
    data: userPostsData, 
    isLoading: postsLoading 
  } = useUserPosts({ 
    userId: targetUserId,
  });
  
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

  // 排序和统计帖子
  const { sortedPosts, topStats } = useMemo(() => {
    if (!userPostsData?.posts) {
      return { sortedPosts: [], topStats: [] };
    }

    // 排序帖子
    const sorted = [...userPostsData.posts].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          return b.likesCount - a.likesCount;
        default:
          return 0;
      }
    });

    // 统计帖子类型
    const stats: { [key: string]: number } = {};
    
    userPostsData.posts.forEach(post => {
      // 统计App分类
      if (post.app?.category) {
        stats[`${post.app.category}`] = (stats[`${post.app.category}`] || 0) + 1;
      }
      
      // 统计Relationship类型
      if (post.relationship) {
        stats[post.relationship] = (stats[post.relationship] || 0) + 1;
      }
      
      // 统计Feelings (如果有的话)
      if (post.feelings && post.feelings.length > 0) {
        post.feelings.forEach(feeling => {
          stats[feeling] = (stats[feeling] || 0) + 1;
        });
      }
    });

    // 获取前三项统计
    const topThree = Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));

    return { sortedPosts: sorted, topStats: topThree };
  }, [userPostsData?.posts, sortBy]);

  // 如果是查看自己的Profile但未登录，显示登录提示
  if (isOwnProfile && !currentUser) {
    return (
      <div className="flex-1 border-r border-border">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Profile Access Required</h2>
            <p className="text-muted-foreground mb-4">Please log in to view your profile</p>
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 如果正在加载用户信息
  if (userLoading) {
    return (
      <div className="flex-1 border-r border-border">
        <div className="p-4">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  // 如果用户不存在
  if (!profileUser) {
    return (
      <div className="flex-1 border-r border-border">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">User Not Found</h2>
            <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist</p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 border-r border-border">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-8">
        <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-nav-hover rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            {profileUser.displayName}
            {profileUser.verified && (
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs">✓</span>
              </div>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">{profileUser.postsCount || 0} posts</p>
        </div>
      </div>

      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/70 text-sm">make a dent in the universe.</span>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        {/* Avatar and Actions */}
        <div className="flex justify-between items-start mb-4">
          <div className="relative -mt-16">
            <img
              src={profileUser.avatar}
              alt={profileUser.displayName}
              className="w-32 h-32 rounded-full border-4 border-background"
            />
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <Button variant="ghost" size="sm" className="p-2 h-auto border border-border hover:bg-nav-hover rounded-full">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 h-auto border border-border hover:bg-nav-hover rounded-full">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"/>
              </svg>
            </Button>
            <Button variant="ghost" size="sm" className="p-2 h-auto border border-border hover:bg-nav-hover rounded-full">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
              </svg>
            </Button>
            {isOwnProfile ? (
              <Button className="bg-foreground text-background hover:bg-foreground/90 font-bold px-6 rounded-full">
                Edit Profile
              </Button>
            ) : (
              <FollowButton targetUserId={profileUser.id} />
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {profileUser.displayName}
              {profileUser.verified && (
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
              )}
            </h2>
            <p className="text-muted-foreground">@{profileUser.username}</p>
          </div>

          <div className="space-y-2">
            {profileUser.bio && (
              <p className="text-foreground">
                {profileUser.bio}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {profileUser.website && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                <span className="text-primary">{profileUser.website}</span>
              </div>
            )}
            {/* {currentUser.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{currentUser.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(currentUser.createdAt).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}</span>
            </div> */}
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="font-bold text-foreground">{profileUser.followingCount || 0}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </div>
            <div>
              <span className="font-bold text-foreground">{profileUser.followersCount || 0}</span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </div>
          </div>

          {/* Top Categories */}
          {topStats.length > 0 && (
            <div className="pt-2">
              <h4 className="text-sm font-medium text-foreground mb-2">Top Categories</h4>
              <div className="flex flex-wrap gap-2">
                {topStats.map(({ category, count }) => (
                  <div 
                    key={category}
                    className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium"
                  >
                    {category} ({count})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex -space-x-1">
              <img src="https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=20&h=20&fit=crop&crop=face" alt="" className="w-5 h-5 rounded-full border border-background" />
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=20&h=20&fit=crop&crop=face" alt="" className="w-5 h-5 rounded-full border border-background" />
            </div>
            <span>Followed by Dominik, lily, and 42 others you follow</span>
          </div> */}
        </div>
      </div>

      {/* Profile Tabs */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Posts */}
      <div className="p-4">
        {/* Sort Options */}
        {activeTab === 'posts' && userPostsData?.posts && userPostsData.posts.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Posts ({userPostsData.posts.length})</h3>
            <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'popular') => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="popular">Most liked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {postsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-card rounded-2xl overflow-hidden shadow-sm h-80 flex flex-col">
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
            ))}
          </div>
        ) : sortedPosts && sortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPosts.map((post) => (
              <div key={post.id} className="break-inside-avoid relative group">
                <PinterestCard 
                  post={post} 
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                />
                {/* Edit button for own posts */}
                {isOwnProfile && (
                  <div className="absolute top-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <EditPostDialog post={{ 
                      id: post.id, 
                      content: post.content, 
                      relationship: post.relationship, 
                      feelings: post.feelings 
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4">
              Start sharing your stories with the world!
            </p>
            <Button onClick={() => window.location.href = '/share'}>
              Create Your First Post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};