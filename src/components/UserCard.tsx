import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FollowButton } from './FollowButton';
import { User } from '@/types/auth';
import { useNavigate } from 'react-router-dom';

interface UserCardProps {
  user: User;
  showFollowButton?: boolean;
  showBio?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const UserCard = ({ 
  user, 
  showFollowButton = true, 
  showBio = true,
  size = 'default',
  className = ""
}: UserCardProps) => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    navigate(`/profile/${user.username}`);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          avatar: 'w-10 h-10',
          name: 'text-sm',
          username: 'text-xs',
          bio: 'text-xs',
          button: 'sm' as const
        };
      case 'lg':
        return {
          container: 'p-6',
          avatar: 'w-16 h-16',
          name: 'text-lg',
          username: 'text-sm',
          bio: 'text-sm',
          button: 'default' as const
        };
      default:
        return {
          container: 'p-4',
          avatar: 'w-12 h-12',
          name: 'text-base',
          username: 'text-sm',
          bio: 'text-sm',
          button: 'sm' as const
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`bg-card rounded-lg border border-border hover:bg-muted/30 transition-colors ${sizeClasses.container} ${className}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Button
          variant="ghost"
          className="p-0 h-auto rounded-full"
          onClick={handleUserClick}
        >
          <Avatar className={sizeClasses.avatar}>
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback>
              {user.displayName[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            {/* Name and Username */}
            <div className="flex-1 min-w-0">
              <Button
                variant="ghost"
                className="p-0 h-auto font-normal text-left justify-start"
                onClick={handleUserClick}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`font-semibold truncate ${sizeClasses.name}`}>
                    {user.displayName}
                  </span>
                  {user.verified && (
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </div>
              </Button>
              <p className={`text-muted-foreground ${sizeClasses.username}`}>
                @{user.username}
              </p>
            </div>

            {/* Follow Button */}
            {showFollowButton && (
              <FollowButton 
                targetUserId={user.id} 
                size={sizeClasses.button}
                showIcon={size !== 'sm'}
              />
            )}
          </div>

          {/* Bio */}
          {showBio && user.bio && (
            <p className={`mt-2 text-foreground line-clamp-2 ${sizeClasses.bio}`}>
              {user.bio}
            </p>
          )}

          {/* Stats */}
          {size !== 'sm' && (
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">{user.followersCount}</span> followers
              </span>
              <span>
                <span className="font-medium text-foreground">{user.followingCount}</span> following
              </span>
              {user.postsCount > 0 && (
                <span>
                  <span className="font-medium text-foreground">{user.postsCount}</span> posts
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
