import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateComment } from '@/hooks/useComments';
import { Send, X } from 'lucide-react';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
  className?: string;
}

export const CommentForm = ({ 
  postId, 
  parentId, 
  placeholder = "Write a comment...", 
  onCancel,
  autoFocus = false,
  className = ""
}: CommentFormProps) => {
  const [content, setContent] = useState('');
  const { user, isAuthenticated } = useAuth();
  const createCommentMutation = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    try {
      await createCommentMutation.mutateAsync({
        postId,
        content: content.trim(),
        parentId,
      });
      
      setContent('');
      
      // 如果是回复表单，提交后关闭
      if (parentId && onCancel) {
        onCancel();
      }
    } catch (error) {
      // 错误处理已经在mutation中完成
      console.error('Failed to create comment:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center gap-3 p-4 bg-muted/50 rounded-lg ${className}`}>
        <div className="text-muted-foreground text-sm">
          Please <button className="text-primary hover:underline">sign in</button> to comment
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={user?.avatar} alt={user?.displayName} />
          <AvatarFallback>
            {user?.displayName?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="min-h-[60px] resize-none border-input focus:border-primary"
            disabled={createCommentMutation.isPending}
          />
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {parentId ? 'Replying to comment' : 'Posting as'} <span className="font-medium">{user?.displayName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {parentId && onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={createCommentMutation.isPending}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
              
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || createCommentMutation.isPending}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {createCommentMutation.isPending 
                  ? 'Posting...' 
                  : parentId 
                  ? 'Reply' 
                  : 'Comment'
                }
              </Button>
            </div>
          </div>
          
          {/* Helper text */}
          <div className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Cmd</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to submit
            {parentId && (
              <>
                , <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> to cancel
              </>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};
