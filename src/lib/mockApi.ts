import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  AuthTokens,
  UpdateProfileRequest,
  AvatarUploadRequest,
  AvatarUploadResponse
} from '@/types/auth';
import { 
  Post, 
  PostImage,
  CreatePostRequest, 
  FeedQuery, 
  UserPostsQuery,
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentsQuery,
  CommentsResponse 
} from '@/types/post';
import {
  Follow,
  FollowQuery,
  FollowResponse,
  FollowStats,
  FollowStatus,
  BatchFollowStatusQuery,
  BatchFollowStatusResponse
} from '@/types/follow';
import { mockUsers, mockPosts, mockComments, mockFollows, testAccounts } from './mockData';
import { indexedDBStore } from './indexedDBStorage';

// 模拟延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 生成模拟JWT token
function generateMockToken(userId: string): AuthTokens {
  const accessToken = `mock_access_token_${userId}_${Date.now()}`;
  const refreshToken = `mock_refresh_token_${userId}_${Date.now()}`;
  return { accessToken, refreshToken };
}

// 本地存储键名
const STORAGE_KEYS = {
  USERS: 'onlytext_users',
  POSTS: 'onlytext_posts', 
  COMMENTS: 'onlytext_comments',
  FOLLOWS: 'onlytext_follows',
  COMMENT_LIKES: 'onlytext_comment_likes'
};

// 内存存储（模拟数据库）with localStorage持久化
class MockDatabase {
  private users: User[] = [];
  private posts: Post[] = [];
  private comments: Comment[] = [];
  private follows: Follow[] = [];
  private commentLikes: Map<string, Set<string>> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  // 从localStorage加载数据
  private loadFromStorage() {
    try {
      // 加载用户数据
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = storedUsers ? JSON.parse(storedUsers) : [...mockUsers];

      // 加载帖子数据
      const storedPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
      this.posts = storedPosts ? JSON.parse(storedPosts) : [...mockPosts];

      // 加载评论数据
      const storedComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      this.comments = storedComments ? JSON.parse(storedComments) : [...mockComments];

      // 加载关注数据
      const storedFollows = localStorage.getItem(STORAGE_KEYS.FOLLOWS);
      this.follows = storedFollows ? JSON.parse(storedFollows) : [...mockFollows];

      // 加载评论点赞数据
      const storedCommentLikes = localStorage.getItem(STORAGE_KEYS.COMMENT_LIKES);
      if (storedCommentLikes) {
        const parsed = JSON.parse(storedCommentLikes);
        this.commentLikes = new Map(
          Object.entries(parsed).map(([key, value]: [string, any]) => [key, new Set(value)])
        );
      }

      console.log('📂 Onlytext: 数据加载完成', {
        posts: this.posts.length,
        users: this.users.length,
        dataUrlPosts: this.posts.filter(post => 
          post.images.some(img => img.url.startsWith('data:'))
        ).length,
        placeholderPosts: this.posts.filter(post => 
          post.images.some(img => img.url.includes('picsum.photos'))
        ).length
      });
    } catch (error) {
      console.error('❌ 从localStorage加载数据失败，使用默认数据:', error);
      this.users = [...mockUsers];
      this.posts = [...mockPosts];
      this.comments = [...mockComments];
      this.follows = [...mockFollows];
    }
  }

  // 保存数据到localStorage
  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      
      // 保存帖子数据，优先保存压缩版本的Data URL
      const postsForStorage = this.posts.map(post => ({
        ...post,
        images: post.images.map(img => {
          // 策略：尽量保存Data URL，只有在极端情况下才使用占位符
          let finalUrl = img.url;
          let finalThumbUrl = img.thumbUrl;
          
          // 更智能的图片保存策略：平衡质量与存储空间
          if (img.url.startsWith('data:') && img.url.length < 150000) {
            // 原始图片较小（150KB以下），保持原始质量
            finalUrl = img.url; 
            finalThumbUrl = img.thumbUrl.startsWith('data:') ? img.thumbUrl : img.url;
            console.log(`📸 图片 ${img.id} 保持原始质量 (${img.url.length} bytes)`);
          }
          // 如果原始图片较大但压缩版本合适，优先使用压缩版本
          else if (img.thumbUrl.startsWith('data:') && img.thumbUrl.length < 100000) {
            finalUrl = img.thumbUrl; // 使用压缩版本以节省空间
            finalThumbUrl = img.thumbUrl;
            console.log(`📸 图片 ${img.id} 使用压缩版本保存 (原始${img.url.length} -> 压缩${img.thumbUrl.length} bytes)`);
          }
          // 如果压缩版本仍然很大，但原始版本可接受，使用原始版本
          else if (img.url.startsWith('data:') && img.url.length < 250000) {
            finalUrl = img.url;
            finalThumbUrl = img.thumbUrl.startsWith('data:') ? img.thumbUrl : img.url;
            console.log(`📸 图片 ${img.id} 保持原始质量（压缩版本过大） (${img.url.length} bytes)`);
          }
          // 只有在所有Data URL都过大时才使用占位符
          else if (img.url.startsWith('data:')) {
            console.warn(`图片 ${img.id} 所有版本都过大 (原始${img.url.length}, 压缩${img.thumbUrl.length || 0} bytes)，使用占位符`);
            finalUrl = `https://picsum.photos/${img.width}/${img.height}?random=${img.id}`;
            finalThumbUrl = `https://picsum.photos/200/150?random=${img.id}`;
          }
          
          return {
            ...img,
            url: finalUrl,
            thumbUrl: finalThumbUrl,
          };
        })
      }));
      
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(postsForStorage));
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(this.comments));
      localStorage.setItem(STORAGE_KEYS.FOLLOWS, JSON.stringify(this.follows));
      
      // 保存评论点赞数据（Map转换为普通对象）
      const commentLikesObj = Object.fromEntries(
        Array.from(this.commentLikes.entries()).map(([key, value]) => [key, Array.from(value)])
      );
      localStorage.setItem(STORAGE_KEYS.COMMENT_LIKES, JSON.stringify(commentLikesObj));
      
      console.log('💾 Onlytext: 数据已持久化', {
        totalPosts: postsForStorage.length,
        dataUrlPosts: postsForStorage.filter(post => 
          post.images.some(img => img.url.startsWith('data:'))
        ).length,
        placeholderPosts: postsForStorage.filter(post => 
          post.images.some(img => img.url.includes('picsum.photos'))
        ).length
      });
    } catch (error) {
      console.error('❌ 保存数据到localStorage失败:', error);
      // 如果还是失败，尝试清除历史数据
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.log('🧹 尝试清理存储空间...');
        try {
          // 智能清理策略：保留最近的3个帖子，尽量保持用户上传的图片
          const recentPosts = this.posts.slice(-3).map(post => ({
            ...post,
            images: post.images.map(img => {
              // 优先保留用户上传的图片（Data URL），只压缩过大的图片
              if (img.url.startsWith('data:')) {
                // 如果原始图片不太大，保留原始质量
                if (img.url.length < 100000) { // 100KB以下保留原始
                  console.log(`🔒 清理时保留原始图片: ${img.id} (${img.url.length} bytes)`);
                  return {
                    ...img,
                    url: img.url,
                    thumbUrl: img.thumbUrl.startsWith('data:') ? img.thumbUrl : img.url,
                  };
                }
                // 如果原始图片较大但有压缩版本，使用压缩版本
                else if (img.thumbUrl.startsWith('data:') && img.thumbUrl.length < 80000) {
                  console.log(`🗜️ 清理时使用压缩版本: ${img.id} (原始${img.url.length} -> 压缩${img.thumbUrl.length} bytes)`);
                  return {
                    ...img,
                    url: img.thumbUrl, // 使用压缩版本作为主URL
                    thumbUrl: img.thumbUrl,
                  };
                }
                // 只有在Data URL极大且压缩版本也大时才用占位符
                else {
                  console.warn(`⚠️ 图片过大，使用占位符: ${img.id} (原始${img.url.length}, 压缩${img.thumbUrl.length || 0})`);
                  return {
                    ...img,
                    url: `https://picsum.photos/${img.width}/${img.height}?random=${img.id}`,
                    thumbUrl: `https://picsum.photos/200/150?random=${img.id}`,
                  };
                }
              }
              // 如果已经是外部链接，保持不变
              else {
                console.log(`🔗 保留外部链接: ${img.id}`);
                return img;
              }
            })
          }));
          
          // 更积极地清理评论数据
          const recentComments = this.comments.slice(-10);
          
          this.posts = recentPosts;
          this.comments = recentComments;
          
          localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(recentPosts));
          localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(recentComments));
          console.log('✅ 智能存储清理成功，保留最近3个帖子和10条评论，尽量保持用户图片');
        } catch (cleanupError) {
          console.error('❌ 存储清理也失败了:', cleanupError);
          // 最后的手段：清空localStorage
          console.log('🚨 执行紧急清理：清空所有localStorage数据');
          localStorage.clear();
        }
      }
    }
  }

  private sessions: Map<string, string> = new Map(); // token -> userId

  // 用户相关操作
  async findUserByEmail(email: string): Promise<User | null> {
    await delay(100);
    return this.users.find(user => user.email === email) || null;
  }

  async findUserById(id: string): Promise<User | null> {
    await delay(50);
    return this.users.find(user => user.id === id) || null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    await delay(50);
    return this.users.find(user => user.username === username) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    await delay(200);
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // 认证相关操作
  async createSession(userId: string): Promise<AuthTokens> {
    await delay(100);
    const tokens = generateMockToken(userId);
    this.sessions.set(tokens.accessToken, userId);
    return tokens;
  }

  async validateToken(token: string): Promise<string | null> {
    await delay(50);
    return this.sessions.get(token) || null;
  }

  async deleteSession(token: string): Promise<void> {
    await delay(50);
    this.sessions.delete(token);
  }

  // 用户Profile编辑相关方法
  async updateUserProfile(userId: string, updates: UpdateProfileRequest): Promise<User> {
    await delay(200);
    
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const user = this.users[userIndex];
    
    // 检查用户名是否已被其他用户使用
    if (updates.username && updates.username !== user.username) {
      const existingUser = this.users.find(u => u.username === updates.username && u.id !== userId);
      if (existingUser) {
        throw new Error('Username is already taken');
      }
    }

    // 更新用户信息
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.users[userIndex] = updatedUser;
    
    // 同时更新所有帖子中的作者信息（为了保持数据一致性）
    this.posts.forEach(post => {
      if (post.authorId === userId && post.author) {
        post.author = { ...post.author, ...updates };
      }
    });

    // 更新评论中的作者信息
    this.comments.forEach(comment => {
      if (comment.authorId === userId && comment.author) {
        comment.author = { ...comment.author, ...updates };
      }
    });

    return updatedUser;
  }

  async uploadAvatar(request: AvatarUploadRequest): Promise<AvatarUploadResponse> {
    await delay(1000); // 模拟上传时间
    
    const { file, userId } = request;
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload a valid image file');
    }
    
    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // 将用户上传的真实图片转换为Data URL
    const avatarUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

    // 直接更新用户头像（不使用updateUserProfile以避免循环调用）
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        avatar: avatarUrl,
        updatedAt: new Date().toISOString(),
      };

      // 同时更新帖子和评论中的作者信息
      this.posts.forEach(post => {
        if (post.authorId === userId && post.author) {
          post.author.avatar = avatarUrl;
        }
      });

      this.comments.forEach(comment => {
        if (comment.authorId === userId && comment.author) {
          comment.author.avatar = avatarUrl;
        }
      });

      // 保存更改到localStorage
      this.saveToStorage();
    }

    return {
      avatarUrl,
      message: 'Avatar uploaded successfully',
    };
  }

  // 验证用户名可用性
  async checkUsernameAvailability(username: string, currentUserId?: string): Promise<boolean> {
    await delay(100);
    
    const existingUser = this.users.find(u => u.username === username);
    
    // 如果没有找到用户，或者找到的是当前用户自己，则用户名可用
    return !existingUser || existingUser.id === currentUserId;
  }

  // 帖子相关操作
  async getFeedPosts(query: FeedQuery = {}): Promise<{ posts: Post[], hasMore: boolean }> {
    await delay(300);
    const { page = 1, limit = 10, type, relationships = [], apps = [], feelings = [] } = query;
    
    // 过滤出公共可见的share类型帖子
    let filteredPosts = this.posts.filter(post => 
      post.type === 'share' && post.visibility === 'public'
    );

    if (type && type !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.type === type);
    }

    // 应用筛选条件
    filteredPosts = this.applyFeedFilters(filteredPosts, { relationships, apps, feelings });

    // 按时间排序（最新在前）
    filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    return {
      posts: paginatedPosts,
      hasMore: endIndex < filteredPosts.length
    };
  }

  async getUserPosts(query: UserPostsQuery): Promise<{ posts: Post[], hasMore: boolean }> {
    await delay(200);
    const { userId, page = 1, limit = 10, type } = query;
    
    // 获取用户的帖子（post和share类型，memory类型只有作者可见）
    let userPosts = this.posts.filter(post => post.authorId === userId);

    if (type && type !== 'all') {
      userPosts = userPosts.filter(post => post.type === type);
    }

    // 按时间排序
    userPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = userPosts.slice(startIndex, endIndex);

    return {
      posts: paginatedPosts,
      hasMore: endIndex < userPosts.length
    };
  }

  async getPostById(postId: string): Promise<Post | null> {
    await delay(100);
    return this.posts.find(post => post.id === postId) || null;
  }

  // 图片处理方法：压缩并获取真实尺寸
  private async processImageFile(file: File): Promise<{
    dataUrl: string;
    width: number;
    height: number;
    compressedDataUrl: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // 创建FileReader读取原始文件
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          reject(new Error('Failed to read file'));
          return;
        }

        img.onload = () => {
          const originalWidth = img.naturalWidth;
          const originalHeight = img.naturalHeight;
          
          // 智能压缩：根据图片大小选择压缩级别
          let maxWidth = 800;
          let quality = 0.8;
          
          // 如果原始图片很大，使用更积极的压缩
          if (originalWidth > 1500 || originalHeight > 1500) {
            maxWidth = 600; // 更小的尺寸
            quality = 0.7;  // 稍低的质量
            console.log(`📏 大图片检测，使用积极压缩策略: 最大宽度${maxWidth}px, 质量${quality}`);
          }
          
          const scale = Math.min(maxWidth / originalWidth, maxWidth / originalHeight);
          const compressedWidth = Math.floor(originalWidth * scale);
          const compressedHeight = Math.floor(originalHeight * scale);
          
          // 绘制压缩图片
          canvas.width = compressedWidth;
          canvas.height = compressedHeight;
          ctx.drawImage(img, 0, 0, compressedWidth, compressedHeight);
          
          // 获取压缩后的Data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          console.log(`📸 图片压缩完成: ${originalWidth}x${originalHeight} -> ${compressedWidth}x${compressedHeight}, 质量${Math.round(quality*100)}%`);
          
          resolve({
            dataUrl: result, // 原始Data URL
            width: originalWidth,
            height: originalHeight,
            compressedDataUrl // 压缩Data URL
          });
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = result;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async createPost(authorId: string, postData: CreatePostRequest): Promise<Post> {
    await delay(300);
    
    
    // 模拟图片上传处理 - 使用Data URL确保图片持久化
    const images: PostImage[] = [];
    if (postData.images && postData.images.length > 0) {
      for (let index = 0; index < postData.images.length; index++) {
        const file = postData.images[index];
        
        // 压缩图片并获取真实尺寸
        const { dataUrl, width, height, compressedDataUrl } = await this.processImageFile(file);
        
        // 获取该图片的displayPercent设置
        const imageDisplaySetting = postData.imageDisplaySettings?.find(setting => setting.imageIndex === index);
        const displayPercent = imageDisplaySetting?.displayPercent || postData.defaultDisplayPercent || 50;

        console.log(`🖼️ 处理图片 ${index}:`, {
          originalSize: `${dataUrl.length} bytes`,
          compressedSize: `${compressedDataUrl.length} bytes`,
          dimensions: `${width}x${height}`,
          displayPercent: `${displayPercent}%`
        });

        images.push({
          id: `img_${Date.now()}_${index}`,
          url: dataUrl, // 原始质量（内存中使用）
          thumbUrl: compressedDataUrl, // 压缩版本（存储使用）
          altText: file.name,
          width: width,
          height: height,
          order: index + 1,
          displayPercent: displayPercent,
        });
      }
    }

    const author = await this.findUserById(authorId);
    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId,
      content: postData.content,
      type: postData.type,
      relationship: postData.relationship,
      feelings: postData.feelings,
      app: postData.app,
      images,
      coverImageIndex: postData.coverImageIndex || 0, // 保存封面图片索引，默认为0
      defaultDisplayPercent: postData.defaultDisplayPercent || 50, // 保存默认显示百分比
      visibility: postData.type === 'memory' ? 'private' : 'public',
      likesCount: 0,
      retweetsCount: 0,
      repliesCount: 0,
      bookmarksCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      author,
      isLikedByCurrentUser: false,
      isBookmarkedByCurrentUser: false,
      isRetweetedByCurrentUser: false,
    };

    this.posts.push(newPost);
    
    
    // 更新用户帖子数量
    if (author) {
      author.postsCount += 1;
    }

    // 保存到localStorage
    this.saveToStorage();

    return newPost;
  }

  // 评论相关操作
  async getPostComments(query: CommentsQuery): Promise<CommentsResponse> {
    await delay(200);
    const { postId, page = 1, limit = 20, sortBy = 'newest', includeReplies = true } = query;
    
    // 获取指定帖子的所有评论
    let postComments = this.comments.filter(comment => 
      comment.postId === postId && !comment.isDeleted
    );

    // 排序
    switch (sortBy) {
      case 'newest':
        postComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        postComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        postComments.sort((a, b) => b.likesCount - a.likesCount);
        break;
    }

    // 构建嵌套结构
    const topLevelComments = postComments.filter(comment => !comment.parentId);
    
    if (includeReplies) {
      for (const comment of topLevelComments) {
        comment.replies = this.buildCommentReplies(comment.id, postComments);
      }
    }

    // 分页（只对顶级评论分页）
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = topLevelComments.slice(startIndex, endIndex);

    // 添加作者信息
    for (const comment of paginatedComments) {
      comment.author = this.users.find(user => user.id === comment.authorId);
      this.attachAuthorToReplies(comment.replies || []);
    }

    return {
      comments: paginatedComments,
      hasMore: endIndex < topLevelComments.length,
      total: topLevelComments.length,
      page,
      limit
    };
  }

  private buildCommentReplies(parentId: string, allComments: Comment[]): Comment[] {
    const replies = allComments.filter(comment => comment.parentId === parentId);
    
    for (const reply of replies) {
      reply.replies = this.buildCommentReplies(reply.id, allComments);
    }
    
    return replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  private attachAuthorToReplies(replies: Comment[]): void {
    for (const reply of replies) {
      reply.author = this.users.find(user => user.id === reply.authorId);
      if (reply.replies) {
        this.attachAuthorToReplies(reply.replies);
      }
    }
  }

  async createComment(authorId: string, commentData: CreateCommentRequest): Promise<Comment> {
    await delay(300);
    
    const author = this.users.find(user => user.id === authorId);
    if (!author) {
      throw new Error('Author not found');
    }

    const post = this.posts.find(p => p.id === commentData.postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // 确定评论深度
    let depth = 0;
    if (commentData.parentId) {
      const parentComment = this.comments.find(c => c.id === commentData.parentId);
      if (!parentComment) {
        throw new Error('Parent comment not found');
      }
      depth = parentComment.depth + 1;
      
      // 限制嵌套深度
      if (depth > 3) {
        throw new Error('Maximum comment depth exceeded');
      }
    }

    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      postId: commentData.postId,
      authorId,
      content: commentData.content,
      parentId: commentData.parentId,
      likesCount: 0,
      repliesCount: 0,
      depth,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false,
      isLikedByCurrentUser: false,
      author
    };

    this.comments.push(newComment);

    // 更新帖子评论数
    post.repliesCount += 1;

    // 更新父评论的回复数
    if (commentData.parentId) {
      const parentComment = this.comments.find(c => c.id === commentData.parentId);
      if (parentComment) {
        parentComment.repliesCount += 1;
      }
    }

    return newComment;
  }

  async updateComment(commentId: string, userId: string, updateData: UpdateCommentRequest): Promise<Comment> {
    await delay(200);
    
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new Error('Unauthorized to update this comment');
    }

    if (comment.isDeleted) {
      throw new Error('Cannot update deleted comment');
    }

    comment.content = updateData.content;
    comment.updatedAt = new Date().toISOString();
    comment.isEdited = true;
    comment.editedAt = new Date().toISOString();

    return comment;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    await delay(200);
    
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new Error('Unauthorized to delete this comment');
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date().toISOString();

    // 减少帖子评论数
    const post = this.posts.find(p => p.id === comment.postId);
    if (post) {
      post.repliesCount -= 1;
    }

    // 减少父评论的回复数
    if (comment.parentId) {
      const parentComment = this.comments.find(c => c.id === comment.parentId);
      if (parentComment) {
        parentComment.repliesCount -= 1;
      }
    }
  }

  async likeComment(commentId: string, userId: string): Promise<boolean> {
    await delay(150);
    
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (!this.commentLikes.has(commentId)) {
      this.commentLikes.set(commentId, new Set());
    }

    const likes = this.commentLikes.get(commentId)!;
    const isCurrentlyLiked = likes.has(userId);

    if (isCurrentlyLiked) {
      likes.delete(userId);
      comment.likesCount -= 1;
      comment.isLikedByCurrentUser = false;
    } else {
      likes.add(userId);
      comment.likesCount += 1;
      comment.isLikedByCurrentUser = true;
    }

    return !isCurrentlyLiked;
  }

  // 关注相关操作
  async followUser(followerId: string, targetUserId: string): Promise<Follow> {
    await delay(200);
    
    // 检查用户是否存在
    const follower = this.users.find(u => u.id === followerId);
    const target = this.users.find(u => u.id === targetUserId);
    
    if (!follower || !target) {
      throw new Error('User not found');
    }
    
    if (followerId === targetUserId) {
      throw new Error('Cannot follow yourself');
    }
    
    // 检查是否已经关注
    const existingFollow = this.follows.find(f => 
      f.followerId === followerId && f.followingId === targetUserId
    );
    
    if (existingFollow) {
      throw new Error('Already following this user');
    }
    
    // 创建新的关注关系
    const newFollow: Follow = {
      id: `follow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      followerId,
      followingId: targetUserId,
      createdAt: new Date().toISOString(),
      follower,
      following: target,
    };
    
    this.follows.push(newFollow);
    
    // 更新用户统计数据
    follower.followingCount += 1;
    target.followersCount += 1;
    
    return newFollow;
  }

  async unfollowUser(followerId: string, targetUserId: string): Promise<void> {
    await delay(200);
    
    const followIndex = this.follows.findIndex(f => 
      f.followerId === followerId && f.followingId === targetUserId
    );
    
    if (followIndex === -1) {
      throw new Error('Not following this user');
    }
    
    // 移除关注关系
    this.follows.splice(followIndex, 1);
    
    // 更新用户统计数据
    const follower = this.users.find(u => u.id === followerId);
    const target = this.users.find(u => u.id === targetUserId);
    
    if (follower) {
      follower.followingCount = Math.max(0, follower.followingCount - 1);
    }
    if (target) {
      target.followersCount = Math.max(0, target.followersCount - 1);
    }
  }

  async getFollowStatus(currentUserId: string, targetUserId: string): Promise<FollowStatus> {
    await delay(100);
    
    const isFollowing = this.follows.some(f => 
      f.followerId === currentUserId && f.followingId === targetUserId
    );
    
    const isFollowedBy = this.follows.some(f => 
      f.followerId === targetUserId && f.followingId === currentUserId
    );
    
    return {
      isFollowing,
      isFollowedBy,
      isMutual: isFollowing && isFollowedBy,
    };
  }

  async getFollowers(query: FollowQuery): Promise<FollowResponse> {
    await delay(200);
    const { userId, page = 1, limit = 20 } = query;
    
    // 获取关注该用户的所有关注关系
    const followerRelations = this.follows.filter(f => f.followingId === userId);
    
    // 按时间排序（最新关注在前）
    followerRelations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRelations = followerRelations.slice(startIndex, endIndex);
    
    // 获取关注者用户信息
    const users = paginatedRelations.map(relation => {
      const user = this.users.find(u => u.id === relation.followerId);
      return user!;
    }).filter(Boolean);
    
    return {
      users,
      hasMore: endIndex < followerRelations.length,
      total: followerRelations.length,
      page,
      limit,
    };
  }

  async getFollowing(query: FollowQuery): Promise<FollowResponse> {
    await delay(200);
    const { userId, page = 1, limit = 20 } = query;
    
    // 获取该用户关注的所有关注关系
    const followingRelations = this.follows.filter(f => f.followerId === userId);
    
    // 按时间排序（最新关注在前）
    followingRelations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRelations = followingRelations.slice(startIndex, endIndex);
    
    // 获取被关注者用户信息
    const users = paginatedRelations.map(relation => {
      const user = this.users.find(u => u.id === relation.followingId);
      return user!;
    }).filter(Boolean);
    
    return {
      users,
      hasMore: endIndex < followingRelations.length,
      total: followingRelations.length,
      page,
      limit,
    };
  }

  async getFollowStats(userId: string): Promise<FollowStats> {
    await delay(50);
    
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      followersCount: user.followersCount,
      followingCount: user.followingCount,
    };
  }

  async batchGetFollowStatus(currentUserId: string, targetUserIds: string[]): Promise<BatchFollowStatusResponse> {
    await delay(150);
    
    const result: BatchFollowStatusResponse = {};
    
    for (const targetUserId of targetUserIds) {
      result[targetUserId] = await this.getFollowStatus(currentUserId, targetUserId);
    }
    
    return result;
  }

  // 应用Feed筛选条件
  private applyFeedFilters(posts: Post[], filters: {
    relationships: string[];
    apps: string[];
    feelings: string[];
  }): Post[] {
    const { relationships, apps, feelings } = filters;
    
    return posts.filter(post => {
      // 关系类型筛选
      if (relationships.length > 0 && post.relationship) {
        if (!relationships.includes(post.relationship)) {
          return false;
        }
      }
      
      // 应用筛选
      if (apps.length > 0 && post.app) {
        const postAppKey = `${post.app.category.toLowerCase().replace(/\s+/g, '-')}-${post.app.app}`;
        if (!apps.includes(postAppKey)) {
          return false;
        }
      }
      
      // 情感筛选
      if (feelings.length > 0 && post.feelings && post.feelings.length > 0) {
        const hasMatchingFeeling = post.feelings.some(feeling => feelings.includes(feeling));
        if (!hasMatchingFeeling) {
          return false;
        }
      }
      
      return true;
    });
  }

  // 升级Feed获取方法，包含关注用户的内容和筛选功能
  async getEnhancedFeedPosts(userId?: string, query: FeedQuery = {}): Promise<{ posts: Post[], hasMore: boolean }> {
    await delay(300);
    const { page = 1, limit = 10, relationships = [], apps = [], feelings = [] } = query;
    
    let filteredPosts: Post[] = [];
    
    if (userId) {
      // 已登录用户：显示关注用户的内容 + 公共share内容
      const userFollowing = this.follows
        .filter(f => f.followerId === userId)
        .map(f => f.followingId);
      
      // 获取关注用户的share和post类型帖子
      const followingPosts = this.posts.filter(post => 
        userFollowing.includes(post.authorId) && 
        (post.type === 'share' || post.type === 'post')
      );
      
      // 获取所有公共share帖子
      const publicPosts = this.posts.filter(post => 
        post.type === 'share' && post.visibility === 'public'
      );
      
      // 合并并去重
      const allPosts = [...followingPosts, ...publicPosts];
      filteredPosts = allPosts.filter((post, index, self) => 
        index === self.findIndex(p => p.id === post.id)
      );
    } else {
      // 未登录用户：只显示公共share内容
      filteredPosts = this.posts.filter(post => 
        post.type === 'share' && post.visibility === 'public'
      );
    }
    
    // 应用筛选条件
    filteredPosts = this.applyFeedFilters(filteredPosts, { relationships, apps, feelings });
    
    // 按时间排序（最新在前）
    filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    
    // 添加作者信息
    const postsWithAuthors = paginatedPosts.map(post => ({
      ...post,
      author: this.users.find(user => user.id === post.authorId)
    }));
    
    return {
      posts: postsWithAuthors,
      hasMore: endIndex < filteredPosts.length
    };
  }

  // ======= 认证相关方法 =======
  
  // 用户认证
  async authenticateUser(credentials: LoginRequest) {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟
    
    try {
      let user: User | null = null;
      
      if (credentials.isGoogleAuth && credentials.googleUser) {
        // Google OAuth登录
        console.log('🔍 Processing Google OAuth login for:', credentials.googleUser.email);
        
        // 查找是否已有Google账号
        user = this.users.find(u => u.googleId === credentials.googleUser!.sub) || null;
        
        if (!user) {
          // 检查邮箱是否已被其他账号使用
          const existingUser = this.users.find(u => u.email === credentials.googleUser!.email);
          if (existingUser && !existingUser.googleId) {
            // 将现有账号绑定到Google
            existingUser.googleId = credentials.googleUser!.sub;
            existingUser.isGoogleAuth = true;
            existingUser.avatar = credentials.googleUser!.picture;
            user = existingUser;
            console.log('✅ Linked existing account to Google:', user.email);
          } else {
            // 创建新的Google用户
            user = await this.createGoogleUser(credentials.googleUser!);
            console.log('✅ Created new Google user:', user.email);
          }
          
          this.saveToStorage(); // 保存更改
          
          // 🔧 同步到IndexedDB（如果可用）
          try {
            const enhanced = await getEnhancedApi();
            if (enhanced && user) {
              // 使用内部方法直接保存用户到IndexedDB
              await indexedDBStore.saveUser(user);
              console.log('✅ Google用户已同步到IndexedDB:', user.email);
            }
          } catch (error) {
            console.warn('⚠️ 用户同步到IndexedDB失败:', error);
          }
        } else {
          console.log('✅ Found existing Google user:', user.email);
        }
      } else {
        // 传统邮箱/密码登录
        user = this.users.find(u => u.email === credentials.email) || null;
        
        if (!user) {
          throw new Error('Invalid email or password');
        }
        
        // 在实际应用中，这里应该验证密码哈希
        // 这里我们简化处理，假设密码验证通过
        console.log('✅ Email/password login successful for:', user.email);
      }
      
      if (!user) {
        throw new Error('Authentication failed');
      }
      
      // 生成tokens
      const tokens = this.generateTokens(user.id);
      
      return {
        user,
        tokens,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('❌ Authentication error:', error);
      throw error;
    }
  }
  
  // 创建Google用户
  private async createGoogleUser(googleUser: any): Promise<User> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const username = this.generateUniqueUsername(googleUser.given_name || googleUser.name);
    
    const newUser: User = {
      id: userId,
      username,
      email: googleUser.email,
      displayName: googleUser.name,
      avatar: googleUser.picture,
      bio: '',
      website: '',
      location: '',
      verified: false,
      isPrivate: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      googleId: googleUser.sub,
      isGoogleAuth: true,
    };
    
    this.users.push(newUser);
    return newUser;
  }
  
  // 生成唯一用户名
  private generateUniqueUsername(baseName: string): string {
    const cleanBaseName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = cleanBaseName;
    let counter = 1;
    
    while (this.users.some(u => u.username === username)) {
      username = `${cleanBaseName}${counter}`;
      counter++;
    }
    
    return username;
  }
  
  // 用户注册
  async registerUser(userData: RegisterRequest) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 检查用户名和邮箱是否已存在
    if (this.users.some(u => u.username === userData.username)) {
      throw new Error('Username already exists');
    }
    
    if (this.users.some(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newUser: User = {
      id: userId,
      username: userData.username,
      email: userData.email,
      displayName: userData.displayName,
      avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${userId}&size=200`,
      bio: '',
      website: '',
      location: '',
      verified: false,
      isPrivate: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.users.push(newUser);
    this.saveToStorage();
    
    const tokens = this.generateTokens(userId);
    
    return {
      user: newUser,
      tokens,
      message: 'Registration successful'
    };
  }
  
  // 验证认证令牌
  async validateAuthToken(token: string): Promise<User | null> {
    try {
      // 这里简化处理，从token中提取用户ID
      // 在实际应用中，应该使用JWT验证
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      const userId = payload.userId;
      
      const user = this.findUserById(userId);
      return user;
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }
  
  // 刷新认证令牌
  async refreshAuthToken(refreshToken: string) {
    const user = await this.validateAuthToken(refreshToken);
    if (!user) {
      throw new Error('Invalid refresh token');
    }
    
    return {
      tokens: this.generateTokens(user.id),
      user
    };
  }
  
  // 生成认证令牌
  private generateTokens(userId: string): AuthTokens {
    // 简化的JWT模拟
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      userId,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24小时
    }));
    const signature = btoa('mock_signature');
    
    const accessToken = `${header}.${payload}.${signature}`;
    const refreshToken = `${header}.${payload}.${btoa('refresh_mock_signature')}`;
    
    return {
      accessToken,
      refreshToken
    };
  }

}

// 全局数据库实例
const db = new MockDatabase();

// 检查是否应该使用增强存储系统
const shouldUseEnhancedStorage = () => {
  return 'indexedDB' in window && indexedDB !== null;
};

// 导入增强API（延迟导入避免循环依赖）
let enhancedApi: any = null;
const getEnhancedApi = async () => {
  if (!enhancedApi && shouldUseEnhancedStorage()) {
    try {
      const module = await import('./enhancedMockApi');
      enhancedApi = module.enhancedMockApi;
      console.log('🚀 已启用IndexedDB增强存储系统');
    } catch (error) {
      console.warn('⚠️ 增强存储系统加载失败，使用传统localStorage:', error);
    }
  }
  return enhancedApi;
};

// API接口实现 - 智能路由到增强版本或传统版本
export const mockApi = {

  posts: {
    async getFeed(query?: FeedQuery) {
      const enhanced = await getEnhancedApi();
      if (enhanced) {
        return await enhanced.posts.getFeed(query);
      }
      return await db.getFeedPosts(query);
    },

    async getUserPosts(query: UserPostsQuery) {
      const enhanced = await getEnhancedApi();
      if (enhanced) {
        return await enhanced.posts.getUserPosts(query);
      }
      return await db.getUserPosts(query);
    },

    async getPostById(postId: string) {
      const enhanced = await getEnhancedApi();
      if (enhanced) {
        return await enhanced.posts.getPostById(postId);
      }
      return await db.getPostById(postId);
    },

    async createPost(authorId: string, postData: CreatePostRequest) {
      const enhanced = await getEnhancedApi();
      if (enhanced) {
        console.log('📸 使用IndexedDB智能图片处理系统');
        return await enhanced.posts.createPost(authorId, postData);
      }
      console.log('📸 使用传统localStorage图片处理系统');
      return await db.createPost(authorId, postData);
    }
  },

  comments: {
    async getPostComments(query: CommentsQuery) {
      return await db.getPostComments(query);
    },

    async createComment(authorId: string, commentData: CreateCommentRequest) {
      return await db.createComment(authorId, commentData);
    },

    async updateComment(commentId: string, authorId: string, updateData: UpdateCommentRequest) {
      return await db.updateComment(commentId, authorId, updateData);
    },

    async deleteComment(commentId: string, authorId: string) {
      return await db.deleteComment(commentId, authorId);
    },

    async likeComment(commentId: string, userId: string) {
      return await db.likeComment(commentId, userId);
    }
  },

  users: {
    async getUserById(userId: string) {
      const enhanced = await getEnhancedApi();
      if (enhanced) {
        console.log('👤 使用IndexedDB用户查询系统');
        return await enhanced.users.getUserById(userId);
      }
      console.log('👤 使用传统localStorage用户查询系统');
      return await db.findUserById(userId);
    },

    async getUserByUsername(username: string) {
      const enhanced = await getEnhancedApi();
      if (enhanced) {
        console.log('👤 使用IndexedDB用户名查询系统');
        return await enhanced.users.getUserByUsername(username);
      }
      console.log('👤 使用传统localStorage用户名查询系统');
      return await db.findUserByUsername(username);
    }
  },

  follows: {
    async followUser(followerId: string, targetUserId: string) {
      return await db.followUser(followerId, targetUserId);
    },

    async unfollowUser(followerId: string, targetUserId: string) {
      return await db.unfollowUser(followerId, targetUserId);
    },

    async getFollowStatus(currentUserId: string, targetUserId: string) {
      return await db.getFollowStatus(currentUserId, targetUserId);
    },

    async getFollowers(query: FollowQuery) {
      return await db.getFollowers(query);
    },

    async getFollowing(query: FollowQuery) {
      return await db.getFollowing(query);
    },

    async getFollowStats(userId: string) {
      return await db.getFollowStats(userId);
    },

    async batchGetFollowStatus(currentUserId: string, targetUserIds: string[]) {
      return await db.batchGetFollowStatus(currentUserId, targetUserIds);
    }
  },

  // 升级的Feed接口
  feed: {
    async getEnhancedFeed(userId?: string, query?: FeedQuery) {
      const enhanced = await getEnhancedApi();
      if (enhanced) {
        console.log('📊 使用IndexedDB增强Feed系统');
        return await enhanced.posts.getEnhancedFeed(userId, query);
      }
      console.log('📊 使用传统localStorage Feed系统');
      return await db.getEnhancedFeedPosts(userId, query);
    }
  },

  // 认证接口
  auth: {
    async login(credentials: LoginRequest) {
      const enhanced = await getEnhancedApi();
      if (enhanced) {
        console.log('🔐 使用IndexedDB认证系统');
        return await enhanced.auth.login(credentials);
      }
      console.log('🔐 使用传统localStorage认证系统');
      return await db.authenticateUser(credentials);
    },

    async register(userData: RegisterRequest) {
      return await db.registerUser(userData);
    },

    async validateToken(token: string) {
      const enhanced = await getEnhancedApi();
      if (enhanced) {
        console.log('🔍 使用IndexedDB token验证系统');
        return await enhanced.auth.validateToken(token);
      }
      console.log('🔍 使用传统localStorage token验证系统');
      return await db.validateAuthToken(token);
    },

    async refreshToken(refreshToken: string) {
      const enhanced = await getEnhancedApi();
      if (enhanced) {
        console.log('🔄 使用IndexedDB token刷新系统');
        return await enhanced.auth.refreshToken(refreshToken);
      }
      console.log('🔄 使用传统localStorage token刷新系统');
      return await db.refreshAuthToken(refreshToken);
    },

    async updateProfile(userId: string, updates: UpdateProfileRequest) {
      return await db.updateUserProfile(userId, updates);
    },

    async uploadAvatar(request: AvatarUploadRequest) {
      return await db.uploadAvatar(request);
    },

    async checkUsernameAvailability(username: string, currentUserId?: string) {
      return await db.checkUsernameAvailability(username, currentUserId);
    }
  }
};
