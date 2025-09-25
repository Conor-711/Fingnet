/**
 * 存储管理器组件
 * 提供存储配额监控、数据迁移状态、清理工具等功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  HardDrive, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Upload,
  BarChart3,
  Settings,
  Info
} from 'lucide-react';

import { enhancedMockApi } from '@/lib/enhancedMockApi';
import { formatFileSize } from '@/lib/smartImageProcessor';
import { formatDataSize, formatMigrationTime } from '@/lib/dataMigration';
import type { StorageQuota, MigrationStatus } from '@/lib/enhancedMockApi';

interface StorageManagerProps {
  className?: string;
}

interface StorageStats {
  quota: StorageQuota;
  dataCount: {
    users: number;
    posts: number;
    images: number;
    comments: number;
    follows: number;
  };
  performance: {
    storageType: string;
    migrationCompleted: boolean;
    lastMaintenance: number;
  };
}

export function StorageManager({ className }: StorageManagerProps) {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);

  // 加载存储统计信息
  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [storageStats, migrationData] = await Promise.all([
        enhancedMockApi.storage.getStats(),
        enhancedMockApi.migration.getStatus()
      ]);
      
      setStats(storageStats);
      setMigrationStatus(migrationData);
    } catch (error) {
      console.error('❌ 加载存储统计失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 执行清理操作
  const handleCleanup = async () => {
    try {
      setIsCleaningUp(true);
      const result = await enhancedMockApi.storage.cleanup();
      setCleanupResult(result);
      
      // 重新加载统计信息
      await loadStats();
    } catch (error) {
      console.error('❌ 清理操作失败:', error);
    } finally {
      setIsCleaningUp(false);
    }
  };

  // 执行完全清理
  const handleClearAll = async () => {
    if (window.confirm('⚠️ 这将删除所有数据，此操作不可恢复！确定要继续吗？')) {
      try {
        await enhancedMockApi.storage.clearAll();
        await loadStats();
        alert('✅ 所有数据已清除');
      } catch (error) {
        console.error('❌ 清除数据失败:', error);
      }
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            存储管理器
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">加载中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          存储管理器
        </CardTitle>
        <CardDescription>
          管理应用数据存储、监控配额使用情况
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="migration">迁移状态</TabsTrigger>
            <TabsTrigger value="maintenance">维护工具</TabsTrigger>
            <TabsTrigger value="details">详细信息</TabsTrigger>
          </TabsList>

          {/* 概览标签页 */}
          <TabsContent value="overview" className="space-y-4">
            {stats && (
              <>
                {/* 存储配额 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <HardDrive className="w-5 h-5" />
                      存储配额
                    </h3>
                    <Badge variant={stats.quota.percentage > 80 ? 'destructive' : 'secondary'}>
                      {stats.quota.percentage.toFixed(1)}% 已使用
                    </Badge>
                  </div>
                  
                  <Progress value={stats.quota.percentage} className="w-full" />
                  
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <div className="font-medium">已使用</div>
                      <div>{formatFileSize(stats.quota.used)}</div>
                    </div>
                    <div>
                      <div className="font-medium">可用</div>
                      <div>{formatFileSize(stats.quota.available)}</div>
                    </div>
                    <div>
                      <div className="font-medium">总计</div>
                      <div>{formatFileSize(stats.quota.total)}</div>
                    </div>
                  </div>
                </div>

                {/* 数据统计 */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    数据统计
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-2xl font-bold">{stats.dataCount.users}</div>
                      <div className="text-sm text-muted-foreground">用户</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-2xl font-bold">{stats.dataCount.posts}</div>
                      <div className="text-sm text-muted-foreground">帖子</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-2xl font-bold">{stats.dataCount.images}</div>
                      <div className="text-sm text-muted-foreground">图片</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-2xl font-bold">{stats.dataCount.comments}</div>
                      <div className="text-sm text-muted-foreground">评论</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-2xl font-bold">{stats.dataCount.follows}</div>
                      <div className="text-sm text-muted-foreground">关注</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-green-600">IndexedDB</div>
                      <div className="text-sm text-muted-foreground">存储类型</div>
                    </div>
                  </div>
                </div>

                {/* 存储建议 */}
                {stats.quota.percentage > 80 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      存储空间使用率较高，建议执行清理操作释放空间。
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </TabsContent>

          {/* 迁移状态标签页 */}
          <TabsContent value="migration" className="space-y-4">
            {migrationStatus && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    数据迁移状态
                  </h3>
                  <Badge variant={migrationStatus.isCompleted ? 'default' : 'secondary'}>
                    {migrationStatus.isCompleted ? '已完成' : migrationStatus.isInProgress ? '进行中' : '待迁移'}
                  </Badge>
                </div>

                {migrationStatus.isCompleted ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      数据迁移已完成！现在使用IndexedDB存储，享受更大存储空间和更好性能。
                    </AlertDescription>
                  </Alert>
                ) : migrationStatus.isRequired ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      检测到localStorage数据，建议执行迁移以获得更好性能。
                    </AlertDescription>
                  </Alert>
                ) : null}

                {migrationStatus.isCompleted && (
                  <div className="space-y-4">
                    <h4 className="font-medium">迁移统计</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">用户</div>
                        <div className="text-muted-foreground">{migrationStatus.statistics.migratedUsers}</div>
                      </div>
                      <div>
                        <div className="font-medium">帖子</div>
                        <div className="text-muted-foreground">{migrationStatus.statistics.migratedPosts}</div>
                      </div>
                      <div>
                        <div className="font-medium">图片</div>
                        <div className="text-muted-foreground">{migrationStatus.statistics.migratedImages}</div>
                      </div>
                      <div>
                        <div className="font-medium">评论</div>
                        <div className="text-muted-foreground">{migrationStatus.statistics.migratedComments}</div>
                      </div>
                      <div>
                        <div className="font-medium">关注</div>
                        <div className="text-muted-foreground">{migrationStatus.statistics.migratedFollows}</div>
                      </div>
                      <div>
                        <div className="font-medium">耗时</div>
                        <div className="text-muted-foreground">
                          {formatMigrationTime(migrationStatus.statistics.migrationTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {migrationStatus.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-destructive">迁移错误</h4>
                    <div className="text-sm text-muted-foreground">
                      {migrationStatus.errors.map((error, index) => (
                        <div key={index} className="p-2 bg-destructive/10 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* 维护工具标签页 */}
          <TabsContent value="maintenance" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                维护工具
              </h3>

              <div className="space-y-4">
                {/* 数据清理 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">数据清理</CardTitle>
                    <CardDescription>
                      清理过期图片和旧帖子，释放存储空间
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleCleanup}
                      disabled={isCleaningUp}
                      className="w-full"
                    >
                      {isCleaningUp ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          清理中...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          执行清理
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* 清理结果 */}
                {cleanupResult && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      清理完成！删除了 {cleanupResult.deletedImages} 张图片和 {cleanupResult.deletedPosts} 个帖子，
                      释放了 {formatFileSize(cleanupResult.freedSpace)} 空间。
                    </AlertDescription>
                  </Alert>
                )}

                {/* 完全清理 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-destructive">危险操作</CardTitle>
                    <CardDescription>
                      完全清除所有数据，此操作不可恢复
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="destructive" 
                      onClick={handleClearAll}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      清除所有数据
                    </Button>
                  </CardContent>
                </Card>

                {/* 刷新统计 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">刷新统计</CardTitle>
                    <CardDescription>
                      重新计算存储使用情况和数据统计
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      onClick={loadStats}
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      刷新统计
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 详细信息标签页 */}
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Info className="w-5 h-5" />
                技术详情
              </h3>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">存储技术</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>主存储</span>
                        <span className="font-mono">IndexedDB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>图片存储</span>
                        <span className="font-mono">Blob</span>
                      </div>
                      <div className="flex justify-between">
                        <span>压缩策略</span>
                        <span className="font-mono">智能压缩</span>
                      </div>
                      <div className="flex justify-between">
                        <span>事务支持</span>
                        <span className="font-mono">✓</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">性能特点</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>异步操作</span>
                        <span className="font-mono">✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span>索引查询</span>
                        <span className="font-mono">✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span>自动清理</span>
                        <span className="font-mono">✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span>版本管理</span>
                        <span className="font-mono">v1.0</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    IndexedDB提供了比localStorage更大的存储容量（通常为硬盘空间的50%）和更好的性能。
                    所有图片以二进制格式存储，避免了Base64编码的空间浪费。
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default StorageManager;
