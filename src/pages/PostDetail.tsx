import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PinterestHeader } from '@/components/PinterestHeader';
import { PinterestSidebar } from '@/components/PinterestSidebar';
import { Filmstrip } from '@/components/Filmstrip';
import { CommentSection } from '@/components/CommentSection';
import { PostRecommendations } from '@/components/PostRecommendations';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { usePostDetail, useLikePost, useUserPosts } from '@/hooks/usePosts';
import { formatDistanceToNow } from 'date-fns';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [maxViewedIndex, setMaxViewedIndex] = useState(0);
  const [isProgressComplete, setIsProgressComplete] = useState(false);

  // 图片变换状态 - 简化的滚动管理
  const [imageTransformStates, setImageTransformStates] = useState<Record<number, number>>({}); // 每张图片的transform translateY值
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const parentContainerRef = useRef<HTMLDivElement>(null); // 新增：父容器引用，作为稳定的基准
  const [baseContainerDimensions, setBaseContainerDimensions] = useState({ width: 0, height: 0 });
  
  // 移除可能导致不稳定的状态
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef<boolean>(false); // 防止递归更新

  // 使用React Query获取实际的帖子数据
  const { 
    data: post, 
    isLoading, 
    error, 
    refetch
  } = usePostDetail(postId || '');

  // 获取作者的其他帖子
  const { 
    data: authorPostsData 
  } = useUserPosts({ 
    userId: post?.authorId || '',
  });

  // 交互功能hooks
  const likeMutation = useLikePost();

  // 修复的图片显示计算 - 重新区分横版/竖版处理
  const calculateImageDisplay = useCallback((
    imageWidth: number,
    imageHeight: number,
    containerWidth: number,
    containerHeight: number,
    displayPercent: number
  ) => {
    // 确保输入参数有效
    if (!imageWidth || !imageHeight || !containerWidth) {
      return {
        mode: 'full' as const,
        viewportHeight: 400,
        imageScale: 1,
        imageTranslateY: 0,
        maxTranslateY: 0,
        canScrollDown: false,
        isHorizontal: false,
        useObjectCover: false
      };
    }

    // 计算图片在容器中的最佳显示尺寸（保持比例）
    const maxViewportHeight = Math.min(containerHeight || 600, 800);
    const minViewportHeight = 300;
    
    // 判断图片是否为横版
    const isHorizontal = imageWidth > imageHeight;
    const aspectRatio = imageWidth / imageHeight;
    
    // 优化的缩放策略：为竖版图片提供更大的显示尺寸
    let scale: number;
    let scaledWidth: number;
    let scaledHeight: number;
    
    if (isHorizontal) {
      // 横版图片：使用容器宽度优先，确保充分利用宽度
      scale = Math.min(containerWidth / imageWidth, maxViewportHeight / imageHeight);
      scaledWidth = imageWidth * scale;
      scaledHeight = imageHeight * scale;
    } else {
      // 竖版图片：优先考虑可读性，使用更大的缩放比例
      const widthScale = containerWidth / imageWidth;
      const heightScale = maxViewportHeight / imageHeight;
      
      // 对于竖版图片，优先使用宽度缩放，但限制最大高度
      scale = widthScale;
      scaledWidth = imageWidth * scale;
      scaledHeight = imageHeight * scale;
      
      // 如果缩放后高度超过限制，则适当调整，但保持较大的显示尺寸
      if (scaledHeight > maxViewportHeight * 1.5) {
        scale = Math.min(widthScale, (maxViewportHeight * 1.5) / imageHeight);
        scaledWidth = imageWidth * scale;
        scaledHeight = imageHeight * scale;
      }
    }
    
    // 所有图片都使用object-contain，确保内容不被裁剪
    const useObjectCover = false;
    
    if (displayPercent === 100) {
      // 100%模式：显示完整图片
      const viewportHeight = Math.max(
        minViewportHeight,
        Math.min(scaledHeight, maxViewportHeight)
      );
      
      const needsScroll = scaledHeight > viewportHeight;
      
      console.log(`🔍 100%模式计算 (${isHorizontal ? '横版' : '竖版'}):`, {
        原始尺寸: `${imageWidth}x${imageHeight}`,
        容器宽度: containerWidth,
        缩放比例: scale.toFixed(3),
        缩放后尺寸: `${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)}`,
        视窗高度: viewportHeight.toFixed(1),
        需要滚动: needsScroll,
        使用objectCover: useObjectCover
      });
      
      return {
        mode: 'full' as const,
        viewportHeight,
        imageScale: scale,
        imageTranslateY: 0,
        maxTranslateY: needsScroll ? scaledHeight - viewportHeight : 0,
        canScrollDown: needsScroll,
        scaledImageHeight: scaledHeight,
        scaledImageWidth: scaledWidth,
        isHorizontal,
        useObjectCover,
        aspectRatio
      };
    } else {
      // 50%模式：限制可视区域高度，为竖版图片提供更大的视窗
      let fullImageViewHeight: number;
      let partialViewHeight: number;
      let viewportHeight: number;
      
      if (isHorizontal) {
        // 横版图片：使用原有逻辑
        fullImageViewHeight = Math.min(scaledHeight, maxViewportHeight);
        partialViewHeight = fullImageViewHeight * (displayPercent / 100);
        viewportHeight = Math.max(minViewportHeight, partialViewHeight);
      } else {
        // 竖版图片：提供更大的视窗，改善可读性
        fullImageViewHeight = Math.min(scaledHeight, maxViewportHeight * 1.2); // 允许更高的视窗
        partialViewHeight = fullImageViewHeight * (displayPercent / 100);
        
        // 为竖版图片提供更大的最小视窗高度
        const verticalMinHeight = Math.max(minViewportHeight, 450); // 竖版图片最小450px
        viewportHeight = Math.max(verticalMinHeight, partialViewHeight);
      }
      
      const maxTranslateY = Math.max(0, scaledHeight - viewportHeight);
      const canScrollDown = scaledHeight > viewportHeight;
      
      console.log(`🔍 50%模式计算 (${isHorizontal ? '横版' : '竖版'}):`, {
        原始尺寸: `${imageWidth}x${imageHeight}`,
        容器宽度: containerWidth,
        缩放比例: scale.toFixed(3),
        缩放后尺寸: `${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)}`,
        完整视图高度: fullImageViewHeight.toFixed(1),
        部分视图高度: partialViewHeight.toFixed(1),
        最终视窗高度: viewportHeight.toFixed(1),
        最大滚动距离: maxTranslateY.toFixed(1),
        可以滚动: canScrollDown,
        使用objectCover: useObjectCover
      });
      
      return {
        mode: 'percent' as const,
        viewportHeight,
        imageScale: scale,
        imageTranslateY: 0,
        maxTranslateY,
        canScrollDown,
        scaledImageHeight: scaledHeight,
        scaledImageWidth: scaledWidth,
        isHorizontal,
        useObjectCover,
        aspectRatio,
        displayPercent
      };
    }
  }, []);

  // 计算所有图片的显示参数 - 使用稳定的基准尺寸
  const imageDisplayMeta = useMemo(() => {
    if (!post?.images || !baseContainerDimensions.width) {
      console.log(`⚠️ 无法计算图片显示参数:`, {
        hasPost: !!post,
        hasImages: !!post?.images,
        imagesCount: post?.images?.length || 0,
        baseContainerDimensions,
        postDefaultPercent: post?.defaultDisplayPercent
      });
      return {};
    }

    // 使用固定的基准高度，避免反馈回路
    const stableBaseWidth = baseContainerDimensions.width;
    const stableBaseHeight = 600; // 固定基准高度，不依赖动态容器高度

    console.log(`📊 开始计算图片显示参数:`, {
      图片数量: post.images.length,
      基准尺寸: `${stableBaseWidth}x${stableBaseHeight}`,
      默认百分比: post.defaultDisplayPercent,
      当前活跃图片: activeImageIndex
    });

    const meta: Record<number, any> = {};
    post.images.forEach((image, index) => {
      const displayPercent = image.displayPercent || post.defaultDisplayPercent || 50;
      
      const result = calculateImageDisplay(
        image.width,
        image.height,
        stableBaseWidth,
        stableBaseHeight,
        displayPercent
      );
      
      console.log(`🖼️ Image ${index} 计算结果:`, {
        原始尺寸: `${image.width}x${image.height}`,
        基准尺寸: `${stableBaseWidth}x${stableBaseHeight}`,
        displayPercent: `${displayPercent}%`,
        模式: result.mode,
        视窗高度: `${result.viewportHeight}px`,
        缩放比例: result.imageScale
      });
      
      meta[index] = result;
    });

    return meta;
  }, [post?.images, post?.defaultDisplayPercent, baseContainerDimensions.width, calculateImageDisplay]);

  // 稳定的尺寸更新函数 - 基于父容器
  const updateBaseDimensions = useCallback(() => {
    // 防止递归更新
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    // 清除之前的延迟更新
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // 延迟更新以避免频繁计算
    updateTimeoutRef.current = setTimeout(() => {
      // 使用父容器或者页面主要内容区域作为基准
      const parentElement = parentContainerRef.current || 
                           document.querySelector('.flex-1.max-w-4xl') ||
                           document.querySelector('main') ||
                           document.body;

      if (!parentElement) {
        isUpdatingRef.current = false;
        return;
      }

      const rect = parentElement.getBoundingClientRect();
      
      // 使用更保守的尺寸计算，减少浮点误差
      const newWidth = Math.round(rect.width * 0.9); // 留出10%的边距
      
      setBaseContainerDimensions(prev => {
        // 只有在宽度变化超过阈值时才更新（避免微小变化触发更新）
        const widthDiff = Math.abs(prev.width - newWidth);
        if (widthDiff > 10) { // 10px阈值
          console.log('📐 基准容器尺寸更新:', {
            from: `${prev.width}`,
            to: `${newWidth}`,
            source: parentElement.className || 'body'
          });
          return { width: newWidth, height: 600 }; // 高度保持固定
        }
        return prev;
      });

      isUpdatingRef.current = false;
    }, 150); // 稍微延长延迟，确保稳定性
  }, []);

  // 简化的尺寸监听 - 避免过度复杂的监听器
  useEffect(() => {
    // 初始化基准尺寸
    updateBaseDimensions();

    // 只监听关键的resize事件
    const handleResize = () => {
      updateBaseDimensions();
    };

    // 使用节流的resize监听
    let resizeTimeout: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 200);
    };

    window.addEventListener('resize', throttledResize);

    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(resizeTimeout);
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [updateBaseDimensions]);

  // 当切换图片时，恢复该图片的变换位置（新架构不需要特殊处理）
  // 变换状态会在JSX渲染时自动应用，无需额外的useEffect

  // 移除可能导致反馈回路的缩放恢复机制

  // 处理图片滚动 - 修复passive event listener问题
  const handleImageWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const currentTransform = imageTransformStates[activeImageIndex] || 0;
    const maxTransform = imageDisplayMeta[activeImageIndex]?.maxTranslateY || 0;
    
    // 只有在可以滚动时才处理
    if (maxTransform > 0) {
      const delta = e.deltaY * 0.75; // 调整滚动灵敏度
      const newTransform = Math.max(-maxTransform, Math.min(0, currentTransform - delta));
      
      setImageTransformStates(prev => ({
        ...prev,
        [activeImageIndex]: newTransform
      }));
    }
  }, [activeImageIndex, imageDisplayMeta, imageTransformStates]);

  // 添加原生事件监听器来处理wheel事件
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    // 添加非passive的wheel事件监听器
    container.addEventListener('wheel', handleImageWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleImageWheel);
    };
  }, [handleImageWheel]);

  const handleImageSwitch = (index: number) => {
    if (post?.images && index >= 0 && index < post.images.length) {
    setActiveImageIndex(index);
      // 更新最大浏览索引（进度只增不减）
      if (index > maxViewedIndex) {
        setMaxViewedIndex(index);
        // 检查是否达到100%
        if (index === post.images.length - 1) {
          setIsProgressComplete(true);
        }
      }
    }
  };

  const handlePrevImage = () => {
    if (activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
      // 不更新maxViewedIndex，保持进度不减
    }
  };

  const handleNextImage = () => {
    if (post?.images && activeImageIndex < post.images.length - 1) {
      const newIndex = activeImageIndex + 1;
      setActiveImageIndex(newIndex);
      // 更新最大浏览索引（进度只增不减）
      if (newIndex > maxViewedIndex) {
        setMaxViewedIndex(newIndex);
        // 检查是否达到100%
        if (newIndex === post.images.length - 1) {
          setIsProgressComplete(true);
        }
      }
    }
  };


  const handleBack = () => {
    navigate(-1);
  };

  const handleAvatarClick = () => {
    if (post?.author?.id) {
      navigate(`/profile/${post.author.id}`);
    }
  };

  const handleLike = () => {
    if (post) {
      likeMutation.mutate({ 
        postId: post.id, 
        isLiked: post.isLikedByCurrentUser || false 
      });
    }
  };


  // 格式化时间戳
  const formatTimestamp = (timestamp: string | Date) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return typeof timestamp === 'string' ? timestamp : timestamp.toISOString();
    }
  };

  // 转换图片格式给Filmstrip组件
  const filmstripImages = post?.images?.map((img, index) => ({
    id: img.id,
    url: img.url,
    thumbUrl: img.thumbUrl,
    isActive: index === activeImageIndex,
    index: index
  })) || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PinterestHeader />
        <div className="max-w-7xl mx-auto flex">
          <PinterestSidebar />
          <div className="flex-1 max-w-4xl mx-auto">
            <div className="p-4 space-y-4">
              <Skeleton className="h-8 w-32" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <PinterestHeader />
        <div className="max-w-7xl mx-auto flex">
          <PinterestSidebar />
          <div className="flex-1 max-w-4xl mx-auto">
            <div className="p-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load post. Please try again.
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()}
                    className="ml-2"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PinterestHeader />
      <div className="flex">
        <PinterestSidebar />
        
        {/* Main Content - 扩大宽度以适应横版图片 */}
        <div ref={parentContainerRef} className="flex-1 max-w-4xl mx-auto">
          {/* Header */}
          {/* <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Post</h1>
          </div> */}

          {/* Post Content */}
          <div className="p-4">
            {/* Author Header */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={post.author?.avatar}
                alt={post.author?.displayName}
                className="w-12 h-12 rounded-full cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                onClick={handleAvatarClick}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground">
                    {post.author?.displayName}
                  </h3>
                  {post.author?.verified && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground">@{post.author?.username}</p>
              </div>
            </div>

            {/* Post Type Badge */}

            {/* Post Text */}
            <p className="text-foreground text-lg leading-relaxed mb-4">{post.content}</p>

            {/* Relationship and Feelings */}
            {/* {(post.relationship || (post.feelings && post.feelings.length > 0)) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {post.relationship && (
                  <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm">
                    {post.relationship}
                  </span>
                )}
                {post.feelings?.map((feeling) => (
                  <span key={feeling} className="inline-block bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                    {feeling}
                  </span>
                ))}
              </div>
            )} */}

            {/* Main Image Area - 新架构：简化的图片展示 */}
            {post.images && post.images.length > 0 && (
            <div className="mb-4">
                <div 
                  ref={imageContainerRef}
                  className="relative w-full rounded-2xl overflow-hidden group"
                  style={{
                    height: baseContainerDimensions.width > 0 
                      ? `${imageDisplayMeta[activeImageIndex]?.viewportHeight || 600}px`
                      : '600px', // 默认高度，等待基准尺寸初始化
                    minHeight: '300px', // 最小高度防止布局抖动
                    maxHeight: '800px',  // 最大高度防止过高
                    backgroundColor: 'transparent' // 移除背景色，确保容器不可见
                  }}
                  onMouseEnter={() => setIsHoveringImage(true)}
                  onMouseLeave={() => setIsHoveringImage(false)}
                >
                  {/* 统一的图片显示策略：所有图片都使用object-contain保持完整比例 */}
                  <div className="w-full h-full relative">
                    <div className="w-full h-full flex items-start justify-center">
                      <img
                        src={post.images[activeImageIndex]?.url}
                alt="Post content"
                        className="object-contain"
                        style={{
                          width: `${imageDisplayMeta[activeImageIndex]?.scaledImageWidth || 'auto'}px`,
                          height: `${imageDisplayMeta[activeImageIndex]?.scaledImageHeight || 'auto'}px`,
                          transform: `translateY(${imageTransformStates[activeImageIndex] || 0}px)`,
                          transition: 'transform 0.1s ease-out'
                        }}
                        onLoad={() => {
                          console.log(`📷 图片 ${activeImageIndex} 加载完成 (${imageDisplayMeta[activeImageIndex]?.isHorizontal ? '横版' : '竖版'}):`, {
                            naturalSize: `${post.images[activeImageIndex]?.width}x${post.images[activeImageIndex]?.height}`,
                            viewportHeight: imageDisplayMeta[activeImageIndex]?.viewportHeight,
                            scaledSize: `${imageDisplayMeta[activeImageIndex]?.scaledImageWidth}x${imageDisplayMeta[activeImageIndex]?.scaledImageHeight}`,
                            maxTranslateY: imageDisplayMeta[activeImageIndex]?.maxTranslateY,
                            canScrollDown: imageDisplayMeta[activeImageIndex]?.canScrollDown,
                            currentTransform: imageTransformStates[activeImageIndex] || 0,
                            isHorizontal: imageDisplayMeta[activeImageIndex]?.isHorizontal,
                            mode: imageDisplayMeta[activeImageIndex]?.mode,
                            displayPercent: imageDisplayMeta[activeImageIndex]?.displayPercent
                          });
                        }}
              />
            </div>

                    {/* 滚动指示器 - 当可以向下滚动时显示 */}
                    {/* {imageDisplayMeta[activeImageIndex]?.canScrollDown && 
                     Math.abs(imageTransformStates[activeImageIndex] || 0) < (imageDisplayMeta[activeImageIndex]?.maxTranslateY || 0) * 0.1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm animate-bounce z-10">
                        ↓ Scroll to see more
                      </div>
                    )} */}
                  </div>

                  {/* Navigation buttons - only show when hovering and multiple images */}
                  {post.images.length > 1 && isHoveringImage && (
                    <>
                      {/* Previous button */}
                      {activeImageIndex > 0 && (
                        <Button
                          onClick={handlePrevImage}
                          variant="ghost"
                          size="sm"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </Button>
                      )}

                      {/* Next button */}
                      {activeImageIndex < post.images.length - 1 && (
                        <Button
                          onClick={handleNextImage}
                          variant="ghost"
                          size="sm"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </Button>
                      )}
                    </>
                  )}
                  
                  {/* Image index indicator for multiple images */}
                  {post.images.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/70 text-white rounded-full px-3 py-1 text-sm font-medium z-10">
                      {activeImageIndex + 1} / {post.images.length}
                    </div>
                  )}

                  {/* Scroll hint - show when there's more content to scroll */}
                  {/* {imageDisplayMeta[activeImageIndex]?.canScrollDown && 
                   (imageScrollStates[activeImageIndex] || 0) < (imageDisplayMeta[activeImageIndex]?.maxScrollTop / 2) && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm animate-bounce z-10">
                      ↓ Scroll to see more
                    </div>
                  )} */}
                </div>
              </div>
            )}

            {/* Filmstrip - only show if multiple images */}
            {post.images && post.images.length > 1 && (
              <div className="space-y-3">
            <Filmstrip
                  images={filmstripImages}
              activeIndex={activeImageIndex}
              onImageSelect={handleImageSwitch}
            />

                {/* Progress Bar */}

              </div>
            )}

            {/* Post Tags */}
            {(post.app || post.relationship || (post.feelings && post.feelings.length > 0)) && (
              <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-border">
                {post.app && (
                  <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    {post.app.category}: {post.app.app}
                  </span>
                )}
                {post.relationship && (
                  <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                    {post.relationship}
                  </span>
                )}
                {post.feelings && post.feelings.map((feeling, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {feeling}
                  </span>
                ))}
            </div>
            )}

            {/* Pinterest-style Actions */}
            <div className="flex items-center justify-between py-4 border-t border-border mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-2 ${
                  post.isLikedByCurrentUser 
                    ? 'text-red-600' 
                    : 'text-muted-foreground hover:text-red-600'
                }`}
                onClick={handleLike}
                disabled={likeMutation.isPending}
              >
                <Heart className={`w-5 h-5 ${post.isLikedByCurrentUser ? 'fill-current' : ''}`} />
                <span>{post.likesCount}</span>
              </Button>
              

              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Share className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-4 border-t border-border">
            <CommentSection postId={post.id} />
          </div>
        </div>

        {/* Right Sidebar - 减小宽度为主内容让出更多空间 */}
        <div className="hidden xl:block w-72 p-6 space-y-6">
          {/* Author More Content */}
          {post.author && (
          <div className="bg-card rounded-2xl p-4 border border-border">
              <h3 className="text-lg font-bold mb-4">
                More from {post.author.displayName}
              </h3>
            <div className="space-y-3">
                {authorPostsData?.posts?.slice(0, 3).map((authorPost) => (
                  <div key={authorPost.id} className="flex gap-3">
                    <img
                      src={post.author?.avatar}
                      alt={post.author?.displayName}
                      className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                      onClick={handleAvatarClick}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {post.author?.displayName}
                        </span>
                        {/* <span className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(authorPost.createdAt), { addSuffix: true })}
                        </span> */}
                  </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {authorPost.content}
                      </p>
                    </div>
                  </div>
                ))}
                {(!authorPostsData?.posts || authorPostsData.posts.length === 0) && (
                  <p className="text-muted-foreground text-sm">No other posts yet.</p>
                )}
              </div>
            </div>
          )}

        {/* Post Recommendations */}
        <PostRecommendations maxPosts={3} currentPostId={postId} />
        </div>
      </div>
    </div>
  );
};

export default PostDetail;