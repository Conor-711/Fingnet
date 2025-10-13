import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Onboarding } from "@/components/Onboarding";
import Landing from "./pages/Landing";
import Main from "./pages/Main";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ExtensionLogin from "./pages/auth/ExtensionLogin";
import ExtensionCallback from "./pages/auth/ExtensionCallback";
import ExtensionApiHandler from "./pages/api/ExtensionApiHandler";

const queryClient = new QueryClient();

// Google Client ID
const GOOGLE_CLIENT_ID = "204020224662-g7ce4b6pr0n55fe4ukiv6cd1g37199c5.apps.googleusercontent.com";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <OnboardingProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Landing Page - Public */}
                  <Route path="/" element={<Landing />} />
                  
                  {/* Legal Pages - Public */}
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  
                  {/* Extension Auth Routes - Public (不需要 ProtectedRoute) */}
                  <Route path="/auth/extension-login" element={<ExtensionLogin />} />
                  <Route path="/auth/extension-callback" element={<ExtensionCallback />} />
                  
                  {/* Extension API Routes - Public */}
                  <Route path="/api/extension" element={<ExtensionApiHandler />} />
                  
                  {/* Onboarding Route - Protected */}
                  <Route 
                    path="/onboarding" 
                    element={
                      <ProtectedRoute>
                        <Onboarding />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Main App Routes - Protected */}
                  <Route 
                    path="/main" 
                    element={
                      <ProtectedRoute>
                        <Main />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile/:id" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;