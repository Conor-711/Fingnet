import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Badge } from '@/components/ui/badge';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Filter, X, RotateCcw } from 'lucide-react';
import { appCategories, formatAppSelection } from '@/data/appCategories';

// 筛选条件类型
export interface FeedFilters {
  relationships: string[];
  apps: string[];
  feelings: string[];
}

interface FeedFilterBarProps {
  filters: FeedFilters;
  onFiltersChange: (filters: FeedFilters) => void;
  className?: string;
  hideAppsFilter?: boolean; // 新增：隐藏apps筛选项
}

// 关系类型选项（与SharePost保持一致）
const relationshipOptions = [
  { label: 'Friends', value: 'friends' },
  { label: 'Family', value: 'family' },
  { label: 'Romantic Partner', value: 'romantic' },
  { label: 'Spouse', value: 'spouse' },
  { label: 'Colleague', value: 'colleague' },
  { label: 'Classmate', value: 'classmate' },
  { label: 'Neighbor', value: 'neighbor' },
  { label: 'Other', value: 'other' }
];

// 情感选项（与SharePost保持一致）
const feelingOptions = [
  { label: 'Happy', value: 'happy' },
  { label: 'Sad', value: 'sad' },
  { label: 'Angry', value: 'angry' },
  { label: 'Excited', value: 'excited' },
  { label: 'Confused', value: 'confused' },
  { label: 'Grateful', value: 'grateful' },
  { label: 'Frustrated', value: 'frustrated' },
  { label: 'Surprised', value: 'surprised' },
  { label: 'Insightful', value: 'insightful' },
  { label: 'Nostalgic', value: 'nostalgic' }
];

// 生成应用选项
const generateAppOptions = () => {
  const options: { label: string; value: string }[] = [];
  
  appCategories.forEach(category => {
    category.apps.forEach(app => {
      const value = `${category.name.toLowerCase().replace(/\s+/g, '-')}-${app.value}`;
      const label = `${category.name} - ${app.name}`;
      options.push({ label, value });
    });
  });
  
  return options;
};

const appOptions = generateAppOptions();

export const FeedFilterBar = ({ filters, onFiltersChange, className = "", hideAppsFilter = false }: FeedFilterBarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // 计算总的筛选器数量，在专门页面时不计算apps
  const totalFiltersCount = filters.relationships.length + 
    (hideAppsFilter ? 0 : filters.apps.length) + 
    filters.feelings.length;

  // 处理筛选器变更
  const handleFilterChange = (type: keyof FeedFilters, values: string[]) => {
    const newFilters = {
      ...filters,
      [type]: values,
    };
    onFiltersChange(newFilters);
  };

  // 清除所有筛选器
  const clearAllFilters = () => {
    onFiltersChange({
      relationships: [],
      apps: [],
      feelings: [],
    });
    setIsOpen(false);
  };

  // 移除单个筛选器
  const removeFilter = (type: keyof FeedFilters, value: string) => {
    const newValues = filters[type].filter(v => v !== value);
    handleFilterChange(type, newValues);
  };

  // 获取显示标签
  const getFilterLabel = (type: keyof FeedFilters, value: string) => {
    switch (type) {
      case 'relationships':
        return relationshipOptions.find(opt => opt.value === value)?.label || value;
      case 'apps':
        return appOptions.find(opt => opt.value === value)?.label || value;
      case 'feelings':
        return feelingOptions.find(opt => opt.value === value)?.label || value;
      default:
        return value;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 筛选按钮和活跃筛选器显示 */}
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          {/* <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {totalFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {totalFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger> */}
          
          <PopoverContent className="w-80 p-4 space-y-4" side="bottom" align="start">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filter Posts</h4>
              {totalFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 px-2 text-xs gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear All
                </Button>
              )}
            </div>

            <Separator />

            {/* 关系类型筛选 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Relationship</label>
              <MultiSelect
                options={relationshipOptions}
                selected={filters.relationships}
                onChange={(values) => handleFilterChange('relationships', values)}
                placeholder="Select relationships..."
              />
            </div>

            {/* 应用筛选 - 在专门页面时隐藏 */}
            {!hideAppsFilter && (
              <div className="space-y-2">
                <label className="text-sm font-medium">App Platform</label>
                <MultiSelect
                  options={appOptions}
                  selected={filters.apps}
                  onChange={(values) => handleFilterChange('apps', values)}
                  placeholder="Select apps..."
                />
              </div>
            )}

            {/* 情感筛选 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Feelings</label>
              <MultiSelect
                options={feelingOptions}
                selected={filters.feelings}
                onChange={(values) => handleFilterChange('feelings', values)}
                placeholder="Select feelings..."
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* 清除所有筛选器按钮 */}
        {totalFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 px-2 text-xs gap-1"
          >
            <X className="w-3 h-3" />
            Clear All
          </Button>
        )}
      </div>

      {/* 活跃筛选器显示 */}
      {totalFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {/* 关系类型筛选器 */}
          {filters.relationships.map((relationship) => (
            <Badge 
              key={`relationship-${relationship}`} 
              variant="secondary" 
              className="gap-1 pr-1"
            >
              <span className="text-xs text-muted-foreground">Relationship:</span>
              {getFilterLabel('relationships', relationship)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter('relationships', relationship)}
                className="h-4 w-4 p-0 hover:bg-transparent ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}

          {/* 应用筛选器 - 在专门页面时隐藏 */}
          {!hideAppsFilter && filters.apps.map((app) => (
            <Badge 
              key={`app-${app}`} 
              variant="secondary" 
              className="gap-1 pr-1"
            >
              <span className="text-xs text-muted-foreground">App:</span>
              {getFilterLabel('apps', app)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter('apps', app)}
                className="h-4 w-4 p-0 hover:bg-transparent ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}

          {/* 情感筛选器 */}
          {filters.feelings.map((feeling) => (
            <Badge 
              key={`feeling-${feeling}`} 
              variant="secondary" 
              className="gap-1 pr-1"
            >
              <span className="text-xs text-muted-foreground">Feeling:</span>
              {getFilterLabel('feelings', feeling)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter('feelings', feeling)}
                className="h-4 w-4 p-0 hover:bg-transparent ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
