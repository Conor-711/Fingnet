/**
 * 智能图片处理系统
 * 
 * 核心原则：
 * 1. 500KB以下图片保持原始质量，不压缩
 * 2. 大图片智能压缩，保持视觉质量
 * 3. 支持IndexedDB二进制存储
 * 4. 自动优化存储空间
 */

import { indexedDBStore } from './indexedDBStorage';

// 图片处理配置
export const IMAGE_CONFIG = {
  // 质量保护阈值
  NO_COMPRESSION_LIMIT: 500 * 1024, // 500KB以下不压缩
  SMALL_IMAGE_LIMIT: 1024 * 1024,   // 1MB以下轻度压缩
  LARGE_IMAGE_LIMIT: 3 * 1024 * 1024, // 3MB以下标准压缩
  
  // 压缩参数
  COMPRESSION: {
    NONE: { maxWidth: Infinity, quality: 1.0 },
    LIGHT: { maxWidth: 1200, quality: 0.9 },
    STANDARD: { maxWidth: 1000, quality: 0.8 },
    AGGRESSIVE: { maxWidth: 800, quality: 0.7 }
  },
  
  // 缩略图参数
  THUMBNAIL: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.8
  }
} as const;

// 处理结果
export interface ProcessedImageResult {
  id: string;
  original: {
    blob: Blob;
    url: string;
    width: number;
    height: number;
    size: number;
    wasCompressed: boolean;
  };
  thumbnail: {
    blob: Blob;
    url: string;
    width: number;
    height: number;
    size: number;
  };
  metadata: {
    originalName: string;
    originalSize: number;
    compressionRatio: number;
    processingTime: number;
    strategy: string;
  };
}

// 图片信息
export interface ImageInfo {
  width: number;
  height: number;
  size: number;
  type: string;
  aspectRatio: number;
}

class SmartImageProcessor {
  // 获取图片信息
  private async getImageInfo(file: File): Promise<ImageInfo> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: file.size,
          type: file.type,
          aspectRatio: img.naturalWidth / img.naturalHeight
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  // 选择压缩策略
  private selectCompressionStrategy(file: File, imageInfo: ImageInfo): {
    strategy: keyof typeof IMAGE_CONFIG.COMPRESSION;
    config: typeof IMAGE_CONFIG.COMPRESSION[keyof typeof IMAGE_CONFIG.COMPRESSION];
    reason: string;
  } {
    const { size } = file;
    const { width, height } = imageInfo;

    // 1. 小文件：保持原始质量
    if (size <= IMAGE_CONFIG.NO_COMPRESSION_LIMIT) {
      return {
        strategy: 'NONE',
        config: IMAGE_CONFIG.COMPRESSION.NONE,
        reason: `文件小于500KB (${Math.round(size/1024)}KB)，保持原始质量`
      };
    }

    // 2. 中等文件：轻度压缩
    if (size <= IMAGE_CONFIG.SMALL_IMAGE_LIMIT) {
      return {
        strategy: 'LIGHT',
        config: IMAGE_CONFIG.COMPRESSION.LIGHT,
        reason: `文件在500KB-1MB范围 (${Math.round(size/1024)}KB)，轻度压缩`
      };
    }

    // 3. 大文件：标准压缩
    if (size <= IMAGE_CONFIG.LARGE_IMAGE_LIMIT) {
      return {
        strategy: 'STANDARD',
        config: IMAGE_CONFIG.COMPRESSION.STANDARD,
        reason: `文件在1MB-3MB范围 (${Math.round(size/1024)}KB)，标准压缩`
      };
    }

    // 4. 超大文件：积极压缩
    return {
      strategy: 'AGGRESSIVE',
      config: IMAGE_CONFIG.COMPRESSION.AGGRESSIVE,
      reason: `文件超过3MB (${Math.round(size/1024)}KB)，积极压缩`
    };
  }

  // 压缩图片
  private async compressImage(
    file: File,
    imageInfo: ImageInfo,
    config: typeof IMAGE_CONFIG.COMPRESSION[keyof typeof IMAGE_CONFIG.COMPRESSION]
  ): Promise<{ blob: Blob; wasCompressed: boolean }> {
    // 如果不需要压缩，直接返回原文件
    if (config.quality === 1.0 && config.maxWidth === Infinity) {
      return {
        blob: file,
        wasCompressed: false
      };
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      img.onload = () => {
        const { width: originalWidth, height: originalHeight } = imageInfo;
        
        // 计算新尺寸
        const scale = Math.min(
          config.maxWidth / originalWidth,
          config.maxWidth / originalHeight,
          1 // 不放大图片
        );
        
        const newWidth = Math.floor(originalWidth * scale);
        const newHeight = Math.floor(originalHeight * scale);
        
        // 设置画布尺寸
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // 高质量渲染设置
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                wasCompressed: true
              });
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type.startsWith('image/png') ? 'image/png' : 'image/jpeg',
          config.quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  }

  // 创建缩略图
  private async createThumbnail(file: File, imageInfo: ImageInfo): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      img.onload = () => {
        const { width: originalWidth, height: originalHeight } = imageInfo;
        const { maxWidth, maxHeight, quality } = IMAGE_CONFIG.THUMBNAIL;
        
        // 计算缩略图尺寸（保持宽高比）
        const scale = Math.min(
          maxWidth / originalWidth,
          maxHeight / originalHeight,
          1
        );
        
        const thumbnailWidth = Math.floor(originalWidth * scale);
        const thumbnailHeight = Math.floor(originalHeight * scale);
        
        canvas.width = thumbnailWidth;
        canvas.height = thumbnailHeight;
        
        // 高质量渲染
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, thumbnailWidth, thumbnailHeight);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create thumbnail'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
      img.src = URL.createObjectURL(file);
    });
  }

  // 主处理方法
  async processImage(file: File, postId: string, order: number): Promise<ProcessedImageResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🖼️ 开始处理图片: ${file.name} (${Math.round(file.size/1024)}KB)`);
      
      // 1. 获取图片信息
      const imageInfo = await this.getImageInfo(file);
      console.log(`📏 图片信息: ${imageInfo.width}x${imageInfo.height}, ${Math.round(file.size/1024)}KB`);
      
      // 2. 选择压缩策略
      const { strategy, config, reason } = this.selectCompressionStrategy(file, imageInfo);
      console.log(`🎯 压缩策略: ${strategy} - ${reason}`);
      
      // 3. 处理主图
      const { blob: originalBlob, wasCompressed } = await this.compressImage(file, imageInfo, config);
      const originalUrl = URL.createObjectURL(originalBlob);
      
      // 4. 创建缩略图
      const thumbnailBlob = await this.createThumbnail(file, imageInfo);
      const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
      
      // 5. 生成ID并保存到IndexedDB
      const imageId = `img_${Date.now()}_${order}`;
      
      await indexedDBStore.saveImage({
        id: imageId,
        postId,
        file: originalBlob instanceof File ? originalBlob : new File([originalBlob], file.name, { type: originalBlob.type }),
        metadata: {
          originalName: file.name,
          size: originalBlob.size,
          type: originalBlob.type,
          width: imageInfo.width,
          height: imageInfo.height,
          order
        }
      });
      
      const processingTime = Date.now() - startTime;
      const compressionRatio = originalBlob.size / file.size;
      
      console.log(`✅ 图片处理完成: ${imageId}`);
      console.log(`📊 压缩效果: ${Math.round(file.size/1024)}KB → ${Math.round(originalBlob.size/1024)}KB (${Math.round((1-compressionRatio)*100)}% 减少)`);
      console.log(`⏱️ 处理时间: ${processingTime}ms`);
      
      // 6. 获取缩略图尺寸
      const thumbnailInfo = await this.getImageInfo(new File([thumbnailBlob], 'thumbnail.jpg'));
      
      return {
        id: imageId,
        original: {
          blob: originalBlob,
          url: originalUrl,
          width: imageInfo.width,
          height: imageInfo.height,
          size: originalBlob.size,
          wasCompressed
        },
        thumbnail: {
          blob: thumbnailBlob,
          url: thumbnailUrl,
          width: thumbnailInfo.width,
          height: thumbnailInfo.height,
          size: thumbnailBlob.size
        },
        metadata: {
          originalName: file.name,
          originalSize: file.size,
          compressionRatio,
          processingTime,
          strategy
        }
      };
      
    } catch (error) {
      console.error(`❌ 图片处理失败: ${file.name}`, error);
      throw error;
    }
  }

  // 批量处理图片
  async processImages(files: File[], postId: string): Promise<ProcessedImageResult[]> {
    console.log(`🚀 开始批量处理 ${files.length} 张图片`);
    
    const results: ProcessedImageResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.processImage(files[i], postId, i);
        results.push(result);
      } catch (error) {
        console.error(`❌ 处理第 ${i + 1} 张图片失败:`, error);
        throw error;
      }
    }
    
    console.log(`🎉 批量处理完成: ${results.length}/${files.length} 张图片成功`);
    
    // 统计信息
    const totalOriginalSize = files.reduce((sum, file) => sum + file.size, 0);
    const totalProcessedSize = results.reduce((sum, result) => sum + result.original.size, 0);
    const totalSavings = totalOriginalSize - totalProcessedSize;
    const avgCompressionRatio = results.reduce((sum, result) => sum + result.metadata.compressionRatio, 0) / results.length;
    
    console.log(`📊 批量处理统计:`);
    console.log(`   原始大小: ${Math.round(totalOriginalSize/1024)}KB`);
    console.log(`   处理后大小: ${Math.round(totalProcessedSize/1024)}KB`);
    console.log(`   节省空间: ${Math.round(totalSavings/1024)}KB (${Math.round((1-avgCompressionRatio)*100)}%)`);
    
    return results;
  }

  // 获取存储的图片
  async getStoredImage(imageId: string): Promise<string | null> {
    try {
      return await indexedDBStore.getImageUrl(imageId);
    } catch (error) {
      console.error(`❌ 获取图片失败: ${imageId}`, error);
      return null;
    }
  }

  // 清理过期的Object URLs
  static cleanupObjectUrls(urls: string[]): void {
    urls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }
}

// 创建全局实例
export const smartImageProcessor = new SmartImageProcessor();

// 工具函数：格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// 工具函数：检查是否支持IndexedDB
export function isIndexedDBSupported(): boolean {
  return 'indexedDB' in window && indexedDB !== null;
}

export { SmartImageProcessor };
