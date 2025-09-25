/**
 * 增强的MockAPI - 集成IndexedDB存储
 * 
 * 新特性：
 * 1. IndexedDB作为主要存储
 * 2. 智能图片处理，避免不必要压缩
 * 3. 自动数据迁移
 * 4. 存储配额管理
 * 5. 性能优化
 */

import { User } from '@/types/auth';
import { 
  Post, 
  PostImage, 
  Comment, 
  CreatePostRequest, 
  FeedQuery, 
  UserPostsQuery,
  CommentsQuery,
  CreateCommentRequest,
  UpdateCommentRequest,
  PostVisibility
} from '@/types/post';
import { Follow } from '@/types/follow';

import { indexedDBStore } from './indexedDBStorage';
import { smartImageProcessor } from './smartImageProcessor';
import { dataMigrationManager } from './dataMigration';
import { mockUsers, mockPosts, mockComments, mockFollows } from './mockData';

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 增强的数据库类
class EnhancedMockDatabase {
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initialize();
  }

  // 初始化数据库
  private async initialize(): Promise<void> {
    try {
      console.log('🔄 初始化增强存储系统...');

      // 1. 检查是否需要数据迁移
      const needsMigration = await dataMigrationManager.checkMigrationRequired();
      
      if (needsMigration) {
        console.log('📦 执行数据迁移...');
        await dataMigrationManager.performMigration((status) => {
          console.log(`迁移进度: ${status.progress.percentage}% - ${status.progress.currentTask}`);
        });
      }

      // 2. 检查IndexedDB中是否有数据
      const existingData = await indexedDBStore.exportData();
      console.log('🔍 检查IndexedDB中的现有数据:', {
        users: existingData.users.length,
        posts: existingData.posts.length,
        comments: existingData.comments.length,
        follows: existingData.follows.length
      });
      
      if (existingData.users.length === 0) {
        console.log('📝 IndexedDB中无用户数据，开始初始化默认数据...');
        await this.initializeDefaultData();
      } else if (existingData.posts.length === 0) {
        console.log('⚠️ 发现用户数据但无帖子数据，重新初始化帖子数据...');
        // 只重新初始化帖子和相关数据
        console.log('📝 导入帖子数据...');
        for (const post of mockPosts) {
          await indexedDBStore.savePost(post);
          console.log(`✅ 已保存帖子: ${post.id}`);
        }
        
        console.log('💬 导入评论数据...');
        for (const comment of mockComments) {
          await indexedDBStore.saveComment(comment);
        }
        
        console.log('👥 导入关注关系数据...');
        for (const follow of mockFollows) {
          await indexedDBStore.saveFollow(follow);
        }
        console.log('🎉 帖子数据补充完成');
      } else {
        console.log('✅ IndexedDB中已有完整数据，跳过初始化');
      }

      // 3. 清理过期数据
      await this.performMaintenanceTasks();

      this.isInitialized = true;
      console.log('✅ 增强存储系统初始化完成');

    } catch (error) {
      console.error('❌ 存储系统初始化失败:', error);
      throw error;
    }
  }

  // 确保已初始化
  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
    if (!this.isInitialized) {
      throw new Error('Storage system not initialized');
    }
  }

  // 初始化默认数据
  private async initializeDefaultData(): Promise<void> {
    console.log('📝 开始初始化默认数据到IndexedDB...');
    console.log(`📊 准备导入: ${mockUsers.length}个用户, ${mockPosts.length}个帖子, ${mockComments.length}个评论, ${mockFollows.length}个关注`);

    // 保存用户数据
    console.log('👤 导入用户数据...');
    for (const user of mockUsers) {
      await indexedDBStore.saveUser(user);
      console.log(`✅ 已保存用户: ${user.displayName} (${user.email})`);
    }

    // 保存帖子数据
    console.log('📝 导入帖子数据...');
    for (const post of mockPosts) {
      await indexedDBStore.savePost(post);
      console.log(`✅ 已保存帖子: ${post.id} (作者: ${post.authorId})`);
    }

    // 保存评论数据
    console.log('💬 导入评论数据...');
    for (const comment of mockComments) {
      await indexedDBStore.saveComment(comment);
    }
    console.log(`✅ 已保存 ${mockComments.length} 个评论`);

    // 保存关注数据
    console.log('👥 导入关注关系数据...');
    for (const follow of mockFollows) {
      await indexedDBStore.saveFollow(follow);
    }
    console.log(`✅ 已保存 ${mockFollows.length} 个关注关系`);

    // 验证数据
    const verification = await indexedDBStore.exportData();
    console.log('🔍 数据验证结果:', {
      users: verification.users.length,
      posts: verification.posts.length,
      comments: verification.comments.length,
      follows: verification.follows.length
    });

    console.log('🎉 默认数据初始化完成');
  }

  // 执行维护任务
  private async performMaintenanceTasks(): Promise<void> {
    try {
      // 清理过期数据
      const cleanup = await indexedDBStore.cleanupOldData({
        maxImageAge: 30 * 24 * 60 * 60 * 1000, // 30天
        maxPosts: 100 // 保留最多100个帖子
      });

      if (cleanup.deletedImages > 0 || cleanup.deletedPosts > 0) {
        console.log(`🧹 维护完成: 清理${cleanup.deletedImages}张图片, ${cleanup.deletedPosts}个帖子`);
      }

    } catch (error) {
      console.error('❌ 维护任务失败:', error);
    }
  }

  // 获取Feed帖子
  async getFeedPosts(query?: FeedQuery): Promise<{ posts: Post[]; hasMore: boolean }> {
    await this.ensureInitialized();
    await delay(200); // 模拟网络延迟

    let posts = await indexedDBStore.getAllPosts();

    // 处理图片URL
    posts = await this.resolveImageUrls(posts);

    // 应用过滤器
    if (query?.type && query.type !== 'all') {
      posts = posts.filter(post => post.type === query.type);
    }

    if (query?.relationships && query.relationships.length > 0) {
      posts = posts.filter(post => query.relationships!.includes(post.relationship || ''));
    }

    if (query?.apps && query.apps.length > 0) {
      posts = posts.filter(post => post.app && query.apps!.includes(post.app.app));
    }

    if (query?.feelings && query.feelings.length > 0) {
      posts = posts.filter(post => 
        post.feelings && post.feelings.some(feeling => query.feelings!.includes(feeling))
      );
    }

    // 排序
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 分页
    const page = query?.page || 1;
    const pageSize = query?.limit || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPosts = posts.slice(startIndex, endIndex);

    // 填充作者信息
    const postsWithAuthors = await this.populateAuthors(paginatedPosts);

    return {
      posts: postsWithAuthors,
      hasMore: endIndex < posts.length
    };
  }

  // 获取增强Feed（包含关注用户内容和筛选）
  async getEnhancedFeedPosts(userId?: string, query?: FeedQuery): Promise<{ posts: Post[]; hasMore: boolean }> {
    await this.ensureInitialized();
    await delay(200);

    console.log(`🔍 获取增强Feed: userId=${userId}, 筛选条件:`, query);

    let posts = await indexedDBStore.getAllPosts();
    
    // 处理图片URL
    posts = await this.resolveImageUrls(posts);

    // 填充作者信息
    posts = await this.populateAuthors(posts);

    console.log(`🚀 作者信息填充完成，开始过滤逻辑，用户ID: ${userId}`);
    
    let filteredPosts: Post[] = [];

    if (userId) {
      // 已登录用户：显示关注用户的内容 + 公共share内容
      console.log(`👥 获取用户 ${userId} 的关注列表`);
      let allFollows: Follow[] = [];
      try {
        allFollows = await indexedDBStore.getFollows();
      } catch (error) {
        console.error('❌ 获取关注关系失败，使用空列表:', error);
        allFollows = [];
      }

      if (!Array.isArray(allFollows)) {
        console.warn('⚠️ 关注数据格式异常，重置为空数组');
        allFollows = [];
      }

      console.log(`📊 系统中总关注关系: ${allFollows.length}个`);
      
      const userFollowing = allFollows
        .filter(f => f.followerId === userId)
        .map(f => f.followingId);
      
      console.log(`👥 用户 ${userId} 关注的用户: ${userFollowing.length}个`, userFollowing);

      // 获取关注用户的share和post类型帖子
      const followingPosts = posts.filter(post => 
        userFollowing.includes(post.authorId) && 
        (post.type === 'share' || post.type === 'post')
      );
      
      console.log(`📦 关注用户帖子ID:`, followingPosts.map(post => ({ id: post.id, type: post.type, visibility: post.visibility })));
      
      // 获取所有公共share帖子
      const publicPosts = posts.filter(post => {
        const isShare = post.type === 'share';
        const isPublic = post.visibility === 'public';
        const shouldInclude = isShare && isPublic;
        if (!shouldInclude) {
          console.log(`❌ 公共帖子过滤: ${post.id} - 类型: ${post.type}, 可见性: ${post.visibility}`);
        }
        return shouldInclude;
      });
      
      console.log(`📦 公共帖子ID:`, publicPosts.map(post => ({ id: post.id, type: post.type, visibility: post.visibility })));
      
      console.log(`📊 帖子类型分析:`);
      console.log(`  - 总帖子数: ${posts.length}`);
      console.log(`  - 关注用户帖子: ${followingPosts.length}个`);
      console.log(`  - 公共share帖子: ${publicPosts.length}个`);
      console.log(`  - 帖子类型分布:`, posts.reduce((acc, post) => {
        acc[post.type] = (acc[post.type] || 0) + 1;
        acc[`${post.type}_${post.visibility}`] = (acc[`${post.type}_${post.visibility}`] || 0) + 1;
        return acc;
      }, {} as any));
      
      // 合并并去重（确保公共帖子总是被包含）
      const seen = new Set<string>();
      filteredPosts = [];

      const addPostIfNew = (post: Post, source: 'following' | 'public') => {
        if (!post) {
          console.warn(`⚠️ 尝试收录空帖子，来源: ${source}`);
          return;
        }
        if (!seen.has(post.id)) {
          filteredPosts.push(post);
          seen.add(post.id);
          console.log(`✅ 收录帖子 ${post.id} 来自: ${source}`);
        }
      };

      followingPosts.forEach(post => addPostIfNew(post, 'following'));
      publicPosts.forEach(post => addPostIfNew(post, 'public'));

      console.log(`📊 合并结果: ${filteredPosts.length} 个帖子`, filteredPosts.map(post => ({ id: post.id, source: seen.has(post.id) ? 'mixed' : 'unknown' })));

      console.log(`📊 最终结果: 关注用户帖子${followingPosts.length}个 + 公共帖子${publicPosts.length}个 = 去重后${filteredPosts.length}个`);
      
      // 🔧 临时修复：如果登录用户没有任何帖子，强制显示公共帖子
      if (filteredPosts.length === 0 && publicPosts.length > 0) {
        console.log(`⚠️ 登录用户无帖子，强制显示所有公共帖子`);
        filteredPosts = publicPosts;
      }
    } else {
      // 未登录用户：只显示公共share内容
      filteredPosts = posts.filter(post => 
        post.type === 'share' && post.visibility === 'public'
      );
      console.log(`📊 未登录用户，显示公共帖子: ${filteredPosts.length}个`);
      console.log(`📊 帖子类型分布:`, posts.reduce((acc, post) => {
        acc[post.type] = (acc[post.type] || 0) + 1;
        acc[`${post.type}_${post.visibility}`] = (acc[`${post.type}_${post.visibility}`] || 0) + 1;
        return acc;
      }, {} as any));
    }

    // 应用筛选条件
    if (query) {
      const { relationships = [], apps = [], feelings = [] } = query;
      
      if (relationships.length > 0 || apps.length > 0 || feelings.length > 0) {
        filteredPosts = filteredPosts.filter(post => {
          // 关系筛选
          if (relationships.length > 0 && !relationships.includes(post.relationship || '')) {
            return false;
          }
          
          // App筛选
          if (apps.length > 0 && (!post.app || !apps.includes(post.app.app))) {
            return false;
          }
          
          // 感觉筛选
          if (feelings.length > 0) {
            if (!post.feelings || !post.feelings.some(feeling => feelings.includes(feeling))) {
              return false;
            }
          }
          
          return true;
        });
        console.log(`🎯 应用筛选后: ${filteredPosts.length}个帖子`);
      }
    }

    // 按时间排序（最新在前）
    filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 分页
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    console.log(`📄 分页结果: 第${page}页, 每页${limit}个, 返回${paginatedPosts.length}个帖子`);

    const result = {
      posts: paginatedPosts,
      hasMore: endIndex < filteredPosts.length
    };

    console.log(`📬 返回给前端的帖子数量: ${result.posts.length}, hasMore=${result.hasMore}`);
    console.log('📬 帖子详情:', result.posts.map(post => ({
      id: post.id,
      type: post.type,
      visibility: post.visibility,
      authorId: post.authorId,
      authorName: post.author?.displayName
    })));

    return result;
  }

  // 获取用户帖子
  async getUserPosts(query: UserPostsQuery): Promise<{ posts: Post[]; hasMore: boolean }> {
    await this.ensureInitialized();
    await delay(200);

    let posts = await indexedDBStore.getPostsByAuthor(query.userId);
    posts = await this.resolveImageUrls(posts);

    // 排序 (按时间降序)
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 分页
    const page = query.page || 1;
    const pageSize = query.limit || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPosts = posts.slice(startIndex, endIndex);

    const postsWithAuthors = await this.populateAuthors(paginatedPosts);

    return {
      posts: postsWithAuthors,
      hasMore: endIndex < posts.length
    };
  }

  // 获取单个帖子
  async getPostById(postId: string): Promise<Post | null> {
    await this.ensureInitialized();
    await delay(100);

    const post = await indexedDBStore.getPost(postId);
    if (!post) return null;

    const postsWithImages = await this.resolveImageUrls([post]);
    const postsWithAuthors = await this.populateAuthors(postsWithImages);
    
    return postsWithAuthors[0] || null;
  }

  // 创建帖子
  async createPost(authorId: string, postData: CreatePostRequest): Promise<Post> {
    await this.ensureInitialized();
    await delay(300);

    const postId = `post_${Date.now()}`;

    console.log(`🚀 开始创建帖子: ${postId}`);

    // 1. 处理图片上传
    const images: PostImage[] = [];
    if (postData.images && postData.images.length > 0) {
      console.log(`📸 处理 ${postData.images.length} 张图片...`);
      
      const processedImages = await smartImageProcessor.processImages(postData.images, postId);
      
      for (let i = 0; i < processedImages.length; i++) {
        const processed = processedImages[i];
        const originalFile = postData.images[i];
        
        // 获取该图片的displayPercent设置
        const imageDisplaySetting = postData.imageDisplaySettings?.find(setting => setting.imageIndex === i);
        const displayPercent = imageDisplaySetting?.displayPercent || postData.defaultDisplayPercent || 50;

        images.push({
          id: processed.id,
          url: `indexeddb://${processed.id}`, // 使用IndexedDB引用
          thumbUrl: `indexeddb://${processed.id}`, // 缩略图也使用IndexedDB引用
          altText: originalFile.name,
          width: processed.original.width,
          height: processed.original.height,
          order: i + 1,
          displayPercent: displayPercent,
        });

        console.log(`✅ 图片处理完成: ${processed.id} (${processed.metadata.strategy}策略)`);
      }
    }

    // 2. 创建帖子对象
    const author = await indexedDBStore.getUser(authorId);
    const newPost: Post = {
      id: postId,
      authorId,
      content: postData.content,
      type: postData.type,
      relationship: postData.relationship,
      feelings: postData.feelings,
      app: postData.app,
      images,
      coverImageIndex: postData.coverImageIndex || 0,
      defaultDisplayPercent: postData.defaultDisplayPercent || 50,
      visibility: 'public' as PostVisibility,
      likesCount: 0,
      retweetsCount: 0,
      repliesCount: 0,
      bookmarksCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      author: author || undefined,
      isLikedByCurrentUser: false,
      isBookmarkedByCurrentUser: false,
      isRetweetedByCurrentUser: false,
    };

    // 3. 保存到IndexedDB
    await indexedDBStore.savePost(newPost);

    console.log(`🎉 帖子创建成功: ${postId}`);
    
    return newPost;
  }

  // 解析图片URL
  private async resolveImageUrls(posts: Post[]): Promise<Post[]> {
    const resolvedPosts = [...posts];

    for (const post of resolvedPosts) {
      if (post.images && post.images.length > 0) {
        for (const image of post.images) {
          // 解析主图URL
          if (image.url.startsWith('indexeddb://')) {
            const imageId = image.url.replace('indexeddb://', '');
            const imageUrl = await smartImageProcessor.getStoredImage(imageId);
            if (imageUrl) {
              image.url = imageUrl;
              console.log(`🔗 解析主图URL: ${imageId} -> ${imageUrl.substring(0, 50)}...`);
            } else {
              console.warn(`⚠️ 无法获取主图URL: ${imageId}`);
            }
          }
          
          // 解析缩略图URL
          if (image.thumbUrl && image.thumbUrl.startsWith('indexeddb://')) {
            const thumbImageId = image.thumbUrl.replace('indexeddb://', '');
            const thumbImageUrl = await smartImageProcessor.getStoredImage(thumbImageId);
            if (thumbImageUrl) {
              image.thumbUrl = thumbImageUrl;
              console.log(`🔗 解析缩略图URL: ${thumbImageId} -> ${thumbImageUrl.substring(0, 50)}...`);
            } else {
              console.warn(`⚠️ 无法获取缩略图URL: ${thumbImageId}`);
              // 如果缩略图获取失败，使用主图作为后备
              image.thumbUrl = image.url;
            }
          }
        }
      }
    }

    return resolvedPosts;
  }

  // 填充作者信息
  private async populateAuthors(posts: Post[]): Promise<Post[]> {
    const postsWithAuthors = [...posts];
    
    console.log(`🔍 填充作者信息: ${posts.length}个帖子`);
    
    for (const post of postsWithAuthors) {
      if (!post.author) {
        console.log(`📝 为帖子 ${post.id} 获取作者 ${post.authorId}`);
        const author = await indexedDBStore.getUser(post.authorId);
        if (author) {
          post.author = author;
          console.log(`✅ 作者信息已填充: ${author.displayName}`);
        } else {
          console.warn(`⚠️ 未找到作者: ${post.authorId}`);
        }
      } else {
        console.log(`✅ 帖子 ${post.id} 已有作者信息: ${post.author.displayName}`);
      }
    }

    return postsWithAuthors;
  }

  // 用户相关方法
  async findUserById(userId: string): Promise<User | null> {
    await this.ensureInitialized();
    console.log(`🔍 IndexedDB: 查找用户ID "${userId}"`);
    const user = await indexedDBStore.getUser(userId);
    if (user) {
      console.log(`✅ IndexedDB: 找到用户 "${userId}": ${user.displayName} (${user.email})`);
    } else {
      console.warn(`❌ IndexedDB: 未找到用户 "${userId}"`);
      // 额外检查：列出所有用户ID
      const allUsers = await indexedDBStore.getAllUsers();
      console.log(`📊 IndexedDB: 当前所有用户ID:`, allUsers.map(u => ({ id: u.id, email: u.email, displayName: u.displayName })));
    }
    return user;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    await this.ensureInitialized();
    const users = await indexedDBStore.getAllUsers();
    return users.find(user => user.username === username) || null;
  }

  // ======= 认证相关方法 =======
  
  // 验证认证令牌
  async validateAuthToken(token: string): Promise<User | null> {
    await this.ensureInitialized();
    
    try {
      console.log('🔍 IndexedDB: 验证认证令牌');
      
      // 从token中提取用户ID
      // 这里简化处理，在实际应用中应该使用JWT验证
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      const userId = payload.userId;
      
      console.log(`🔍 IndexedDB: 从token中提取的用户ID: ${userId}`);
      
      const user = await this.findUserById(userId);
      if (user) {
        console.log('✅ IndexedDB: Token验证成功:', user.email);
        return user;
      } else {
        console.warn('❌ IndexedDB: Token中的用户ID无效');
        return null;
      }
    } catch (error) {
      console.error('❌ IndexedDB: Token验证失败:', error);
      return null;
    }
  }
  
  // 刷新认证令牌
  async refreshAuthToken(refreshToken: string) {
    await this.ensureInitialized();
    
    const user = await this.validateAuthToken(refreshToken);
    if (user) {
      // 生成新的tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1小时后过期
      };
      
      // 创建简单的模拟JWT (header.payload.signature)
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify(tokenPayload));
      const signature = btoa(`sig_${Date.now()}_${Math.random().toString(36)}`);
      
      const tokens = {
        accessToken: `${header}.${payload}.${signature}`,
        refreshToken: `${header}.${payload}.${signature}`,
        expiresIn: 3600,
        tokenType: 'Bearer'
      };
      
      return { user, tokens };
    } else {
      throw new Error('Invalid refresh token');
    }
  }
  
  // 用户认证
  async authenticateUser(credentials: any) {
    await this.ensureInitialized();
    await delay(300);
    
    try {
      let user: User | null = null;
      
      if (credentials.isGoogleAuth && credentials.googleUser) {
        // Google OAuth登录
        console.log('🔍 IndexedDB: Processing Google OAuth login for:', credentials.googleUser.email);
        
        // 查找是否已有Google账号
        const users = await indexedDBStore.getAllUsers();
        user = users.find(u => u.googleId === credentials.googleUser!.sub) || null;
        
        if (!user) {
          // 检查邮箱是否已被其他账号使用
          const existingUser = users.find(u => u.email === credentials.googleUser!.email);
          if (existingUser && !existingUser.googleId) {
            // 将现有账号绑定到Google
            existingUser.googleId = credentials.googleUser!.sub;
            existingUser.isGoogleAuth = true;
            existingUser.avatar = credentials.googleUser!.picture;
            existingUser.updatedAt = new Date().toISOString();
            user = existingUser;
            await indexedDBStore.saveUser(user);
            console.log('✅ IndexedDB: Linked existing account to Google:', user.email);
          } else {
            // 创建新的Google用户
            user = await this.createGoogleUser(credentials.googleUser!);
            console.log('✅ IndexedDB: Created new Google user:', user.email);
          }
        } else {
          console.log('✅ IndexedDB: Found existing Google user:', user.email);
        }
      } else {
        // 传统邮箱/密码登录
        const users = await indexedDBStore.getAllUsers();
        console.log(`🔍 IndexedDB: 查找邮箱登录用户 "${credentials.email}"`);
        console.log(`📊 IndexedDB: 当前用户总数: ${users.length}`);
        console.log(`📊 IndexedDB: 用户列表:`, users.map(u => ({ email: u.email, id: u.id })));
        
        user = users.find(u => u.email === credentials.email) || null;
        
        if (!user) {
          console.error(`❌ IndexedDB: 未找到邮箱 "${credentials.email}" 对应的用户`);
          throw new Error('Invalid email or password');
        }
        
        console.log('✅ IndexedDB: Email/password login successful for:', user.email);
      }
      
      if (!user) {
        throw new Error('Authentication failed');
      }
      
      // 生成模拟JWT tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1小时后过期
      };
      
      // 创建简单的模拟JWT (header.payload.signature)
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify(tokenPayload));
      const signature = btoa(`sig_${Date.now()}_${Math.random().toString(36)}`);
      
      const tokens = {
        accessToken: `${header}.${payload}.${signature}`,
        refreshToken: `${header}.${payload}.${signature}`,
        expiresIn: 3600,
        tokenType: 'Bearer'
      };
      
      return {
        user,
        tokens,
        message: 'Login successful'
      };
      
    } catch (error) {
      console.error('❌ IndexedDB authentication failed:', error);
      throw error;
    }
  }

  // 创建Google用户
  private async createGoogleUser(googleUser: any): Promise<User> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const username = await this.generateUniqueUsername(googleUser.given_name || googleUser.name);
    
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
    
    await indexedDBStore.saveUser(newUser);
    console.log('👤 IndexedDB: Google用户已保存:', newUser.email);
    return newUser;
  }

  // 生成唯一用户名
  private async generateUniqueUsername(baseName: string): Promise<string> {
    let username = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (username.length < 3) username = 'user' + username;
    
    const users = await indexedDBStore.getAllUsers();
    let counter = 1;
    let originalUsername = username;
    
    while (users.some(u => u.username === username)) {
      username = `${originalUsername}${counter}`;
      counter++;
    }
    
    return username;
  }

  // 评论相关方法
  async getPostComments(query: CommentsQuery): Promise<{ comments: Comment[]; hasMore: boolean }> {
    await this.ensureInitialized();
    await delay(200);

    let comments = await indexedDBStore.getCommentsByPost(query.postId);

    // 排序
    if (query.sortBy === 'newest') {
      comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    // 分页
    const page = query.page || 1;
    const pageSize = query.limit || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedComments = comments.slice(startIndex, endIndex);

    // 填充作者信息
    for (const comment of paginatedComments) {
      if (!comment.author) {
        const author = await indexedDBStore.getUser(comment.authorId);
        if (author) {
          comment.author = author;
        }
      }
    }

    return {
      comments: paginatedComments,
      hasMore: endIndex < comments.length
    };
  }

  async createComment(authorId: string, commentData: CreateCommentRequest): Promise<Comment> {
    await this.ensureInitialized();
    await delay(200);

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      postId: commentData.postId,
      authorId,
      content: commentData.content,
      parentId: commentData.parentId,
      likesCount: 0,
      repliesCount: 0,
      depth: commentData.parentId ? 1 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      isLikedByCurrentUser: false,
      isDeleted: false,
    };

    await indexedDBStore.saveComment(newComment);
    return newComment;
  }

  // 关注相关方法
  async getFollows(): Promise<Follow[]> {
    await this.ensureInitialized();
    return await indexedDBStore.getFollows();
  }

  async saveFollow(follow: Follow): Promise<void> {
    await this.ensureInitialized();
    await indexedDBStore.saveFollow(follow);
  }

  // 获取存储统计信息
  async getStorageStats(): Promise<{
    quota: any;
    dataCount: any;
    performance: any;
  }> {
    await this.ensureInitialized();

    const quota = await indexedDBStore.getStorageQuota();
    const data = await indexedDBStore.exportData();

    return {
      quota,
      dataCount: {
        users: data.users.length,
        posts: data.posts.length,
        images: data.imageCount,
        comments: data.comments.length,
        follows: data.follows.length
      },
      performance: {
        storageType: 'IndexedDB',
        migrationCompleted: dataMigrationManager.getMigrationStatus().isCompleted,
        lastMaintenance: Date.now()
      }
    };
  }
}

// 创建全局实例
const enhancedDb = new EnhancedMockDatabase();

// 导出增强的API
export const enhancedMockApi = {
  posts: {
    async getFeed(query?: FeedQuery) {
      return await enhancedDb.getFeedPosts(query);
    },

    async getEnhancedFeed(userId?: string, query?: FeedQuery) {
      return await enhancedDb.getEnhancedFeedPosts(userId, query);
    },

    async getUserPosts(query: UserPostsQuery) {
      return await enhancedDb.getUserPosts(query);
    },

    async getPostById(postId: string) {
      return await enhancedDb.getPostById(postId);
    },

    async createPost(authorId: string, postData: CreatePostRequest) {
      return await enhancedDb.createPost(authorId, postData);
    }
  },

  comments: {
    async getPostComments(query: CommentsQuery) {
      return await enhancedDb.getPostComments(query);
    },

    async createComment(authorId: string, commentData: CreateCommentRequest) {
      return await enhancedDb.createComment(authorId, commentData);
    }
  },

  users: {
    async getUserById(userId: string) {
      return await enhancedDb.findUserById(userId);
    },

    async getUserByUsername(username: string) {
      return await enhancedDb.findUserByUsername(username);
    }
  },

  auth: {
    async login(credentials: any) {
      return await enhancedDb.authenticateUser(credentials);
    },
    
    async validateToken(token: string) {
      return await enhancedDb.validateAuthToken(token);
    },
    
    async refreshToken(refreshToken: string) {
      return await enhancedDb.refreshAuthToken(refreshToken);
    }
  },

  storage: {
    async getStats() {
      return await enhancedDb.getStorageStats();
    },

    async cleanup() {
      return await indexedDBStore.cleanupOldData();
    },

    async clearAll() {
      return await indexedDBStore.clearAllData();
    }
  },

  migration: {
    getStatus() {
      return dataMigrationManager.getMigrationStatus();
    },

    async migrate() {
      return await dataMigrationManager.performMigration();
    }
  }
};

// 导出类型
export type { MigrationStatus } from './dataMigration';
export type { StorageQuota } from './indexedDBStorage';
