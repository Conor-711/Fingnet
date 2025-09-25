import { Home, User, Settings, Plus, Bell, MessageCircle, LogIn, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

interface PinterestSidebarProps {
  currentPage?: string;
}

export const PinterestSidebar = ({ currentPage }: PinterestSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Determine active page from route if not explicitly passed
  const activePage = currentPage || (() => {
    if (location.pathname === '/profile') return 'profile';
    if (location.pathname === '/share') return 'share';
    if (location.pathname === '/settings') return 'settings';
    
    // 检查URL参数来确定Dating和AI页面
    const searchParams = new URLSearchParams(location.search);
    const apps = searchParams.get('apps')?.split(',').filter(Boolean) || [];
    
    if (apps.includes('Dating')) return 'dating';
    if (apps.includes('AI')) return 'ai';
    
    return 'home';
  })();

  const mainNavItems = [
    { icon: Home, label: 'Home', id: 'home', path: '/' },
    { icon: Plus, label: 'Share', id: 'share', path: '/share' },
    { icon: Heart, label: 'Dating', id: 'dating', path: '/?apps=Dating' },
    { icon: MessageCircle, label: 'AI', id: 'ai', path: '/?apps=AI' },
  ];

  const userNavItems = [
    { icon: User, label: 'Profile', id: 'profile', path: '/profile' },
    { icon: Settings, label: 'Settings', id: 'settings', path: '/settings' },
  ];

  return (
    <div className="sticky top-0 h-screen w-32 flex flex-col border-r border-border bg-background">
        {/* Logo Section */}
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <div className="w-8 h-8 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/assets/logo/logo.png" 
              alt="OnlyMsg Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-lg font-bold text-foreground truncate">OnlyMsg</span>
        </div>

      {/* Main Navigation */}
      <div className="flex-1 py-3">
        <nav className="space-y-1 px-2">
          {mainNavItems.map(({ icon: Icon, label, id, path }) => (
            <Button
              key={label}
              variant="ghost"
              onClick={() => navigate(path)}
              className={`
                w-full justify-start gap-2 h-11 px-2
                ${activePage === id
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
                transition-colors
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm truncate">{label}</span>
            </Button>
          ))}
        </nav>

        {/* Separator */}
        <div className="mx-2 my-3 border-t border-border" />

        {/* User Navigation */}
        {isAuthenticated && (
          <nav className="space-y-1 px-2">
            {userNavItems.map(({ icon: Icon, label, id, path }) => (
              <Button
                key={label}
                variant="ghost"
                onClick={() => navigate(path)}
                className={`
                  w-full justify-start gap-2 h-11 px-2
                  ${activePage === id
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                  transition-colors
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm truncate">{label}</span>
              </Button>
            ))}

            {/* Notifications */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-11 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Bell className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm truncate">Notifications</span>
            </Button>
          </nav>
        )}
      </div>

      {/* Bottom Section - User Info & Actions */}
      <div className="border-t border-border p-3">
        {isAuthenticated ? (
          <div className="space-y-2">
            {/* User Profile Card */}
            <div 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              onClick={() => navigate('/profile')}
            >
              <img 
                src={user?.avatar} 
                alt={user?.displayName}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-xs truncate">{user?.displayName}</p>
                <p className="text-muted-foreground text-xs truncate">@{user?.username}</p>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="w-full gap-2 h-9 px-2"
            >
              <LogIn className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">Sign In</span>
            </Button>
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};