import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { Separator } from '@/components/ui/separator';

interface CommentSectionProps {
  postId: string;
  className?: string;
}

export const CommentSection = ({ postId, className = '' }: CommentSectionProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Comment Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Add a comment</h3>
        <CommentForm postId={postId} />
      </div>

      {/* Separator */}
      <Separator />

      {/* Comments List */}
      <CommentList postId={postId} />
    </div>
  );
};