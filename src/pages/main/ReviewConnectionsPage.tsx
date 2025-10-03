import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Users, MessageSquare, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { type Group } from '@/lib/supabase';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface GroupReview {
  group_id: string;
  rating: number; // 1-5
  review_text: string;
  last_updated: string;
}

interface ReviewConnectionsPageProps {
  userGroups: Group[];
  isLoadingGroups: boolean;
  currentUserId: string;
}

export default function ReviewConnectionsPage({
  userGroups,
  isLoadingGroups,
  currentUserId
}: ReviewConnectionsPageProps) {
  const [reviews, setReviews] = useState<Record<string, GroupReview>>({});
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [tempRating, setTempRating] = useState<number>(0);
  const [tempReview, setTempReview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'date' | 'activity'>('rating');

  // 加载已有的评价
  useEffect(() => {
    const loadReviews = async () => {
      if (!currentUserId) return;

      try {
        const { data, error } = await supabase
          .from('group_reviews')
          .select('*')
          .eq('user_id', currentUserId);

        if (error) throw error;

        if (data) {
          const reviewsMap: Record<string, GroupReview> = {};
          data.forEach((review) => {
            reviewsMap[review.group_id] = {
              group_id: review.group_id,
              rating: review.rating,
              review_text: review.review_text || '',
              last_updated: review.updated_at
            };
          });
          setReviews(reviewsMap);
        }
      } catch (error) {
        console.error('❌ 加载评价失败:', error);
      }
    };

    loadReviews();
  }, [currentUserId]);

  // 开始编辑
  const handleStartEdit = (groupId: string) => {
    const existingReview = reviews[groupId];
    setEditingGroupId(groupId);
    setTempRating(existingReview?.rating || 0);
    setTempReview(existingReview?.review_text || '');
  };

  // 保存评价
  const handleSaveReview = async (groupId: string) => {
    if (tempRating === 0) {
      toast.error('请选择评分');
      return;
    }

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('group_reviews')
        .upsert({
          user_id: currentUserId,
          group_id: groupId,
          rating: tempRating,
          review_text: tempReview,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,group_id'
        });

      if (error) throw error;

      // 更新本地状态
      setReviews({
        ...reviews,
        [groupId]: {
          group_id: groupId,
          rating: tempRating,
          review_text: tempReview,
          last_updated: new Date().toISOString()
        }
      });

      setEditingGroupId(null);
      toast.success('评价已保存');
    } catch (error) {
      console.error('❌ 保存评价失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setTempRating(0);
    setTempReview('');
  };

  // 星级评分组件
  const StarRating = ({ rating, onRate, readonly = false }: { rating: number; onRate?: (rating: number) => void; readonly?: boolean }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRate?.(star)}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // 排序群组
  const sortedGroups = [...userGroups].sort((a, b) => {
    if (sortBy === 'rating') {
      const ratingA = reviews[a.id]?.rating || 0;
      const ratingB = reviews[b.id]?.rating || 0;
      return ratingB - ratingA;
    } else if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      // activity - 暂时使用 created_at 作为活跃度
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // 计算统计数据
  const stats = {
    totalConnections: userGroups.length,
    reviewedConnections: Object.keys(reviews).length,
    averageRating: Object.values(reviews).length > 0
      ? (Object.values(reviews).reduce((sum, r) => sum + r.rating, 0) / Object.values(reviews).length).toFixed(1)
      : '0.0'
  };

  if (isLoadingGroups) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-3 text-gray-600">Loading connections...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Connections</h1>
        <p className="text-gray-600">Rate and review your AI Twin connections to help improve future matches</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Connections</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalConnections}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Reviewed</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">{stats.reviewedConnections}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Average Rating</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.averageRating}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 排序选项 */}
      <div className="mb-6 flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <div className="flex space-x-2">
          <Button
            variant={sortBy === 'rating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('rating')}
            className={sortBy === 'rating' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            Rating
          </Button>
          <Button
            variant={sortBy === 'date' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('date')}
            className={sortBy === 'date' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            Date Created
          </Button>
          <Button
            variant={sortBy === 'activity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('activity')}
            className={sortBy === 'activity' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            Activity
          </Button>
        </div>
      </div>

      {/* 连接列表 */}
      {sortedGroups.length === 0 ? (
        <Card className="shadow-md">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Connections Yet</h3>
            <p className="text-gray-600">
              You haven't established any connections yet. Start by accepting invitations in the Build Connections page.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4 pr-4">
            {sortedGroups.map((group) => {
              const review = reviews[group.id];
              const isEditing = editingGroupId === group.id;

              return (
                <Card key={group.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 ring-2 ring-emerald-200">
                          <AvatarImage src="/avatars/ai_friend.png" />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            {group.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              Created {formatDate(group.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review && !isEditing && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                          {review.rating}.0
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Your Rating
                          </label>
                          <StarRating rating={tempRating} onRate={setTempRating} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Your Review (Optional)
                          </label>
                          <Textarea
                            placeholder="Share your thoughts about this connection..."
                            value={tempReview}
                            onChange={(e) => setTempReview(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleSaveReview(group.id)}
                            disabled={isSaving || tempRating === 0}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save Review'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {review ? (
                          <>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Your Rating:</p>
                              <StarRating rating={review.rating} readonly />
                            </div>
                            {review.review_text && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Your Review:</p>
                                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                  {review.review_text}
                                </p>
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartEdit(group.id)}
                            >
                              Edit Review
                            </Button>
                          </>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-3">
                              You haven't reviewed this connection yet
                            </p>
                            <Button
                              onClick={() => handleStartEdit(group.id)}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              Add Review
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

