import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppSelector } from '@/components/AppSelector';
import { PinterestSidebar } from '@/components/PinterestSidebar';
import { ArrowLeft, X, Image as ImageIcon, Share, User, Lock, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatePost } from '@/hooks/usePosts';
import { AppSelection } from '@/types/post';

type PostType = 'share' | 'post' | 'memory';

const SharePost = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const createPostMutation = useCreatePost();
  
  const [story, setStory] = useState('');
  const [relationship, setRelationship] = useState('');
  const [app, setApp] = useState<AppSelection | undefined>();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0); // 封面图片索引，默认第一张
  const [postType, setPostType] = useState<PostType>('share');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Percent字段相关状态
  const [defaultDisplayPercent, setDefaultDisplayPercent] = useState<number>(50); // 默认显示百分比
  const [individualPercents, setIndividualPercents] = useState<Record<number, number>>({}); // 每张图片的单独设置
  const [showPercentAdvanced, setShowPercentAdvanced] = useState(false); // 是否显示高级设置

  // 检查用户认证状态
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create posts.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast]);

  const relationshipOptions = [
    { label: 'Friends', value: 'friends' },
    { label: 'Family', value: 'family' },
    { label: 'Romantic Partner', value: 'romantic' },
    { label: 'Spouse', value: 'spouse' },
    { label: 'Colleague', value: 'colleague' },
    { label: 'Classmate', value: 'classmate' },
    { label: 'Neighbor', value: 'neighbor' },
    { label: 'Other', value: 'other' }
  ];


  const postTypeOptions = [
    { 
      value: 'share', 
      label: 'Share', 
      description: 'Public post that appears in everyone\'s feed',
      icon: Share
    },
    { 
      value: 'post', 
      label: 'Post', 
      description: 'Appears on your profile only, not in feeds',
      icon: User
    },
    { 
      value: 'memory', 
      label: 'Memory', 
      description: 'Private post only you can see',
      icon: Lock
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    
    // 更新封面图片索引
    if (index === coverImageIndex) {
      // 如果删除的是当前封面，重置为第一张（索引0）
      setCoverImageIndex(0);
    } else if (index < coverImageIndex) {
      // 如果删除的图片在封面之前，封面索引需要减1
      setCoverImageIndex(coverImageIndex - 1);
    }
    // 如果删除的图片在封面之后，封面索引不变
    
    // 更新individualPercents - 删除被移除图片的设置，并重新索引后续图片
    const newIndividualPercents: Record<number, number> = {};
    Object.entries(individualPercents).forEach(([imgIndex, percent]) => {
      const idx = parseInt(imgIndex);
      if (idx < index) {
        // 在删除位置之前的图片，索引不变
        newIndividualPercents[idx] = percent;
      } else if (idx > index) {
        // 在删除位置之后的图片，索引减1
        newIndividualPercents[idx - 1] = percent;
      }
      // idx === index 的图片被删除，不添加到新的settings中
    });
    setIndividualPercents(newIndividualPercents);
  };

  // 设置个别图片的显示百分比
  const setIndividualPercent = (imageIndex: number, percent: number) => {
    setIndividualPercents(prev => ({
      ...prev,
      [imageIndex]: percent
    }));
  };

  // 重置个别图片设置为默认值
  const resetIndividualPercent = (imageIndex: number) => {
    setIndividualPercents(prev => {
      const newPercents = { ...prev };
      delete newPercents[imageIndex];
      return newPercents;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!story.trim()) {
      toast({
        title: "Story required",
        description: "Please add a story to your post.",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one chat screenshot.",
        variant: "destructive",
      });
      return;
    }

    if (!postType) {
      toast({
        title: "Post type required",
        description: "Please select a post type.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create posts.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // 创建图片显示设置数组
    const imageDisplaySettings = Object.entries(individualPercents).map(([index, percent]) => ({
      imageIndex: parseInt(index),
      displayPercent: percent
    }));

    // 创建帖子数据
    const postData = {
      content: story.trim(),
      type: postType,
      relationship,
      app,
      images,
      coverImageIndex, // 添加封面图片索引
      defaultDisplayPercent, // 添加默认显示百分比
      imageDisplaySettings: imageDisplaySettings.length > 0 ? imageDisplaySettings : undefined, // 添加个别图片设置
    };

    try {
      await createPostMutation.mutateAsync(postData);
      navigate('/');
    } catch (error) {
      // 错误已经在mutation中处理
      console.error('Failed to create post:', error);
    }
  };

  const getSelectedTypeOption = () => {
    return postTypeOptions.find(option => option.value === postType);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <PinterestSidebar currentPage="share" />
        <div className="flex-1 max-w-2xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Share Your Story</h1>
            </div>
          <Button 
            onClick={handleSubmit}
            disabled={!story.trim() || images.length === 0 || !postType || createPostMutation.isPending}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-6 rounded-full"
          >
            {createPostMutation.isPending 
              ? 'Creating...' 
              : postType === 'share' 
              ? 'Share' 
              : postType === 'post' 
              ? 'Post' 
              : 'Save Memory'
            }
          </Button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-6">
          {/* 1. Story Field */}
          <div className="space-y-2">
            <Label htmlFor="story" className="text-sm font-bold">
              Story *
            </Label>
            <Textarea
              id="story"
              placeholder="Tell the story behind this chat..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* 2. Chat Screenshots */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">
              Chat Screenshots *
            </Label>
            
            {/* Upload Button */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload chat screenshots
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload at least 1 image
                </p>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="space-y-3 mt-4">
                {/* Cover Image Selection Hint */}
                {imagePreviews.length > 1 && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Cover Image:</span> Click on any image to set it as the cover for feeds
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      {/* Image Container - Clickable for cover selection */}
                      <div 
                        className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                          index === coverImageIndex 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setCoverImageIndex(index)}
                        title={`Click to set as cover image`}
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        
                        {/* Cover Badge */}
                        {index === coverImageIndex && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
                            Cover
                          </div>
                        )}
                        
                        {/* Image Number */}
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
                          {index + 1}
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation(); // 防止触发封面选择
                          removeImage(index);
                        }}
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 z-10"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Cover Preview - Only show if multiple images */}
                {imagePreviews.length > 1 && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium mb-2">Feed Preview:</div>
                    <div className="flex items-center gap-3">
                      <img
                        src={imagePreviews[coverImageIndex]}
                        alt="Cover preview"
                        className="w-16 h-16 object-cover rounded-lg border border-primary"
                      />
                      <div className="text-sm text-muted-foreground">
                        This image will be shown as the cover in feeds
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. App Platform */}
          <AppSelector
            value={app}
            onChange={setApp}
          />

          {/* 4. Display Percentage */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">
              Display Percentage
            </Label>
            <Select 
              value={defaultDisplayPercent.toString()} 
              onValueChange={(value) => setDefaultDisplayPercent(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50% - Half view (Default)</SelectItem>
                <SelectItem value="100">100% - Full image</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How much of the images viewers can see initially in the detail page
            </p>

            {/* Advanced Individual Settings */}
            {images.length > 0 && (
              <div className="space-y-3 mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Individual Image Settings (Optional)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPercentAdvanced(!showPercentAdvanced)}
                    className="h-6 px-2 text-xs"
                  >
                    {showPercentAdvanced ? 'Hide' : 'Customize'}
                    <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${showPercentAdvanced ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
                
                {showPercentAdvanced && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-3">
                      Override the default percentage for specific images
                    </p>
                    {images.map((_, index) => (
                      <div key={index} className="flex items-center gap-3 py-2">
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <span className="text-sm font-medium">Image {index + 1}:</span>
                        </div>
                        <Select 
                          value={individualPercents[index]?.toString() || 'default'}
                          onValueChange={(value) => {
                            if (value === 'default') {
                              resetIndividualPercent(index);
                            } else {
                              setIndividualPercent(index, parseInt(value));
                            }
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Use Default ({defaultDisplayPercent}%)</SelectItem>
                            <SelectItem value="50">50% - Half view</SelectItem>
                            <SelectItem value="100">100% - Full image</SelectItem>
                          </SelectContent>
                        </Select>
                        {individualPercents[index] && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => resetIndividualPercent(index)}
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. Relationship */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">
              Relationship
            </Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship type..." />
              </SelectTrigger>
              <SelectContent>
                {relationshipOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 6. Post Type with Advanced Options */}
          <div className="space-y-3">
            <Label className="text-sm font-bold">
              Post Type *
            </Label>
            
            {/* Default Share Option */}
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                postType === 'share'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setPostType('share')}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  postType === 'share' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Share className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Share</h3>
                  <p className="text-sm text-muted-foreground mt-1">Public post that appears in everyone's feed</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  postType === 'share'
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                }`}>
                  {postType === 'share' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="w-full justify-between text-muted-foreground hover:text-foreground"
            >
              <span>Advanced</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
            </Button>

            {/* Advanced Post Type Options */}
            {showAdvancedOptions && (
              <div className="space-y-3 pl-4 border-l-2 border-muted">
                {postTypeOptions.filter(option => option.value !== 'share').map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        postType === option.value
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setPostType(option.value as PostType)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          postType === option.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{option.label}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          postType === option.value
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}>
                          {postType === option.value && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SharePost;
