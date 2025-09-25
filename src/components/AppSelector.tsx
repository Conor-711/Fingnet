import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Smartphone } from 'lucide-react';
import { AppSelection } from '@/types/post';
import { appCategories, getCategoryNames, getAppsByCategory, formatAppSelection } from '@/data/appCategories';

interface AppSelectorProps {
  value?: AppSelection;
  onChange: (selection: AppSelection | undefined) => void;
  className?: string;
}

export const AppSelector = ({ value, onChange, className = "" }: AppSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(value?.category || '');
  const [selectedApp, setSelectedApp] = useState<string>(value?.app || '');

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedApp(''); // 重置应用选择
    
    // 如果取消选择分类，清除整个选择
    if (!categoryName) {
      onChange(undefined);
    }
  };

  const handleAppChange = (appValue: string) => {
    setSelectedApp(appValue);
    
    if (selectedCategory && appValue) {
      const appData = getAppsByCategory(selectedCategory).find(app => app.value === appValue);
      if (appData) {
        onChange({
          category: selectedCategory,
          app: appValue,
          displayName: formatAppSelection({ category: selectedCategory, app: appValue })
        });
      }
    }
  };

  const handleClear = () => {
    setSelectedCategory('');
    setSelectedApp('');
    onChange(undefined);
  };

  const categoryNames = getCategoryNames();
  const availableApps = selectedCategory ? getAppsByCategory(selectedCategory) : [];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          App Platform
        </Label>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      {/* 显示当前选择 */}
      {value && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-2">
            {value.displayName}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-4 w-4 p-0 hover:bg-transparent"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        </div>
      )}

      {/* 分类选择 */}
      <div className="space-y-2">
        <Label htmlFor="app-category" className="text-xs text-muted-foreground">
          App Category
        </Label>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger id="app-category">
            <SelectValue placeholder="Select app category..." />
          </SelectTrigger>
          <SelectContent>
            {categoryNames.map((categoryName) => (
              <SelectItem key={categoryName} value={categoryName}>
                <div className="flex items-center gap-2">
                  <span>{categoryName}</span>
                  <span className="text-xs text-muted-foreground">
                    ({getAppsByCategory(categoryName).length} apps)
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 应用选择 */}
      {selectedCategory && (
        <div className="space-y-2">
          <Label htmlFor="app-name" className="text-xs text-muted-foreground">
            Specific App
          </Label>
          <Select value={selectedApp} onValueChange={handleAppChange}>
            <SelectTrigger id="app-name">
              <SelectValue placeholder={`Select ${selectedCategory.toLowerCase()} app...`} />
            </SelectTrigger>
            <SelectContent>
              {availableApps.map((app) => (
                <SelectItem key={app.value} value={app.value}>
                  {app.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 帮助文本 */}
      <p className="text-xs text-muted-foreground">
        Select the app platform where this chat/conversation took place.
      </p>
    </div>
  );
};
