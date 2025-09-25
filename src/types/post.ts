import { User } from './auth';

// 帖子类型
export type PostType = 'share' | 'post' | 'memory';

// App相关类型定义
export interface AppCategory {
  name: string;        // 子分类名称
  apps: AppOption[];   // 该分类下的具体应用
}

export interface AppOption {
  name: string;        // 应用名称
  value: string;       // 应用值（用于存储）
  icon?: string;       // 可选的图标
}

export interface AppSelection {
  category: string;    // 选中的子分类
  app: string;         // 选中的具体应用
  displayName?: string; // 用于显示的名称
}

// 帖子可见性
export type PostVisibility = 'public' | 'followers' | 'private';

// 帖子图片
export interface PostImage {
  id: string;
  url: string;
  thumbUrl: string;
  altText?: string;
  width: number;
  height: number;
  order: number;
  displayPercent?: number; // 显示百分比: 25, 50, 75, 100
}

// 帖子数据模型
export interface Post {
  id: string;
  authorId: string;
  content: string;
  type: PostType;
  relationship?: string;
  feelings?: string[];
  app?: AppSelection;  // 应用选择
  images: PostImage[];
  coverImageIndex?: number; // 封面图片索引
  defaultDisplayPercent?: number; // 默认显示百分比，应用于所有图片 (25, 50, 75, 100)
  visibility: PostVisibility;
  
  // 互动数据
  likesCount: number;
  retweetsCount: number;
  repliesCount: number;
  bookmarksCount: number;
  viewsCount: number;
  
  // 元数据
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  editedAt?: string;
  
  // 关联数据（可选，用于展示）
  author?: User;
  isLikedByCurrentUser?: boolean;
  isBookmarkedByCurrentUser?: boolean;
  isRetweetedByCurrentUser?: boolean;
}

// 创建帖子请求
export interface CreatePostRequest {
  content: string;
  type: PostType;
  relationship?: string;
  feelings?: string[];
  app?: AppSelection;  // 应用选择
  images?: File[];     // 图片文件数组
  coverImageIndex?: number; // 封面图片索引
  defaultDisplayPercent?: number; // 默认显示百分比 (25, 50, 75, 100)
  imageDisplaySettings?: Array<{
    imageIndex: number;
    displayPercent: number;
  }>; // 为每张图片单独设置的显示百分比
}

// 更新帖子请求
export interface UpdatePostRequest {
  content?: string;
  relationship?: string;
  feelings?: string[];
  app?: AppSelection;  // 应用选择
  coverImageIndex?: number; // 封面图片索引
  defaultDisplayPercent?: number; // 默认显示百分比 (25, 50, 75, 100)
  imageDisplaySettings?: Array<{
    imageIndex: number;
    displayPercent: number;
  }>; // 为每张图片单独设置的显示百分比
}

// Feed查询参数
export interface FeedQuery {
  page?: number;
  limit?: number;
  type?: PostType | 'all';
  // 筛选条件
  relationships?: string[];  // 按关系类型筛选
  apps?: string[];          // 按应用筛选 (格式: "category-app")
  feelings?: string[];      // 按情感筛选
}

// 用户帖子查询参数
export interface UserPostsQuery {
  userId: string;
  page?: number;
  limit?: number;
  type?: PostType | 'all';
}

// 互动类型
export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Retweet {
  id: string;
  userId: string;
  postId: string;
  content?: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

// 评论系统类型定义
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string; // 父评论ID，用于嵌套回复
  likesCount: number;
  repliesCount: number;
  depth: number; // 嵌套深度，0为顶级评论
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  editedAt?: string;
  
  // 关联数据
  author?: User;
  isLikedByCurrentUser?: boolean;
  replies?: Comment[]; // 子评论数组
  
  // 可见性控制
  isDeleted: boolean;
  deletedAt?: string;
}

// 创建评论请求
export interface CreateCommentRequest {
  postId: string;
  content: string;
  parentId?: string; // 如果是回复，指定父评论ID
}

// 更新评论请求
export interface UpdateCommentRequest {
  content: string;
}

// 评论查询参数
export interface CommentsQuery {
  postId: string;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'popular';
  includeReplies?: boolean; // 是否包含嵌套回复
}

// 评论列表响应
export interface CommentsResponse {
  comments: Comment[];
  hasMore: boolean;
  total: number;
  page: number;
  limit: number;
}

// 评论点赞
export interface CommentLike {
  id: string;
  commentId: string;
  userId: string;
  createdAt: string;
}

// 评论统计
export interface CommentStats {
  totalComments: number;
  totalReplies: number;
  topLevelComments: number;
}
