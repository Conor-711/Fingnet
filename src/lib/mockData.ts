import { User } from '@/types/auth';
import { Post, PostImage, Comment } from '@/types/post';
import { Follow } from '@/types/follow';

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    displayName: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
    bio: 'Tech enthusiast and coffee lover ☕ Building amazing things with code.',
    website: 'https://johndoe.dev',
    location: 'San Francisco, CA',
    verified: true,
    isPrivate: false,
    followersCount: 1234,
    followingCount: 567,
    postsCount: 89,
    createdAt: '2023-01-15T08:00:00.000Z',
    updatedAt: '2024-12-01T10:30:00.000Z',
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=120&h=120&fit=crop&crop=face',
    bio: 'Designer & photographer 📸 Capturing moments and creating beautiful experiences.',
    website: 'https://janesmith.com',
    location: 'New York, NY',
    verified: false,
    isPrivate: false,
    followersCount: 892,
    followingCount: 234,
    postsCount: 156,
    createdAt: '2023-03-22T14:15:00.000Z',
    updatedAt: '2024-12-01T09:45:00.000Z',
  },
  {
    id: '3',
    username: 'tech_news',
    email: 'tech@example.com',
    displayName: 'Tech News',
    avatar: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=120&fit=crop&crop=face',
    bio: 'Latest tech news and insights 🚀 Keeping you updated with the tech world.',
    website: 'https://technews.com',
    location: 'Global',
    verified: true,
    isPrivate: false,
    followersCount: 15234,
    followingCount: 123,
    postsCount: 2341,
    createdAt: '2022-06-10T11:20:00.000Z',
    updatedAt: '2024-12-01T12:00:00.000Z',
  },
];

// 模拟帖子图片
const mockImages: PostImage[] = [
  {
    id: 'img1',
    url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
    thumbUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200&h=150&fit=crop',
    altText: 'Tech workspace',
    width: 400,
    height: 300,
    order: 1,
    displayPercent: 50, // 默认显示50%
  },
  {
    id: 'img2',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop',
    thumbUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=250&fit=crop',
    altText: 'Beautiful sunset',
    width: 400,
    height: 500,
    order: 1,
    displayPercent: 100, // 显示100%
  },
  {
    id: 'img3',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
    thumbUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=300&fit=crop',
    altText: 'Quantum computing',
    width: 400,
    height: 600,
    order: 1,
    displayPercent: 50, // 显示50%
  },
];

// 模拟帖子数据
export const mockPosts: Post[] = [
  {
    id: '1',
    authorId: '1',
    content: 'Just shipped a new feature! Really excited to see how users react to it. The development process was quite challenging but rewarding.',
    type: 'share',
    relationship: 'colleague',
    feelings: ['excited', 'grateful'],
    images: [mockImages[0]],
    coverImageIndex: 0, // 添加封面图片索引
    defaultDisplayPercent: 50, // 默认显示50%
    visibility: 'public',
    likesCount: 42,
    retweetsCount: 12,
    repliesCount: 8,
    bookmarksCount: 15,
    viewsCount: 234,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isEdited: false,
    author: mockUsers[0],
    isLikedByCurrentUser: false,
    isBookmarkedByCurrentUser: false,
    isRetweetedByCurrentUser: false,
  },
  {
    id: '2',
    authorId: '2',
    content: 'Beautiful sunset today! Sometimes you just need to take a moment to appreciate the simple things in life. 🌅',
    type: 'share',
    relationship: 'friends',
    feelings: ['happy', 'nostalgic'],
    images: [mockImages[1]],
    coverImageIndex: 0, // 添加封面图片索引
    defaultDisplayPercent: 100, // 默认显示100%
    visibility: 'public',
    likesCount: 128,
    retweetsCount: 34,
    repliesCount: 19,
    bookmarksCount: 45,
    viewsCount: 567,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isEdited: false,
    author: mockUsers[1],
    isLikedByCurrentUser: true,
    isBookmarkedByCurrentUser: false,
    isRetweetedByCurrentUser: false,
  },
  {
    id: '3',
    authorId: '3',
    content: 'Breaking: New breakthrough in quantum computing could revolutionize the industry. Researchers have developed a more stable quantum processor.',
    type: 'share',
    relationship: 'colleague',
    feelings: ['excited', 'insightful'],
    images: [mockImages[2]],
    coverImageIndex: 0, // 添加封面图片索引
    defaultDisplayPercent: 50, // 默认显示50%
    visibility: 'public',
    likesCount: 892,
    retweetsCount: 247,
    repliesCount: 156,
    bookmarksCount: 234,
    viewsCount: 3456,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isEdited: false,
    author: mockUsers[2],
    isLikedByCurrentUser: false,
    isBookmarkedByCurrentUser: true,
    isRetweetedByCurrentUser: false,
  },
  {
    id: '4',
    authorId: '1',
    content: 'Working on a personal project that I\'m really passionate about. Can\'t wait to share more details soon!',
    type: 'post',
    relationship: 'personal',
    feelings: ['motivated', 'excited'],
    images: [],
    coverImageIndex: 0, // 添加封面图片索引
    defaultDisplayPercent: 50, // 默认显示50%（无图片时无效）
    visibility: 'public',
    likesCount: 67,
    retweetsCount: 5,
    repliesCount: 12,
    bookmarksCount: 8,
    viewsCount: 156,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isEdited: false,
    author: mockUsers[0],
    isLikedByCurrentUser: false,
    isBookmarkedByCurrentUser: false,
    isRetweetedByCurrentUser: false,
  },
  {
    id: '5',
    authorId: '2',
    content: 'Private thoughts about my creative process and how I approach new design challenges.',
    type: 'memory',
    relationship: 'personal',
    feelings: ['thoughtful', 'introspective'],
    images: [],
    coverImageIndex: 0, // 添加封面图片索引
    defaultDisplayPercent: 50, // 默认显示50%（无图片时无效）
    visibility: 'private',
    likesCount: 0,
    retweetsCount: 0,
    repliesCount: 0,
    bookmarksCount: 1,
    viewsCount: 1,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isEdited: false,
    author: mockUsers[1],
    isLikedByCurrentUser: false,
    isBookmarkedByCurrentUser: false,
    isRetweetedByCurrentUser: false,
  },
];

// 模拟评论数据
export const mockComments: Comment[] = [
  // Post 1 的评论
  {
    id: 'comment-1',
    postId: 'post-1',
    authorId: '2', // Jane Smith
    content: 'This looks amazing! The attention to detail is incredible. Can\'t wait to see more of your work! 🎉',
    parentId: undefined,
    likesCount: 12,
    repliesCount: 2,
    depth: 0,
    createdAt: new Date('2024-07-22T11:30:00Z').toISOString(),
    updatedAt: new Date('2024-07-22T11:30:00Z').toISOString(),
    isEdited: false,
    isDeleted: false,
    isLikedByCurrentUser: false,
  },
  {
    id: 'comment-2',
    postId: 'post-1',
    authorId: '1', // John Doe (作者回复)
    content: 'Thank you so much! Really appreciate your kind words 😊',
    parentId: 'comment-1',
    likesCount: 5,
    repliesCount: 0,
    depth: 1,
    createdAt: new Date('2024-07-22T12:00:00Z').toISOString(),
    updatedAt: new Date('2024-07-22T12:00:00Z').toISOString(),
    isEdited: false,
    isDeleted: false,
    isLikedByCurrentUser: true,
  },
  {
    id: 'comment-3',
    postId: 'post-1',
    authorId: '3', // Tech News
    content: 'Agreed! This is exactly the kind of innovation we need in the industry.',
    parentId: 'comment-1',
    likesCount: 8,
    repliesCount: 0,
    depth: 1,
    createdAt: new Date('2024-07-22T13:15:00Z').toISOString(),
    updatedAt: new Date('2024-07-22T13:15:00Z').toISOString(),
    isEdited: false,
    isDeleted: false,
    isLikedByCurrentUser: false,
  },
  {
    id: 'comment-4',
    postId: 'post-1',
    authorId: '3', // Tech News
    content: 'We might feature this in our next newsletter. Would that be okay with you?',
    parentId: undefined,
    likesCount: 3,
    repliesCount: 1,
    depth: 0,
    createdAt: new Date('2024-07-22T14:00:00Z').toISOString(),
    updatedAt: new Date('2024-07-22T14:00:00Z').toISOString(),
    isEdited: false,
    isDeleted: false,
    isLikedByCurrentUser: false,
  },
  {
    id: 'comment-5',
    postId: 'post-1',
    authorId: '1', // John Doe
    content: 'Absolutely! That would be fantastic. Feel free to reach out if you need any additional information.',
    parentId: 'comment-4',
    likesCount: 2,
    repliesCount: 0,
    depth: 1,
    createdAt: new Date('2024-07-22T14:30:00Z').toISOString(),
    updatedAt: new Date('2024-07-22T14:30:00Z').toISOString(),
    isEdited: false,
    isDeleted: false,
    isLikedByCurrentUser: true,
  },
  
  // Post 2 的评论
  {
    id: 'comment-6',
    postId: 'post-2',
    authorId: '1', // John Doe
    content: 'Beautiful shot! The colors are absolutely stunning 📸',
    parentId: undefined,
    likesCount: 15,
    repliesCount: 1,
    depth: 0,
    createdAt: new Date('2024-07-22T16:00:00Z').toISOString(),
    updatedAt: new Date('2024-07-22T16:00:00Z').toISOString(),
    isEdited: false,
    isDeleted: false,
    isLikedByCurrentUser: true,
  },
  {
    id: 'comment-7',
    postId: 'post-2',
    authorId: '2', // Jane Smith (作者回复)
    content: 'Thanks John! I waited almost an hour for the perfect lighting 😅',
    parentId: 'comment-6',
    likesCount: 7,
    repliesCount: 0,
    depth: 1,
    createdAt: new Date('2024-07-22T16:30:00Z').toISOString(),
    updatedAt: new Date('2024-07-22T16:30:00Z').toISOString(),
    isEdited: false,
    isDeleted: false,
    isLikedByCurrentUser: false,
  },
  
  // Post 3 的评论
  {
    id: 'comment-8',
    postId: 'post-3',
    authorId: '2', // Jane Smith
    content: 'This is incredible news! Quantum computing is going to change everything.',
    parentId: undefined,
    likesCount: 25,
    repliesCount: 0,
    depth: 0,
    createdAt: new Date('2024-07-22T18:00:00Z').toISOString(),
    updatedAt: new Date('2024-07-22T18:00:00Z').toISOString(),
    isEdited: false,
    isDeleted: false,
    isLikedByCurrentUser: false,
  },
  {
    id: 'comment-9',
    postId: 'post-3',
    authorId: '1', // John Doe
    content: 'The implications for cryptography alone are mind-blowing. Can\'t wait to see how this develops.',
    parentId: undefined,
    likesCount: 18,
    repliesCount: 0,
    depth: 0,
    createdAt: new Date('2024-07-22T19:00:00Z').toISOString(),
    updatedAt: new Date('2024-07-22T19:00:00Z').toISOString(),
    isEdited: false,
    isDeleted: false,
    isLikedByCurrentUser: true,
  },
];

// 模拟关注关系数据
export const mockFollows: Follow[] = [
  // John Doe (用户1) 的关注关系
  {
    id: 'follow-1',
    followerId: '1', // John follows Jane
    followingId: '2',
    createdAt: new Date('2024-06-15T10:00:00Z').toISOString(),
  },
  {
    id: 'follow-2',
    followerId: '1', // John follows Tech News
    followingId: '3',
    createdAt: new Date('2024-06-20T14:30:00Z').toISOString(),
  },
  
  // Jane Smith (用户2) 的关注关系
  {
    id: 'follow-3',
    followerId: '2', // Jane follows John (相互关注)
    followingId: '1',
    createdAt: new Date('2024-06-16T09:15:00Z').toISOString(),
  },
  {
    id: 'follow-4',
    followerId: '2', // Jane follows Tech News
    followingId: '3',
    createdAt: new Date('2024-06-18T16:45:00Z').toISOString(),
  },
  
  // Tech News (用户3) 的关注关系
  {
    id: 'follow-5',
    followerId: '3', // Tech News follows Jane
    followingId: '2',
    createdAt: new Date('2024-06-22T11:20:00Z').toISOString(),
  },
  
  // 添加一些额外的关注关系来测试列表功能
  // 假设还有几个用户关注了我们的测试用户
  {
    id: 'follow-6',
    followerId: 'user-4', // 虚拟用户关注John
    followingId: '1',
    createdAt: new Date('2024-07-01T08:00:00Z').toISOString(),
  },
  {
    id: 'follow-7',
    followerId: 'user-5', // 虚拟用户关注John
    followingId: '1',
    createdAt: new Date('2024-07-02T12:30:00Z').toISOString(),
  },
  {
    id: 'follow-8',
    followerId: 'user-6', // 虚拟用户关注Jane
    followingId: '2',
    createdAt: new Date('2024-07-03T15:45:00Z').toISOString(),
  },
];

// 测试账号登录信息
export const testAccounts = [
  { email: 'john@example.com', password: 'password123', user: mockUsers[0] },
  { email: 'jane@example.com', password: 'password123', user: mockUsers[1] },
  { email: 'tech@example.com', password: 'password123', user: mockUsers[2] },
];
