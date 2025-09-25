import { UserCard } from './UserCard';
import { mockUsers } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';

interface UserRecommendationsProps {
  className?: string;
  maxUsers?: number;
}

export const UserRecommendations = ({ 
  className = "",
  maxUsers = 3 
}: UserRecommendationsProps) => {
  const { user } = useAuth();

  // 简单的推荐逻辑：推荐除了当前用户之外的其他用户
  const getRecommendedUsers = (): User[] => {
    if (!user) return mockUsers.slice(0, maxUsers);
    
    const otherUsers = mockUsers.filter(u => u.id !== user.id);
    return otherUsers.slice(0, maxUsers);
  };

  const recommendedUsers = getRecommendedUsers();

  if (recommendedUsers.length === 0) {
    return null;
  }

  return (
    <div className={`bg-card rounded-2xl p-4 border border-border ${className}`}>
      <h3 className="text-lg font-bold mb-4">You might like</h3>
      <div className="space-y-3">
        {recommendedUsers.map((recommendedUser) => (
          <UserCard
            key={recommendedUser.id}
            user={recommendedUser}
            showFollowButton={true}
            showBio={false}
            size="sm"
            className="p-3 bg-transparent border-none hover:bg-muted/30"
          />
        ))}
      </div>
    </div>
  );
};
