/**
 * 应用启动器
 * 负责检测存储系统、执行必要的迁移和初始化
 */

import { enhancedMockApi } from './enhancedMockApi';
import { dataMigrationManager } from './dataMigration';
import { isIndexedDBSupported } from './smartImageProcessor';

export interface InitializationResult {
  success: boolean;
  storageType: 'indexeddb' | 'localstorage' | 'fallback';
  migrationPerformed: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

class AppInitializer {
  private initialized = false;

  async initialize(): Promise<InitializationResult> {
    const result: InitializationResult = {
      success: false,
      storageType: 'fallback',
      migrationPerformed: false,
      errors: [],
      warnings: [],
      recommendations: []
    };

    try {
      console.log('🚀 OnlyText应用启动中...');

      // 1. 检查浏览器支持
      if (!isIndexedDBSupported()) {
        result.warnings.push('浏览器不支持IndexedDB，将使用localStorage');
        result.storageType = 'localstorage';
        result.recommendations.push('建议升级到现代浏览器以获得更好性能');
      } else {
        console.log('✅ IndexedDB支持检测通过');
        result.storageType = 'indexeddb';
      }

      // 2. 检查迁移需求
      const needsMigration = await dataMigrationManager.checkMigrationRequired();
      if (needsMigration) {
        console.log('📦 检测到数据迁移需求');
        result.recommendations.push('检测到localStorage数据，建议执行迁移');
      }

      // 3. 初始化存储系统
      if (result.storageType === 'indexeddb') {
        try {
          // 获取存储统计，这会触发初始化
          await enhancedMockApi.storage.getStats();
          console.log('✅ IndexedDB存储系统初始化成功');
        } catch (error) {
          console.error('❌ IndexedDB初始化失败，回退到localStorage:', error);
          result.errors.push(`IndexedDB初始化失败: ${error}`);
          result.storageType = 'localstorage';
          result.warnings.push('已回退到localStorage存储');
        }
      }

      // 4. 检查存储配额
      if (result.storageType === 'indexeddb') {
        try {
          const stats = await enhancedMockApi.storage.getStats();
          if (stats.quota.percentage > 80) {
            result.warnings.push('存储空间使用率超过80%');
            result.recommendations.push('建议执行数据清理操作');
          }
        } catch (error) {
          result.warnings.push('无法检测存储配额');
        }
      }

      // 5. 性能优化建议
      if (result.storageType === 'indexeddb') {
        result.recommendations.push('已启用IndexedDB高性能存储');
        result.recommendations.push('图片以二进制格式存储，避免质量损失');
      }

      result.success = true;
      this.initialized = true;

      console.log('🎉 应用初始化完成!');
      console.log(`📊 存储类型: ${result.storageType}`);
      console.log(`⚠️ 警告: ${result.warnings.length}个`);
      console.log(`💡 建议: ${result.recommendations.length}个`);

    } catch (error) {
      console.error('❌ 应用初始化失败:', error);
      result.errors.push(`初始化失败: ${error}`);
      result.success = false;
    }

    return result;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // 获取存储系统信息
  async getStorageInfo() {
    if (!this.initialized) {
      throw new Error('应用未初始化');
    }

    try {
      if (isIndexedDBSupported()) {
        return await enhancedMockApi.storage.getStats();
      } else {
        return {
          quota: { used: 0, available: 0, total: 0, percentage: 0 },
          dataCount: { users: 0, posts: 0, images: 0, comments: 0, follows: 0 },
          performance: { storageType: 'localStorage', migrationCompleted: false, lastMaintenance: 0 }
        };
      }
    } catch (error) {
      console.error('❌ 获取存储信息失败:', error);
      throw error;
    }
  }

  // 执行维护任务
  async performMaintenance() {
    if (!this.initialized) {
      throw new Error('应用未初始化');
    }

    try {
      console.log('🔧 执行维护任务...');
      
      if (isIndexedDBSupported()) {
        const result = await enhancedMockApi.storage.cleanup();
        console.log('✅ 维护任务完成:', result);
        return result;
      } else {
        console.log('⚠️ localStorage模式，跳过维护任务');
        return null;
      }
    } catch (error) {
      console.error('❌ 维护任务失败:', error);
      throw error;
    }
  }
}

// 创建全局实例
export const appInitializer = new AppInitializer();

// 快速初始化函数
export async function quickInit(): Promise<InitializationResult> {
  return await appInitializer.initialize();
}

// 检查是否已初始化
export function isAppInitialized(): boolean {
  return appInitializer.isInitialized();
}
