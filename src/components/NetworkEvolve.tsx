import { useEffect, useState } from 'react';

// Import all social network logos
import friendsterLogo from '@/assets/social_network/friendster.png';
import myspaceLogo from '@/assets/social_network/myspace.png';
import facebookLogo from '@/assets/social_network/facebook.png';
import linkedinLogo from '@/assets/social_network/linkedin.png';
import hingeLogo from '@/assets/social_network/hinge.png';
import tinderLogo from '@/assets/social_network/tinder.png';
import seriesLogo from '@/assets/social_network/series.png';
import sonderLogo from '@/assets/social_network/sonder.png';

interface AnimatedLogo {
  id: string;
  src: string;
  x: number;
  y: number;
  direction: number;
  speed: number;
}

const NetworkEvolve = () => {
  const [animatedLogos, setAnimatedLogos] = useState<AnimatedLogo[]>([]);

  // Initialize Stage 4 animated logos
  useEffect(() => {
    const logos = [
      { id: 'series', src: seriesLogo },
      { id: 'sonder', src: sonderLogo },
    ];

    const initializedLogos = logos.map((logo) => ({
      ...logo,
      x: 30 + Math.random() * 40, // Keep within 30-70% of container
      y: 30 + Math.random() * 40,
      direction: Math.random() * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.1, // Slow, elegant movement
    }));

    setAnimatedLogos(initializedLogos);
  }, []);

  // Animate Stage 4 logos (floating effect)
  useEffect(() => {
    const animateLogos = () => {
      setAnimatedLogos((prevLogos) =>
        prevLogos.map((logo) => {
          let newX = logo.x + Math.cos(logo.direction) * logo.speed;
          let newY = logo.y + Math.sin(logo.direction) * logo.speed;
          let newDirection = logo.direction;

          // Boundary detection and reflection
          if (newX <= 20 || newX >= 80) {
            newDirection = Math.PI - logo.direction;
            newX = Math.max(20, Math.min(80, newX));
          }
          if (newY <= 20 || newY >= 80) {
            newDirection = -logo.direction;
            newY = Math.max(20, Math.min(80, newY));
          }

          return {
            ...logo,
            x: newX,
            y: newY,
            direction: newDirection,
          };
        })
      );
    };

    const interval = setInterval(animateLogos, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full py-12 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Timeline Container */}
        <div className="flex items-center justify-between gap-6 relative">
          {/* Stage 1: Early Social Networks */}
          <div className="flex-[0.7] backdrop-blur-md bg-white/40 border border-gray-200/50 rounded-2xl p-6 shadow-lg flex flex-col items-center gap-6 relative">
            <div className="flex flex-col items-center gap-4">
              <img
                src={friendsterLogo}
                alt="Friendster"
                className="w-12 h-12 object-contain opacity-70 hover:opacity-100 transition-opacity rounded-lg"
              />
              <img
                src={myspaceLogo}
                alt="MySpace"
                className="w-12 h-12 object-contain opacity-70 hover:opacity-100 transition-opacity rounded-lg"
              />
            </div>
            {/* Timeline dot */}
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          </div>

          {/* Connecting Line 1-2 */}
          <div className="flex-1 h-0.5 bg-gradient-to-r from-gray-400 to-blue-400 relative top-8"></div>

          {/* Stage 2: Facebook Era */}
          <div className="flex-[0.9] backdrop-blur-md bg-white/40 border border-gray-200/50 rounded-2xl p-6 shadow-lg flex flex-col items-center gap-6 relative">
            <div className="flex items-center justify-center">
              <img
                src={facebookLogo}
                alt="Facebook"
                className="w-20 h-20 object-contain opacity-80 hover:opacity-100 transition-opacity rounded-lg"
              />
            </div>
            {/* Timeline dot */}
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>

          {/* Connecting Line 2-3 */}
          <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-emerald-400 relative top-8"></div>

          {/* Stage 3: Professional & Dating */}
          <div className="flex-[1.1] backdrop-blur-md bg-white/40 border border-gray-200/50 rounded-2xl p-6 shadow-lg flex flex-col items-center gap-6 relative">
            <div className="flex flex-col items-center gap-4">
              <img
                src={linkedinLogo}
                alt="LinkedIn"
                className="w-16 h-16 object-contain opacity-80 hover:opacity-100 transition-opacity rounded-lg"
              />
              <div className="flex items-center gap-4">
                <img
                  src={hingeLogo}
                  alt="Hinge"
                  className="w-12 h-12 object-contain opacity-70 hover:opacity-100 transition-opacity rounded-lg"
                />
                <img
                  src={tinderLogo}
                  alt="Tinder"
                  className="w-12 h-12 object-contain opacity-70 hover:opacity-100 transition-opacity rounded-lg"
                />
              </div>
            </div>
            {/* Timeline dot */}
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          </div>

          {/* Connecting Line 3-4 */}
          <div className="flex-1 h-0.5 bg-gradient-to-r from-emerald-400 to-purple-400 relative top-8"></div>

          {/* Stage 4: Future/Now - Animated */}
          <div className="flex-[1.6] backdrop-blur-md bg-white/40 border border-gray-200/50 rounded-2xl p-8 shadow-lg flex flex-col items-center gap-6 relative">
            {/* Animated container for Stage 4 logos */}
            <div className="relative w-full h-56">
              {animatedLogos.map((logo) => (
                <img
                  key={logo.id}
                  src={logo.src}
                  alt={logo.id}
                  className="absolute w-14 h-14 object-contain opacity-80 hover:opacity-100 transition-all duration-100 ease-linear transform -translate-x-1/2 -translate-y-1/2 rounded-lg"
                  style={{
                    left: `${logo.x}%`,
                    top: `${logo.y}%`,
                  }}
                />
              ))}
            </div>
            {/* Timeline dot */}
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkEvolve;

