import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleAuthProvider } from "@/contexts/GoogleAuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { useEffect, useState } from "react";
import { appInitializer } from "@/lib/appInitializer";
import { Onboarding } from "@/components/Onboarding";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import PostDetail from "./pages/PostDetail";
import SharePost from "./pages/SharePost";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 开始初始化应用...');
        const result = await appInitializer.initialize();
        
        if (result.success) {
          console.log('✅ 应用初始化成功');
          console.log(`📊 存储类型: ${result.storageType}`);
          if (result.warnings.length > 0) {
            console.warn('⚠️ 初始化警告:', result.warnings);
          }
        } else {
          console.error('❌ 应用初始化失败:', result.errors);
          setInitError(result.errors.join(', '));
        }
      } catch (error) {
        console.error('❌ 应用初始化异常:', error);
        setInitError(`初始化异常: ${error}`);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在初始化存储系统...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-destructive mb-4">⚠️</div>
          <h1 className="text-lg font-semibold mb-2">初始化失败</h1>
          <p className="text-muted-foreground mb-4">{initError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppInitializer>
        <AuthProvider>
          <GoogleAuthProvider>
            <OnboardingProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Onboarding Route */}
                <Route path="/onboarding" element={<Onboarding />} />

                {/* Main App Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/post/:postId" element={<PostDetail />} />
                <Route path="/share" element={<SharePost />} />
                <Route path="/settings" element={<Settings />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </OnboardingProvider>
        </GoogleAuthProvider>
      </AuthProvider>
      </AppInitializer>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
