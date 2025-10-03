import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Trash2, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { deleteUserAccount } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 确保组件已挂载，避免 hydration 不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  // 处理删除账号
  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error('未找到用户信息');
      return;
    }

    try {
      setIsDeleting(true);
      console.log('🗑️ 用户请求删除账号:', user.id);

      // 调用删除函数
      const { error } = await deleteUserAccount(user.id);

      if (error) {
        console.error('❌ 删除账号失败:', error);
        toast.error('删除账号失败，请重试');
        setIsDeleting(false);
        return;
      }

      console.log('✅ 账号删除成功');
      toast.success('您的账号及所有数据已成功删除');

      // 清除本地存储
      localStorage.clear();

      // 登出并重定向到首页
      await logout();
      navigate('/');

    } catch (error) {
      console.error('❌ 删除账号异常:', error);
      toast.error('删除账号时发生错误');
      setIsDeleting(false);
    }
  };

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

        {/* 危险区域 - 删除账号 */}
        <Card className="shadow-lg border-2 border-red-200 dark:border-red-800 dark:bg-gray-800">
          <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription className="text-red-100">
              Irreversible actions that will permanently affect your account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Once you delete your account, there is no going back. This action will permanently delete:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-6 ml-2">
                  <li>Your AI Twin profile and all settings</li>
                  <li>All your conversation history</li>
                  <li>Your connections and group chats</li>
                  <li>All invitations (sent and received)</li>
                  <li>Your memories and preferences</li>
                  <li>Your user account data</li>
                </ul>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="lg"
                      className="w-full sm:w-auto"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete My Account'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                        <span>Are you absolutely sure?</span>
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          This action cannot be undone!
                        </p>
                        <p>
                          This will permanently delete your account and remove all your data from our servers.
                          You will need to create a new account and complete onboarding again if you want to use Fingnet in the future.
                        </p>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Note:</strong> If you just want to log out temporarily, use the "Logout" option instead.
                            Logout will keep your data safe for when you return.
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      >
                        Yes, Delete My Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

