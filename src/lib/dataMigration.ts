/**
 * 数据迁移系统
 * 从localStorage平滑迁移到IndexedDB
 * 
 * 迁移策略：
 * 1. 检测已有localStorage数据
 * 2. 转换Data URL图片为Blob存储
 * 3. 渐进式迁移，保持应用可用性
 * 4. 迁移完成后清理localStorage
 */

import { indexedDBStore } from './indexedDBStorage';
import { User } from '@/types/auth';
import { Post, Comment } from '@/types/post';
import { Follow } from '@/types/follow';

// 旧的localStorage键名
const OLD_STORAGE_KEYS = {
  USERS: 'onlytext_users',
  POSTS: 'onlytext_posts',
  COMMENTS: 'onlytext_comments',
  FOLLOWS: 'onlytext_follows',
  COMMENT_LIKES: 'onlytext_comment_likes'
} as const;

// 迁移状态
export interface MigrationStatus {
  isRequired: boolean;
  isInProgress: boolean;
  isCompleted: boolean;
  progress: {
    current: number;
    total: number;
    percentage: number;
    currentTask: string;
  };
  statistics: {
    migratedUsers: number;
    migratedPosts: number;
    migratedImages: number;
    migratedComments: number;
    migratedFollows: number;
    totalDataSize: number;
    migrationTime: number;
  };
  errors: string[];
}

// 迁移设置键
const MIGRATION_KEY = 'onlytext_migration_status';

class DataMigrationManager {
  private status: MigrationStatus = {
    isRequired: false,
    isInProgress: false,
    isCompleted: false,
    progress: {
      current: 0,
      total: 0,
      percentage: 0,
      currentTask: ''
    },
    statistics: {
      migratedUsers: 0,
      migratedPosts: 0,
      migratedImages: 0,
      migratedComments: 0,
      migratedFollows: 0,
      totalDataSize: 0,
      migrationTime: 0
    },
    errors: []
  };

  // 检查是否需要迁移
  async checkMigrationRequired(): Promise<boolean> {
    try {
      // 检查迁移状态
      const savedStatus = localStorage.getItem(MIGRATION_KEY);
      if (savedStatus) {
        const parsedStatus = JSON.parse(savedStatus);
        if (parsedStatus.isCompleted) {
          this.status = parsedStatus;
          return false;
        }
      }

      // 检查是否有localStorage数据
      const hasUsers = localStorage.getItem(OLD_STORAGE_KEYS.USERS) !== null;
      const hasPosts = localStorage.getItem(OLD_STORAGE_KEYS.POSTS) !== null;
      const hasComments = localStorage.getItem(OLD_STORAGE_KEYS.COMMENTS) !== null;
      const hasFollows = localStorage.getItem(OLD_STORAGE_KEYS.FOLLOWS) !== null;

      const isRequired = hasUsers || hasPosts || hasComments || hasFollows;
      
      this.status.isRequired = isRequired;
      
      if (isRequired) {
        console.log('🔄 检测到localStorage数据，需要迁移到IndexedDB');
      } else {
        console.log('✅ 无需迁移，IndexedDB已是主要存储');
      }

      return isRequired;
    } catch (error) {
      console.error('❌ 检查迁移状态失败:', error);
      return false;
    }
  }

  // 获取迁移状态
  getMigrationStatus(): MigrationStatus {
    return { ...this.status };
  }

  // 将Data URL转换为Blob
  private dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }

  // 迁移图片数据
  private async migratePostImages(post: Post): Promise<void> {
    if (!post.images || post.images.length === 0) return;

    for (let i = 0; i < post.images.length; i++) {
      const image = post.images[i];
      
      // 如果是Data URL，转换为Blob存储
      if (image.url.startsWith('data:')) {
        try {
          const blob = this.dataURLToBlob(image.url);
          const file = new File([blob], image.altText || `image_${i}.jpg`, {
            type: blob.type
          });

          // 保存到IndexedDB
          await indexedDBStore.saveImage({
            id: image.id,
            postId: post.id,
            file,
            metadata: {
              originalName: image.altText || `image_${i}.jpg`,
              size: blob.size,
              type: blob.type,
              width: image.width,
              height: image.height,
              displayPercent: image.displayPercent,
              order: image.order
            }
          });

          // 更新图片引用为IndexedDB ID
          image.url = `indexeddb://${image.id}`;
          
          // 处理缩略图
          if (image.thumbUrl.startsWith('data:')) {
            const thumbBlob = this.dataURLToBlob(image.thumbUrl);
            image.thumbUrl = URL.createObjectURL(thumbBlob);
          }

          this.status.statistics.migratedImages++;
          console.log(`📸 图片迁移成功: ${image.id} (${Math.round(blob.size/1024)}KB)`);
          
        } catch (error) {
          console.error(`❌ 图片迁移失败: ${image.id}`, error);
          this.status.errors.push(`图片迁移失败: ${image.id} - ${error}`);
        }
      }
    }
  }

  // 执行迁移
  async performMigration(onProgress?: (status: MigrationStatus) => void): Promise<boolean> {
    if (this.status.isInProgress) {
      console.log('⚠️ 迁移已在进行中');
      return false;
    }

    const startTime = Date.now();
    this.status.isInProgress = true;
    this.status.errors = [];
    
    try {
      console.log('🚀 开始数据迁移...');

      // 1. 加载localStorage数据
      this.status.progress.currentTask = '加载localStorage数据';
      onProgress?.(this.status);

      const usersData = localStorage.getItem(OLD_STORAGE_KEYS.USERS);
      const postsData = localStorage.getItem(OLD_STORAGE_KEYS.POSTS);
      const commentsData = localStorage.getItem(OLD_STORAGE_KEYS.COMMENTS);
      const followsData = localStorage.getItem(OLD_STORAGE_KEYS.FOLLOWS);

      const users: User[] = usersData ? JSON.parse(usersData) : [];
      const posts: Post[] = postsData ? JSON.parse(postsData) : [];
      const comments: Comment[] = commentsData ? JSON.parse(commentsData) : [];
      const follows: Follow[] = followsData ? JSON.parse(followsData) : [];

      const totalTasks = users.length + posts.length + comments.length + follows.length;
      this.status.progress.total = totalTasks;

      console.log(`📊 发现数据: ${users.length}个用户, ${posts.length}个帖子, ${comments.length}个评论, ${follows.length}个关注`);

      // 2. 迁移用户数据
      this.status.progress.currentTask = '迁移用户数据';
      for (const user of users) {
        await indexedDBStore.saveUser(user);
        this.status.statistics.migratedUsers++;
        this.status.progress.current++;
        this.status.progress.percentage = Math.round((this.status.progress.current / this.status.progress.total) * 100);
        onProgress?.(this.status);
      }

      // 3. 迁移帖子数据（包括图片）
      this.status.progress.currentTask = '迁移帖子和图片数据';
      for (const post of posts) {
        // 先迁移图片
        await this.migratePostImages(post);
        
        // 保存帖子数据
        await indexedDBStore.savePost(post);
        this.status.statistics.migratedPosts++;
        this.status.progress.current++;
        this.status.progress.percentage = Math.round((this.status.progress.current / this.status.progress.total) * 100);
        onProgress?.(this.status);
      }

      // 4. 迁移评论数据
      this.status.progress.currentTask = '迁移评论数据';
      for (const comment of comments) {
        await indexedDBStore.saveComment(comment);
        this.status.statistics.migratedComments++;
        this.status.progress.current++;
        this.status.progress.percentage = Math.round((this.status.progress.current / this.status.progress.total) * 100);
        onProgress?.(this.status);
      }

      // 5. 迁移关注数据
      this.status.progress.currentTask = '迁移关注数据';
      for (const follow of follows) {
        await indexedDBStore.saveFollow(follow);
        this.status.statistics.migratedFollows++;
        this.status.progress.current++;
        this.status.progress.percentage = Math.round((this.status.progress.current / this.status.progress.total) * 100);
        onProgress?.(this.status);
      }

      // 6. 计算迁移统计
      const endTime = Date.now();
      this.status.statistics.migrationTime = endTime - startTime;
      this.status.statistics.totalDataSize = this.calculateDataSize(users, posts, comments, follows);

      // 7. 标记迁移完成
      this.status.isCompleted = true;
      this.status.isInProgress = false;
      this.status.progress.currentTask = '迁移完成';
      this.status.progress.percentage = 100;

      // 8. 保存迁移状态
      localStorage.setItem(MIGRATION_KEY, JSON.stringify(this.status));

      console.log('🎉 数据迁移完成!');
      console.log(`📊 迁移统计:`, this.status.statistics);

      onProgress?.(this.status);

      // 9. 可选：清理localStorage数据（延迟执行，给用户确认时间）
      this.scheduleLocalStorageCleanup();

      return true;

    } catch (error) {
      console.error('❌ 数据迁移失败:', error);
      this.status.errors.push(`迁移失败: ${error}`);
      this.status.isInProgress = false;
      onProgress?.(this.status);
      return false;
    }
  }

  // 计算数据大小
  private calculateDataSize(users: User[], posts: Post[], comments: Comment[], follows: Follow[]): number {
    const usersSize = JSON.stringify(users).length;
    const postsSize = JSON.stringify(posts).length;
    const commentsSize = JSON.stringify(comments).length;
    const followsSize = JSON.stringify(follows).length;
    
    return usersSize + postsSize + commentsSize + followsSize;
  }

  // 计划清理localStorage
  private scheduleLocalStorageCleanup(): void {
    setTimeout(() => {
      this.cleanupLocalStorage();
    }, 5000); // 5秒后清理
  }

  // 清理localStorage数据
  async cleanupLocalStorage(): Promise<void> {
    try {
      console.log('🧹 清理localStorage数据...');
      
      Object.values(OLD_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('✅ localStorage数据清理完成');
    } catch (error) {
      console.error('❌ localStorage清理失败:', error);
    }
  }

  // 重置迁移状态（用于测试）
  resetMigrationStatus(): void {
    localStorage.removeItem(MIGRATION_KEY);
    this.status = {
      isRequired: false,
      isInProgress: false,
      isCompleted: false,
      progress: {
        current: 0,
        total: 0,
        percentage: 0,
        currentTask: ''
      },
      statistics: {
        migratedUsers: 0,
        migratedPosts: 0,
        migratedImages: 0,
        migratedComments: 0,
        migratedFollows: 0,
        totalDataSize: 0,
        migrationTime: 0
      },
      errors: []
    };
  }

  // 获取迁移建议
  getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.status.isRequired) {
      recommendations.push('建议立即进行数据迁移，以获得更好的性能和更大的存储空间');
      recommendations.push('迁移过程中请保持页面打开，避免中断');
    }

    if (this.status.statistics.migratedImages > 0) {
      recommendations.push('图片已迁移到IndexedDB，享受更快的加载速度');
    }

    if (this.status.errors.length > 0) {
      recommendations.push('存在迁移错误，建议检查控制台日志');
    }

    return recommendations;
  }
}

// 创建全局实例
export const dataMigrationManager = new DataMigrationManager();

// 工具函数：格式化迁移时间
export function formatMigrationTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else if (milliseconds < 60000) {
    return `${Math.round(milliseconds / 1000)}s`;
  } else {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.round((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}

// 工具函数：格式化数据大小
export function formatDataSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// MigrationStatus interface is already exported above via declaration
