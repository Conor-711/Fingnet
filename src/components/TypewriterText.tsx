import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // 打字速度，毫秒
  onComplete?: () => void; // 打字完成回调
  className?: string;
}

const TypewriterText = ({ text, speed = 50, onComplete, className = '' }: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      // 打字完成，调用回调
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 500); // 延迟500ms后调用完成回调

      return () => clearTimeout(completeTimer);
    }
  }, [currentIndex, text, speed, onComplete]);

  // 重置效果当text改变时
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
};

export default TypewriterText;

