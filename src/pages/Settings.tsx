import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ProfileEditForm } from '@/components/ProfileEditForm';
import { StorageManager } from '@/components/StorageManager';
import { PinterestSidebar } from '@/components/PinterestSidebar';
import { ArrowLeft, Moon, Sun, Monitor, LogOut, User, Shield, Palette, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
    setShowLogoutDialog(false);
  };

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System';
      default:
        return 'System';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <PinterestSidebar currentPage="settings" />
        <div className="flex-1 max-w-4xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>

        {/* Settings Content */}
        <div className="p-4">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="w-4 h-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="storage" className="gap-2">
                <Database className="w-4 h-4" />
                Storage
              </TabsTrigger>
              <TabsTrigger value="account" className="gap-2">
                <Shield className="w-4 h-4" />
                Account
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <ProfileEditForm />
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="mt-6 space-y-6">
              <div className="max-w-2xl">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Theme Settings</h2>
                    <p className="text-sm text-muted-foreground">
                      Customize how OnlyText looks on your device
                    </p>
                  </div>

                  <div className="bg-card rounded-lg border border-border p-6">
                    <div className="space-y-4">
                      {/* Theme Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Theme</Label>
                        <Select value={theme} onValueChange={setTheme}>
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                {getThemeIcon(theme || 'system')}
                                <span>{getThemeLabel(theme || 'system')}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">
                              <div className="flex items-center gap-2">
                                <Sun className="w-4 h-4" />
                                <span>Light Mode</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="dark">
                              <div className="flex items-center gap-2">
                                <Moon className="w-4 h-4" />
                                <span>Dark Mode</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="system">
                              <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4" />
                                <span>System</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Choose your preferred theme. System will match your device's setting.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Storage Tab */}
            <TabsContent value="storage" className="mt-6">
              <StorageManager />
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="mt-6 space-y-6">
              <div className="max-w-2xl space-y-6">
                {/* Privacy & Security Section */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Privacy & Security</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your privacy and security settings
                    </p>
                  </div>

                  <div className="bg-card rounded-lg border border-border p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Private Account</Label>
                          <p className="text-xs text-muted-foreground">
                            Make your profile and posts private
                          </p>
                        </div>
                        <Switch />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Show Activity Status</Label>
                          <p className="text-xs text-muted-foreground">
                            Let others see when you're active
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Read Receipts</Label>
                          <p className="text-xs text-muted-foreground">
                            Show when you've read messages
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-destructive">Account Actions</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your account settings
                    </p>
                  </div>

                  <div className="bg-card rounded-lg border border-destructive/20 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Sign Out</p>
                        <p className="text-sm text-muted-foreground">
                          Sign out of your account on this device
                        </p>
                      </div>
                      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Sign Out</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to sign out? You'll need to sign in again to access your account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleLogout}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Sign Out
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-8 pb-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      OnlyText v1.0.0
                    </p>
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                        Privacy Policy
                      </Button>
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                        Terms of Service
                      </Button>
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                        Support
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
