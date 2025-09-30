import { useEffect, useState } from 'react';

interface ConnectionNode {
  id: string;
  avatar: string;
  x: number;
  y: number;
  delay: number;
}

interface AITwinConnectionAnimationProps {
  userAvatar?: string; // 用户AI Twin的头像
}

const AITwinConnectionAnimation = ({ userAvatar }: AITwinConnectionAnimationProps) => {
  const [nodes, setNodes] = useState<ConnectionNode[]>([]);
  const [activeConnections, setActiveConnections] = useState<Set<string>>(new Set());

  // AI Twin头像
  const avatars = [
    userAvatar || '/avatars/middle.png', // 中心节点使用用户头像
    '/avatars/1.png',
    '/avatars/2.png',
    '/avatars/3.png',
    '/avatars/4.png',
  ];

  useEffect(() => {
    // 初始化节点位置
    const centerNode: ConnectionNode = {
      id: 'center',
      avatar: avatars[0],
      x: 50,
      y: 50,
      delay: 0,
    };

    const surroundingNodes: ConnectionNode[] = [
      { id: 'node-1', avatar: avatars[1], x: 20, y: 30, delay: 0.5 },
      { id: 'node-2', avatar: avatars[2], x: 80, y: 30, delay: 1 },
      { id: 'node-3', avatar: avatars[3], x: 20, y: 70, delay: 1.5 },
      { id: 'node-4', avatar: avatars[4], x: 80, y: 70, delay: 2 },
    ];

    setNodes([centerNode, ...surroundingNodes]);

    // 逐个激活连接
    surroundingNodes.forEach((node, index) => {
      setTimeout(() => {
        setActiveConnections(prev => new Set([...prev, node.id]));
      }, node.delay * 1000);
    });
  }, [userAvatar]); // 当用户头像改变时重新初始化

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* 渐变定义 */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
          </linearGradient>
          
          {/* 光晕效果 */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 渲染连接线 */}
        {nodes.slice(1).map((node) => {
          const centerNode = nodes[0];
          const isActive = activeConnections.has(node.id);
          
          return (
            <g key={`connection-${node.id}`}>
              <line
                x1={centerNode.x}
                y1={centerNode.y}
                x2={node.x}
                y2={node.y}
                stroke="url(#lineGradient)"
                strokeWidth="0.3"
                opacity={isActive ? 0.8 : 0}
                filter="url(#glow)"
                className="transition-opacity duration-500"
              />
              
              {/* 流动的光点 */}
              {isActive && (
                <>
                  <circle r="0.5" fill="#3B82F6" opacity="0.8">
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path={`M ${centerNode.x} ${centerNode.y} L ${node.x} ${node.y}`}
                    />
                  </circle>
                  <circle r="0.3" fill="#10B981" opacity="0.6">
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      begin="0.5s"
                      path={`M ${centerNode.x} ${centerNode.y} L ${node.x} ${node.y}`}
                    />
                  </circle>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* 渲染节点 */}
      <div className="absolute inset-0">
        {nodes.map((node, index) => {
          const isCenter = index === 0;
          const isActive = index === 0 || activeConnections.has(node.id);
          
          return (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                opacity: isActive ? 1 : 0.3,
                transform: `translate(-50%, -50%) scale(${isActive ? 1 : 0.8})`,
              }}
            >
              <div className={`relative ${isCenter ? 'w-16 h-16' : 'w-12 h-12'}`}>
                {/* 脉冲光环 */}
                <div 
                  className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 ${
                    isActive ? 'animate-ping' : ''
                  }`}
                  style={{ 
                    animationDuration: '2s',
                    opacity: 0.4,
                  }}
                />
                
                {/* 旋转光环 */}
                <div 
                  className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-0.5 ${
                    isActive ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '3s' }}
                >
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <img
                      src={node.avatar}
                      alt={`AI Twin ${node.id}`}
                      className="w-full h-full rounded-full object-cover shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* 连接状态指示器 */}
                {isActive && !isCenter && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 中心文字提示 */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg animate-pulse">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            Connecting AI Twins...
          </span>
        </div>
      </div>
    </div>
  );
};

export default AITwinConnectionAnimation;
