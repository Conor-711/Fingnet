import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CommentForm } from './CommentForm';
import { useAuth } from '@/contexts/AuthContext';
import { useLikeComment, useDeleteComment } from '@/hooks/useComments';
import { Comment } from '@/types/post';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Edit3, Flag } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  level?: number; // 嵌套层级，用于缩进
  maxLevel?: number; // 最大嵌套层级
}

export const CommentItem = ({ comment, postId, level = 0, maxLevel = 3 }: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(level < 2); // 前两层默认展开
  const { user, isAuthenticated } = useAuth();
  const likeCommentMutation = useLikeComment();
  const deleteCommentMutation = useDeleteComment();

  const isAuthor = user?.id === comment.authorId;
  const canReply = level < maxLevel;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleLike = () => {
    if (!isAuthenticated) return;
    
    likeCommentMutation.mutate({
      commentId: comment.id,
      isLiked: comment.isLikedByCurrentUser || false,
    });
  };

  const handleReply = () => {
    if (!isAuthenticated) return;
    setIsReplying(true);
  };

  const handleDelete = async () => {
    if (!isAuthor) return;
    
    try {
      await deleteCommentMutation.mutateAsync({
        commentId: comment.id,
        postId,
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return timestamp;
    }
  };

  const indentLevel = Math.min(level, maxLevel);
  const shouldShowConnector = level > 0;

  return (
    <div className={`group ${level > 0 ? 'border-l-2 border-muted' : ''}`}>
      <div className={`flex gap-3 p-3 ${indentLevel > 0 ? `ml-${indentLevel * 4}` : ''} hover:bg-muted/30 transition-colors`}>
        {/* Avatar */}
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.author?.avatar} alt={comment.author?.displayName} />
          <AvatarFallback>
            {comment.author?.displayName?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Author and Timestamp */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm truncate">
              {comment.author?.displayName || 'Unknown User'}
            </span>
            {comment.author?.verified && (
              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs">✓</span>
              </div>
            )}
            <span className="text-muted-foreground text-xs">
              {formatTimestamp(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-muted-foreground text-xs">(edited)</span>
            )}
          </div>

          {/* Comment Text */}
          <div className="text-sm leading-relaxed mb-2 break-words">
            {comment.content}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!isAuthenticated || likeCommentMutation.isPending}
              className={`h-8 px-2 gap-1 text-xs ${
                comment.isLikedByCurrentUser 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-muted-foreground hover:text-red-600'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${comment.isLikedByCurrentUser ? 'fill-current' : ''}`} />
              {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
            </Button>

            {/* Reply Button */}
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReply}
                disabled={!isAuthenticated}
                className="h-8 px-2 gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Reply
              </Button>
            )}

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-32">
                {isAuthor ? (
                  <>
                    <DropdownMenuItem className="gap-2">
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                          className="gap-2 text-destructive focus:text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <DropdownMenuItem className="gap-2">
                    <Flag className="w-3.5 h-3.5" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {isReplying && (
        <div className={`${indentLevel > 0 ? `ml-${(indentLevel + 1) * 4}` : 'ml-11'} mt-2 mb-4`}>
          <CommentForm
            postId={postId}
            parentId={comment.id}
            placeholder={`Reply to ${comment.author?.displayName}...`}
            onCancel={() => setIsReplying(false)}
            autoFocus
            className="bg-muted/30 p-3 rounded-lg"
          />
        </div>
      )}

      {/* Nested Replies */}
      {hasReplies && (
        <div className="mt-2">
          {/* Toggle Replies Button */}
          {comment.repliesCount > 0 && (
            <div className={`${indentLevel > 0 ? `ml-${indentLevel * 4}` : ''} ml-11 mb-2`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
              >
                {showReplies ? '−' : '+'} {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
              </Button>
            </div>
          )}

          {/* Render Replies */}
          {showReplies && comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              level={level + 1}
              maxLevel={maxLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
};
