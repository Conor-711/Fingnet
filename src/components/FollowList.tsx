import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCard } from './UserCard';
import { useFollowers, useFollowing } from '@/hooks/useFollow';
import { FollowQuery } from '@/types/follow';
import { AlertCircle, Users, UserPlus } from 'lucide-react';

interface FollowListProps {
  userId: string;
  initialTab?: 'followers' | 'following';
  className?: string;
}

export const FollowList = ({ 
  userId, 
  initialTab = 'followers',
  className = ""
}: FollowListProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);

  const followersQuery: FollowQuery = {
    userId,
    type: 'followers',
    page: followersPage,
    limit: 20,
  };

  const followingQuery: FollowQuery = {
    userId,
    type: 'following',
    page: followingPage,
    limit: 20,
  };

  const {
    data: followersData,
    isLoading: followersLoading,
    error: followersError,
    refetch: refetchFollowers,
  } = useFollowers(followersQuery);

  const {
    data: followingData,
    isLoading: followingLoading,
    error: followingError,
    refetch: refetchFollowing,
  } = useFollowing(followingQuery);

  // 骨架屏组件
  const UserCardSkeleton = () => (
    <div className="p-4 bg-card rounded-lg border border-border">
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );

  const renderUserList = (
    data: typeof followersData,
    isLoading: boolean,
    error: any,
    refetch: () => void,
    page: number,
    setPage: (page: number) => void,
    emptyMessage: string,
    emptyIcon: React.ReactNode
  ) => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load users. Please try again.
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              className="ml-2 h-6"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (isLoading && page === 1) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <UserCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (!data || data.users.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-3">
            {emptyIcon}
          </div>
          <h4 className="text-lg font-medium text-foreground mb-2">
            {emptyMessage}
          </h4>
          <p className="text-muted-foreground">
            When users {activeTab === 'followers' ? 'follow this account' : 'are followed'}, they'll appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {data.users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            showFollowButton={true}
            showBio={true}
            size="default"
          />
        ))}

        {/* Load More Button */}
        {data.hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={isLoading}
              className="min-w-32"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}

        {/* Count Summary */}
        {data.total > 0 && (
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            Showing {data.users.length} of {data.total} users
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'followers' | 'following')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="followers" className="gap-2">
            <Users className="w-4 h-4" />
            Followers ({followersData?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="following" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Following ({followingData?.total || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="followers" className="mt-6">
          {renderUserList(
            followersData,
            followersLoading,
            followersError,
            refetchFollowers,
            followersPage,
            setFollowersPage,
            "No followers yet",
            <Users className="w-12 h-12 mx-auto" />
          )}
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          {renderUserList(
            followingData,
            followingLoading,
            followingError,
            refetchFollowing,
            followingPage,
            setFollowingPage,
            "Not following anyone yet",
            <UserPlus className="w-12 h-12 mx-auto" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
