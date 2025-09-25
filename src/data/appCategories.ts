import { AppCategory } from '@/types/post';

// App分类数据
export const appCategories: AppCategory[] = [
  {
    name: 'Dating',
    apps: [
      { name: 'Hinge', value: 'hinge' },
      { name: 'Tinder', value: 'tinder' },
    ],
  },
  {
    name: 'AI',
    apps: [
      { name: 'Cluely', value: 'cluely' },
      { name: 'Poke', value: 'poke' },
      { name: 'Series', value: 'series' },
      { name: 'CAI', value: 'cai' },
      { name: 'ChatBot', value: 'chatbot' },
    ],
  },
  {
    name: 'IM',
    apps: [
      { name: 'iMessage', value: 'imessage' },
      { name: 'WhatsApp', value: 'whatsapp' },
      { name: 'Telegram', value: 'telegram' },
      { name: 'WeChat', value: 'wechat' },
    ],
  },
  {
    name: 'Social Media Platform',
    apps: [
      { name: 'Twitter', value: 'twitter' },
      { name: 'Instagram', value: 'instagram' },
      { name: 'TikTok', value: 'tiktok' },
    ],
  },
];

// 获取所有分类名称
export const getCategoryNames = (): string[] => {
  return appCategories.map(category => category.name);
};

// 根据分类名称获取应用列表
export const getAppsByCategory = (categoryName: string) => {
  const category = appCategories.find(cat => cat.name === categoryName);
  return category?.apps || [];
};

// 根据应用值获取完整信息
export const getAppInfo = (appValue: string) => {
  for (const category of appCategories) {
    const app = category.apps.find(app => app.value === appValue);
    if (app) {
      return {
        category: category.name,
        app: app,
      };
    }
  }
  return null;
};

// 格式化显示名称
export const formatAppSelection = (appSelection: { category: string; app: string }) => {
  const categoryData = appCategories.find(cat => cat.name === appSelection.category);
  const appData = categoryData?.apps.find(app => app.value === appSelection.app);
  
  if (categoryData && appData) {
    return `${categoryData.name} - ${appData.name}`;
  }
  
  return `${appSelection.category} - ${appSelection.app}`;
};
