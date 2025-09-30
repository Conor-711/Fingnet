import { useEffect, useState } from 'react';

interface AITwinNode {
  id: string;
  x: number;
  y: number;
  avatar: string;
  size: number;
  speed: number;
  direction: number;
}

interface Connection {
  from: string;
  to: string;
  opacity: number;
  animationDelay: number;
}

const NetworkBackground = () => {
  const [nodes, setNodes] = useState<AITwinNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  // AI Twin头像路径
  const avatars = [
    '/src/assets/network/middle.png',
    '/src/assets/network/1.png',
    '/src/assets/network/2.png',
    '/src/assets/network/3.png',
    '/src/assets/network/4.png',
    '/src/assets/network/5.png',
    '/src/assets/network/6.png',
  ];

  // 初始化节点
  useEffect(() => {
    const initializeNodes = () => {
      const newNodes: AITwinNode[] = avatars.map((avatar, index) => ({
        id: `node-${index}`,
        x: 10 + Math.random() * 80, // 避免太靠近边缘
        y: 10 + Math.random() * 80, // 避免太靠近边缘
        avatar,
        size: index === 0 ? 60 : 40 + Math.random() * 20, // middle.png稍大一些
        speed: 0.2 + Math.random() * 0.2, // 稍微慢一点的移动速度
        direction: Math.random() * Math.PI * 2,
      }));
      setNodes(newNodes);

      // 创建连接
      const newConnections: Connection[] = [];
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          // 随机决定是否创建连接（约50%概率）
          if (Math.random() > 0.5) {
            newConnections.push({
              from: newNodes[i].id,
              to: newNodes[j].id,
              opacity: 0.5 + Math.random() * 0.3,
              animationDelay: Math.random() * 5,
            });
          }
        }
      }
      setConnections(newConnections);
    };

    initializeNodes();
  }, []);

  // 节点移动动画
  useEffect(() => {
    const animateNodes = () => {
      setNodes(prevNodes => 
        prevNodes.map(node => {
          let newX = node.x + Math.cos(node.direction) * node.speed;
          let newY = node.y + Math.sin(node.direction) * node.speed;
          let newDirection = node.direction;

          // 边界反弹
          if (newX <= 5 || newX >= 95) {
            newDirection = Math.PI - node.direction;
            newX = Math.max(5, Math.min(95, newX));
          }
          if (newY <= 5 || newY >= 95) {
            newDirection = -node.direction;
            newY = Math.max(5, Math.min(95, newY));
          }

          return {
            ...node,
            x: newX,
            y: newY,
            direction: newDirection,
          };
        })
      );
    };

    const interval = setInterval(animateNodes, 100);
    return () => clearInterval(interval);
  }, []);

  // 获取节点位置
  const getNodeById = (id: string) => nodes.find(node => node.id === id);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* 定义渐变和滤镜 */}
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 渲染连接线 */}
        {connections.map((connection, index) => {
          const fromNode = getNodeById(connection.from);
          const toNode = getNodeById(connection.to);
          
          if (!fromNode || !toNode) return null;

          return (
            <g key={`connection-${index}`}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="url(#connectionGradient)"
                strokeWidth="0.1"
                opacity={connection.opacity}
                filter="url(#glow)"
                className="animate-pulse"
                style={{
                  animationDelay: `${connection.animationDelay}s`,
                  animationDuration: '3s',
                }}
              />
              
              {/* 流动的光点 */}
              <circle r="0.2" fill="#3B82F6" opacity="0.8">
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  begin={`${connection.animationDelay}s`}
                >
                  <mpath href={`#path-${index}`} />
                </animateMotion>
              </circle>
              
              {/* 隐藏的路径用于光点动画 */}
              <path
                id={`path-${index}`}
                d={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                fill="none"
                stroke="none"
              />
            </g>
          );
        })}
      </svg>

      {/* 渲染AI Twin节点 */}
      <div className="absolute inset-0">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-linear"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
            }}
          >
            <div className="relative w-full h-full">
              {/* 头像光环效果 */}
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 animate-spin"
                style={{ 
                  animationDuration: '8s',
                  padding: '2px',
                }}
              >
                <div className="w-full h-full rounded-full bg-white p-1">
                  <img
                    src={node.avatar}
                    alt={`AI Twin ${node.id}`}
                    className="w-full h-full rounded-full object-cover shadow-lg"
                    onError={(e) => {
                      // 如果图片加载失败，显示默认头像
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div
                    className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold"
                    style={{ display: 'none' }}
                  >
                    AI
                  </div>
                </div>
              </div>
              
              {/* 脉冲效果 */}
              <div 
                className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"
                style={{ 
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: '2s',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 添加一些浮动的粒子效果 */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={`particle-${index}`}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NetworkBackground;
