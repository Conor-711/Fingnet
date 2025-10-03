import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 确保组件已挂载，避免 hydration 不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your application preferences</p>
      </div>

      <div className="space-y-6">
        {/* 主题设置卡片 */}
        <Card className="shadow-lg border-0 dark:bg-gray-800">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Sun className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription className="text-purple-100">
              Customize how Fingnet looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 block">
                  Theme Mode
                </Label>
                <RadioGroup value={theme} onValueChange={setTheme} className="space-y-3">
                  {/* 白天模式 */}
                  <div
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setTheme('light')}
                  >
                    <RadioGroupItem value="light" id="light" className="text-purple-500" />
                    <Label
                      htmlFor="light"
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                        <Sun className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">Light Mode</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Bright and clear for daytime use
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* 暗夜模式 */}
                  <div
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setTheme('dark')}
                  >
                    <RadioGroupItem value="dark" id="dark" className="text-purple-500" />
                    <Label
                      htmlFor="dark"
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <Moon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">Dark Mode</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Easy on the eyes in low light
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* 系统模式 */}
                  <div
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      theme === 'system'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setTheme('system')}
                  >
                    <RadioGroupItem value="system" id="system" className="text-purple-500" />
                    <Label
                      htmlFor="system"
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">System Mode</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Automatically adjusts to your system preference
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 当前主题提示 */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">ℹ</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Current theme: <span className="capitalize">{theme}</span>
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      {theme === 'system'
                        ? 'The theme will automatically switch based on your device settings'
                        : `You are currently using ${theme} mode`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 其他设置卡片（预留） */}
        <Card className="shadow-lg border-0 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">More Settings</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Additional preferences coming soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">More customization options will be available here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

