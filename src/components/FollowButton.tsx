import { Button } from '@/components/ui/button';
import { useToggleFollow } from '@/hooks/useFollow';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, UserMinus, Users } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showIcon?: boolean;
  className?: string;
}

export const FollowButton = ({ 
  targetUserId, 
  size = 'default',
  variant = 'default',
  showIcon = true,
  className = "" 
}: FollowButtonProps) => {
  const { user, isAuthenticated } = useAuth();
  const { toggleFollow, isLoading, isFollowing, isMutual } = useToggleFollow(targetUserId);

  // 不显示按钮的情况
  if (!isAuthenticated || !user || user.id === targetUserId) {
    return null;
  }

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          {showIcon && <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
          {isFollowing ? 'Unfollowing...' : 'Following...'}
        </>
      );
    }

    if (isMutual) {
      return (
        <>
          {showIcon && <Users className="w-4 h-4" />}
          Following
        </>
      );
    }

    if (isFollowing) {
      return (
        <>
          {showIcon && <UserMinus className="w-4 h-4" />}
          Following
        </>
      );
    }

    return (
      <>
        {showIcon && <UserPlus className="w-4 h-4" />}
        Follow
      </>
    );
  };

  const getButtonVariant = () => {
    if (variant !== 'default') return variant;
    
    if (isFollowing) {
      return 'outline';
    }
    return 'default';
  };

  const getButtonClassName = () => {
    let baseClass = className;
    
    if (isMutual) {
      baseClass += ' border-primary bg-primary/5 text-primary hover:bg-primary/10';
    } else if (isFollowing) {
      baseClass += ' hover:bg-destructive hover:text-destructive-foreground hover:border-destructive';
    }
    
    return baseClass;
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      onClick={toggleFollow}
      disabled={isLoading}
      className={`gap-2 transition-all ${getButtonClassName()}`}
    >
      {getButtonContent()}
    </Button>
  );
};
