import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile, useUploadAvatar, useUsernameValidation } from '@/hooks/useProfile';
import { Camera, Loader2, Check, X, AlertCircle } from 'lucide-react';

// 表单验证schema
const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(50, 'Display name must be less than 50 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z.string().max(160, 'Bio must be less than 160 characters').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  location: z.string().max(30, 'Location must be less than 30 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileEditForm = () => {
  const { user } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarLoadError, setAvatarLoadError] = useState<boolean>(false);
  const [hasAvatarChanged, setHasAvatarChanged] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      username: user?.username || '',
      bio: user?.bio || '',
      website: user?.website || '',
      location: user?.location || '',
    },
    mode: 'onChange',
  });

  const watchedUsername = watch('username');
  const usernameValidation = useUsernameValidation(watchedUsername);

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You need to be logged in to edit your profile.
        </AlertDescription>
      </Alert>
    );
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 上传头像
    uploadAvatarMutation.mutate(file, {
      onSuccess: (response) => {
        console.log('Avatar upload successful:', response);
        console.log('New avatar URL:', response.avatarUrl);
        // 上传成功后，清除预览以显示真实头像
        setAvatarPreview('');
        // 标记头像已改变，使Save按钮可用
        setHasAvatarChanged(true);
      },
      onError: (error) => {
        console.error('Avatar upload failed:', error);
        setAvatarPreview(''); // 清除预览
        setHasAvatarChanged(false); // 重置头像改变状态
      },
    });
  };

  const onSubmit = (data: ProfileFormData) => {
    // 只提交有变化的字段
    const updates: Partial<ProfileFormData> = {};
    
    if (data.displayName !== user.displayName) updates.displayName = data.displayName;
    if (data.username !== user.username) updates.username = data.username;
    if (data.bio !== user.bio) updates.bio = data.bio;
    if (data.website !== user.website) updates.website = data.website;
    if (data.location !== user.location) updates.location = data.location;

    // 如果没有字段变化但头像改变了，也视为需要保存
    if (Object.keys(updates).length === 0 && !hasAvatarChanged) {
      return; // 没有变化，不需要提交
    }

    // 如果只是头像改变了而没有其他字段变化，直接完成
    if (Object.keys(updates).length === 0 && hasAvatarChanged) {
      // 头像已经上传完成，只需要重置状态
      setHasAvatarChanged(false);
      reset(data); // 重置表单状态
      return;
    }

    updateProfileMutation.mutate(updates, {
      onSuccess: () => {
        reset(data); // 重置表单状态，清除 isDirty
        setHasAvatarChanged(false); // 重置头像改变状态
      },
    });
  };

  const handleCancel = () => {
    reset({
      displayName: user.displayName || '',
      username: user.username || '',
      bio: user.bio || '',
      website: user.website || '',
      location: user.location || '',
    });
    setAvatarPreview('');
    setHasAvatarChanged(false); // 重置头像改变状态
  };

  const isSubmitting = updateProfileMutation.isPending;
  const canSubmit = (isDirty || hasAvatarChanged) && isValid && usernameValidation.isValid;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your profile information. Changes will be visible to other users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Profile Picture</Label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage 
                  src={avatarPreview || user.avatar} 
                  alt={user.displayName}
                  onLoad={() => setAvatarLoadError(false)}
                  onError={() => setAvatarLoadError(true)}
                />
                <AvatarFallback className="text-lg">
                  {user.displayName[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {uploadAvatarMutation.isPending && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatarMutation.isPending}
                className="gap-2"
              >
                <Camera className="w-4 h-4" />
                Change Avatar
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF. Max 5MB.
              </p>
              {/* 调试信息 */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Current avatar: {user.avatar || 'None'}</p>
                  <p>Preview: {avatarPreview ? 'Yes' : 'No'}</p>
                  <p>Load error: {avatarLoadError ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        <Separator />

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              {...register('displayName')}
              error={errors.displayName?.message}
            />
            {errors.displayName && (
              <p className="text-sm text-destructive">{errors.displayName.message}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <div className="relative">
              <Input
                id="username"
                {...register('username')}
                error={errors.username?.message || (!usernameValidation.isValid && usernameValidation.message) || undefined}
                className={
                  watchedUsername && watchedUsername !== user.username
                    ? usernameValidation.isValid
                      ? 'pr-10 border-green-500 focus:border-green-500'
                      : 'pr-10 border-red-500 focus:border-red-500'
                    : ''
                }
              />
              
              {/* Username validation indicator */}
              {watchedUsername && watchedUsername !== user.username && !usernameValidation.isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {usernameValidation.isValid ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
              
              {usernameValidation.isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Username validation message */}
            {watchedUsername && (
              <p className={`text-sm ${usernameValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {usernameValidation.message}
              </p>
            )}
            
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              className="min-h-[100px] resize-none"
              {...register('bio')}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{errors.bio?.message || ''}</span>
              <span>{watch('bio')?.length || 0}/160</span>
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              {...register('website')}
              error={errors.website?.message}
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City, Country"
              {...register('location')}
              error={errors.location?.message}
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            {(isDirty || hasAvatarChanged) && (
              <p className="text-sm text-muted-foreground">
                You have unsaved changes
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
