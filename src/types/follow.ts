import { User } from './auth';

// 关注关系
export interface Follow {
  id: string;
  followerId: string; // 关注者ID
  followingId: string; // 被关注者ID
  createdAt: string;
  
  // 关联数据（可选，用于展示）
  follower?: User;
  following?: User;
}

// 关注查询参数
export interface FollowQuery {
  userId: string;
  type: 'followers' | 'following';
  page?: number;
  limit?: number;
}

// 关注列表响应
export interface FollowResponse {
  users: User[];
  hasMore: boolean;
  total: number;
  page: number;
  limit: number;
}

// 关注统计
export interface FollowStats {
  followersCount: number;
  followingCount: number;
  mutualFollowsCount?: number; // 相互关注数（可选）
}

// 关注状态
export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean; // 对方是否关注我
  isMutual: boolean; // 是否相互关注
}

// 批量关注状态查询
export interface BatchFollowStatusQuery {
  targetUserIds: string[];
}

export interface BatchFollowStatusResponse {
  [userId: string]: FollowStatus;
}

// 用户推荐相关（简化版）
export interface UserRecommendation {
  user: User;
  reason: 'popular' | 'mutual_follows' | 'recent_activity';
  score: number;
  mutualFollowsCount?: number;
}
