import { Button } from '@/components/ui/button';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ProfileTabs = ({ activeTab, onTabChange }: ProfileTabsProps) => {
  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'replies', label: 'Replies' }  ];

  return (
    <div className="border-b border-border">
      <div className="flex">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 rounded-none border-b-2 py-4 font-medium transition-colors
              ${activeTab === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-nav-hover'
              }
            `}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};