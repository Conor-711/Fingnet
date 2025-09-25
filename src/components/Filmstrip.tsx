import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FilmstripImage {
  id: string;
  url: string;
  thumbUrl: string;
  isActive: boolean;
  index: number;
}

interface FilmstripProps {
  images: FilmstripImage[];
  activeIndex: number;
  onImageSelect: (index: number) => void;
}

export const Filmstrip = ({ images, activeIndex, onImageSelect }: FilmstripProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active thumbnail
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeThumb = scrollContainerRef.current.children[activeIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && activeIndex > 0) {
        onImageSelect(activeIndex - 1);
      } else if (e.key === 'ArrowRight' && activeIndex < images.length - 1) {
        onImageSelect(activeIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, images.length, onImageSelect]);

  if (images.length <= 1) return null;

  return (
    <div className="w-full">
      <div 
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 justify-center"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => onImageSelect(index)}
            className={cn(
              "flex-shrink-0 relative rounded-lg overflow-hidden transition-all duration-200 hover:opacity-80",
              "border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              index === activeIndex 
                ? "border-primary shadow-lg scale-105" 
                : "border-transparent hover:border-border"
            )}
          >
            <img
              src={image.thumbUrl}
              alt={`Thumbnail ${index + 1}`}
              className="w-20 h-14 object-cover"
              loading="lazy"
            />
            
            {/* Active indicator overlay */}
            {index === activeIndex && (
              <div className="absolute inset-0 bg-primary/10 border border-primary rounded-md" />
            )}
            
            {/* Index indicator */}
            <div className="absolute top-1 left-1 bg-background/80 rounded px-1.5 py-0.5">
              <span className="text-xs font-medium text-foreground">
                {index + 1}
              </span>
            </div>
          </button>
        ))}
      </div>
      
      {/* Progress indicator */}
      <div className="flex justify-center mt-2">
        <div className="flex gap-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors duration-200",
                index === activeIndex ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};