/**
 * IndexedDB存储系统 - 大容量、高性能的本地数据库
 * 支持图片二进制存储、事务管理、版本控制和自动清理
 */

import { User } from '@/types/auth';
import { Post, PostImage, Comment } from '@/types/post';
import { Follow } from '@/types/follow';

// 数据库配置
const DB_NAME = 'OnlyTextDB';
const DB_VERSION = 1;

// 对象存储定义
const STORES = {
  USERS: 'users',
  POSTS: 'posts',
  IMAGES: 'images',
  COMMENTS: 'comments',
  FOLLOWS: 'follows',
  COMMENT_LIKES: 'commentLikes',
  SETTINGS: 'settings'
} as const;

// 图片数据结构
export interface ImageRecord {
  id: string;
  postId: string;
  blob: Blob;
  metadata: {
    originalName: string;
    size: number;
    type: string;
    width: number;
    height: number;
    displayPercent?: number;
    order: number;
  };
  createdAt: number;
  lastAccessed: number;
}

// 存储配额信息
export interface StorageQuota {
  used: number;
  available: number;
  total: number;
  percentage: number;
}

// IndexedDB封装类
class IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.init();
  }

  // 初始化数据库
  private async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ IndexedDB打开失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB初始化成功');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('🔄 IndexedDB升级中...');

        // 用户存储
        if (!db.objectStoreNames.contains(STORES.USERS)) {
          const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' });
          userStore.createIndex('username', 'username', { unique: true });
          userStore.createIndex('email', 'email', { unique: true });
          console.log('📁 用户存储创建完成');
        }

        // 帖子存储
        if (!db.objectStoreNames.contains(STORES.POSTS)) {
          const postStore = db.createObjectStore(STORES.POSTS, { keyPath: 'id' });
          postStore.createIndex('authorId', 'authorId');
          postStore.createIndex('createdAt', 'createdAt');
          postStore.createIndex('type', 'type');
          postStore.createIndex('visibility', 'visibility');
          console.log('📝 帖子存储创建完成');
        }

        // 图片存储 - 单独存储二进制数据
        if (!db.objectStoreNames.contains(STORES.IMAGES)) {
          const imageStore = db.createObjectStore(STORES.IMAGES, { keyPath: 'id' });
          imageStore.createIndex('postId', 'postId');
          imageStore.createIndex('createdAt', 'createdAt');
          imageStore.createIndex('lastAccessed', 'lastAccessed');
          imageStore.createIndex('size', 'metadata.size');
          console.log('🖼️ 图片存储创建完成');
        }

        // 评论存储
        if (!db.objectStoreNames.contains(STORES.COMMENTS)) {
          const commentStore = db.createObjectStore(STORES.COMMENTS, { keyPath: 'id' });
          commentStore.createIndex('postId', 'postId');
          commentStore.createIndex('authorId', 'authorId');
          commentStore.createIndex('parentId', 'parentId');
          commentStore.createIndex('createdAt', 'createdAt');
          console.log('💬 评论存储创建完成');
        }

        // 关注存储
        if (!db.objectStoreNames.contains(STORES.FOLLOWS)) {
          const followStore = db.createObjectStore(STORES.FOLLOWS, { keyPath: 'id' });
          followStore.createIndex('followerId', 'followerId');
          followStore.createIndex('targetUserId', 'targetUserId');
          followStore.createIndex('createdAt', 'createdAt');
          console.log('👥 关注存储创建完成');
        }

        // 评论点赞存储
        if (!db.objectStoreNames.contains(STORES.COMMENT_LIKES)) {
          const likeStore = db.createObjectStore(STORES.COMMENT_LIKES, { keyPath: 'id' });
          likeStore.createIndex('commentId', 'commentId');
          likeStore.createIndex('userId', 'userId');
          console.log('❤️ 评论点赞存储创建完成');
        }

        // 设置存储
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
          console.log('⚙️ 设置存储创建完成');
        }

        console.log('🎉 IndexedDB升级完成');
      };
    });
  }

  // 确保数据库已初始化
  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
    if (!this.db) {
      throw new Error('IndexedDB未初始化');
    }
  }

  // 事务封装方法
  private async transaction<T>(
    storeNames: string | string[],
    mode: IDBTransactionMode,
    operation: (stores: { [key: string]: IDBObjectStore }) => Promise<T>
  ): Promise<T> {
    await this.ensureInitialized();
    
    const tx = this.db!.transaction(storeNames, mode);
    const stores: { [key: string]: IDBObjectStore } = {};
    
    if (typeof storeNames === 'string') {
      stores[storeNames] = tx.objectStore(storeNames);
    } else {
      storeNames.forEach(name => {
        stores[name] = tx.objectStore(name);
      });
    }

    try {
      const result = await operation(stores);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      return result;
    } catch (error) {
      tx.abort();
      throw error;
    }
  }

  // 图片存储方法
  async saveImage(imageData: {
    id: string;
    postId: string;
    file: File;
    metadata: ImageRecord['metadata'];
  }): Promise<void> {
    const { id, postId, file, metadata } = imageData;
    
    const imageRecord: ImageRecord = {
      id,
      postId,
      blob: file,
      metadata: {
        ...metadata,
        originalName: file.name,
        size: file.size,
        type: file.type
      },
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };

    await this.transaction(STORES.IMAGES, 'readwrite', async (stores) => {
      return new Promise<void>((resolve, reject) => {
        const request = stores[STORES.IMAGES].put(imageRecord);
        request.onsuccess = () => {
          console.log(`💾 图片保存成功: ${id} (${file.size} bytes)`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  // 获取图片
  async getImage(imageId: string): Promise<Blob | null> {
    try {
      const result = await this.transaction(STORES.IMAGES, 'readwrite', async (stores) => {
        return new Promise<ImageRecord | null>((resolve, reject) => {
          const request = stores[STORES.IMAGES].get(imageId);
          request.onsuccess = () => {
            const record = request.result as ImageRecord;
            if (record) {
              // 更新最后访问时间
              record.lastAccessed = Date.now();
              stores[STORES.IMAGES].put(record);
            }
            resolve(record || null);
          };
          request.onerror = () => reject(request.error);
        });
      });

      return result?.blob || null;
    } catch (error) {
      console.error('❌ 获取图片失败:', error);
      return null;
    }
  }

  // 获取图片URL（创建Object URL）
  async getImageUrl(imageId: string): Promise<string | null> {
    const blob = await this.getImage(imageId);
    if (blob) {
      return URL.createObjectURL(blob);
    }
    return null;
  }

  // 删除图片
  async deleteImage(imageId: string): Promise<void> {
    await this.transaction(STORES.IMAGES, 'readwrite', async (stores) => {
      return new Promise<void>((resolve, reject) => {
        const request = stores[STORES.IMAGES].delete(imageId);
        request.onsuccess = () => {
          console.log(`🗑️ 图片删除成功: ${imageId}`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  // 用户数据操作
  async saveUser(user: User): Promise<void> {
    await this.transaction(STORES.USERS, 'readwrite', async (stores) => {
      return new Promise<void>((resolve, reject) => {
        const request = stores[STORES.USERS].put(user);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getUser(userId: string): Promise<User | null> {
    return await this.transaction(STORES.USERS, 'readonly', async (stores) => {
      return new Promise<User | null>((resolve, reject) => {
        const request = stores[STORES.USERS].get(userId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getAllUsers(): Promise<User[]> {
    return await this.transaction(STORES.USERS, 'readonly', async (stores) => {
      return new Promise<User[]>((resolve, reject) => {
        const request = stores[STORES.USERS].getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    });
  }

  // 帖子数据操作
  async savePost(post: Post): Promise<void> {
    await this.transaction(STORES.POSTS, 'readwrite', async (stores) => {
      return new Promise<void>((resolve, reject) => {
        const request = stores[STORES.POSTS].put(post);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getPost(postId: string): Promise<Post | null> {
    return await this.transaction(STORES.POSTS, 'readonly', async (stores) => {
      return new Promise<Post | null>((resolve, reject) => {
        const request = stores[STORES.POSTS].get(postId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getAllPosts(): Promise<Post[]> {
    return await this.transaction(STORES.POSTS, 'readonly', async (stores) => {
      return new Promise<Post[]>((resolve, reject) => {
        const request = stores[STORES.POSTS].getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    return await this.transaction(STORES.POSTS, 'readonly', async (stores) => {
      return new Promise<Post[]>((resolve, reject) => {
        const index = stores[STORES.POSTS].index('authorId');
        const request = index.getAll(authorId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    });
  }

  // 评论数据操作
  async saveComment(comment: Comment): Promise<void> {
    await this.transaction(STORES.COMMENTS, 'readwrite', async (stores) => {
      return new Promise<void>((resolve, reject) => {
        const request = stores[STORES.COMMENTS].put(comment);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return await this.transaction(STORES.COMMENTS, 'readonly', async (stores) => {
      return new Promise<Comment[]>((resolve, reject) => {
        const index = stores[STORES.COMMENTS].index('postId');
        const request = index.getAll(postId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    });
  }

  // 关注数据操作
  async saveFollow(follow: Follow): Promise<void> {
    await this.transaction(STORES.FOLLOWS, 'readwrite', async (stores) => {
      return new Promise<void>((resolve, reject) => {
        const request = stores[STORES.FOLLOWS].put(follow);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getFollows(): Promise<Follow[]> {
    return await this.transaction(STORES.FOLLOWS, 'readonly', async (stores) => {
      return new Promise<Follow[]>((resolve, reject) => {
        const request = stores[STORES.FOLLOWS].getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    });
  }

  // 存储配额管理
  async getStorageQuota(): Promise<StorageQuota> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const total = estimate.quota || 0;
      const available = total - used;
      const percentage = total > 0 ? (used / total) * 100 : 0;

      return {
        used,
        available,
        total,
        percentage: Math.round(percentage * 100) / 100
      };
    }

    return {
      used: 0,
      available: 0,
      total: 0,
      percentage: 0
    };
  }

  // 清理旧数据
  async cleanupOldData(options: {
    maxImageAge?: number; // 毫秒
    maxUnusedImages?: number;
    maxPosts?: number;
  } = {}): Promise<{
    deletedImages: number;
    deletedPosts: number;
    freedSpace: number;
  }> {
    const {
      maxImageAge = 30 * 24 * 60 * 60 * 1000, // 30天
      maxUnusedImages = 100,
      maxPosts = 50
    } = options;

    let deletedImages = 0;
    let deletedPosts = 0;
    let freedSpace = 0;

    // 清理旧图片
    await this.transaction(STORES.IMAGES, 'readwrite', async (stores) => {
      const now = Date.now();
      const imageStore = stores[STORES.IMAGES];
      const lastAccessedIndex = imageStore.index('lastAccessed');

      return new Promise<void>((resolve, reject) => {
        const request = lastAccessedIndex.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const record = cursor.value as ImageRecord;
            const age = now - record.lastAccessed;

            if (age > maxImageAge) {
              freedSpace += record.metadata.size;
              cursor.delete();
              deletedImages++;
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    });

    // 清理旧帖子（保留最新的N个）
    const allPosts = await this.getAllPosts();
    if (allPosts.length > maxPosts) {
      const sortedPosts = allPosts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const postsToDelete = sortedPosts.slice(maxPosts);
      
      await this.transaction(STORES.POSTS, 'readwrite', async (stores) => {
        for (const post of postsToDelete) {
          await new Promise<void>((resolve, reject) => {
            const request = stores[STORES.POSTS].delete(post.id);
            request.onsuccess = () => {
              deletedPosts++;
              resolve();
            };
            request.onerror = () => reject(request.error);
          });
        }
      });
    }

    console.log(`🧹 数据清理完成: 删除${deletedImages}张图片, ${deletedPosts}个帖子, 释放${Math.round(freedSpace / 1024)}KB空间`);

    return {
      deletedImages,
      deletedPosts,
      freedSpace
    };
  }

  // 数据导出（用于迁移）
  async exportData(): Promise<{
    users: User[];
    posts: Post[];
    comments: Comment[];
    follows: Follow[];
    imageCount: number;
  }> {
    const [users, posts, comments, follows] = await Promise.all([
      this.getAllUsers(),
      this.getAllPosts(),
      this.transaction(STORES.COMMENTS, 'readonly', async (stores) => {
        return new Promise<Comment[]>((resolve, reject) => {
          const request = stores[STORES.COMMENTS].getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        });
      }),
      this.getFollows()
    ]);

    const imageCount = await this.transaction(STORES.IMAGES, 'readonly', async (stores) => {
      return new Promise<number>((resolve, reject) => {
        const request = stores[STORES.IMAGES].count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });

    return {
      users,
      posts,
      comments,
      follows,
      imageCount
    };
  }

  // 清空所有数据
  async clearAllData(): Promise<void> {
    await this.transaction(
      [STORES.USERS, STORES.POSTS, STORES.IMAGES, STORES.COMMENTS, STORES.FOLLOWS, STORES.COMMENT_LIKES, STORES.SETTINGS],
      'readwrite',
      async (stores) => {
        const clearPromises = Object.values(stores).map(store => {
          return new Promise<void>((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        });

        await Promise.all(clearPromises);
      }
    );

    console.log('🗑️ 所有数据已清空');
  }
}

// 创建全局实例
export const indexedDBStore = new IndexedDBStorage();

// 导出类型
export type { StorageQuota, ImageRecord };
