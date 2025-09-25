import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Smile, Calendar, MapPin } from 'lucide-react';

export const PostComposer = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');

  return (
    <div className="border-b border-border p-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 bg-muted rounded-full flex-shrink-0"></div>
        
        {/* Composer */}
        <div className="flex-1">
          <Textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-none resize-none text-xl placeholder:text-muted-foreground focus-visible:ring-0 p-0 min-h-[60px]"
          />
          
          {/* Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-primary p-2 h-auto hover:bg-primary/10">
                <Image className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary p-2 h-auto hover:bg-primary/10">
                <Smile className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary p-2 h-auto hover:bg-primary/10">
                <Calendar className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary p-2 h-auto hover:bg-primary/10">
                <MapPin className="w-5 h-5" />
              </Button>
            </div>
            
            <Button 
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-6 rounded-full"
              onClick={() => navigate('/share')}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};