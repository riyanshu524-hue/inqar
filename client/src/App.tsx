import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/_core/hooks/useAuth";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import MainLayout from "./components/MainLayout";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Notifications from "./pages/Notifications";
import UserProfile from "./pages/UserProfile";
import PrivacySettings from "./pages/PrivacySettings";
import Explore from "./pages/Explore";
import Messages from "./pages/Messages";
import Marketplace from "./pages/Marketplace";
import AIAssistant from "./pages/AIAssistant";
import VIPSubscription from "./pages/VIPSubscription";
import AdminPanel from "./pages/AdminPanel";
import { Spinner } from "@/components/ui/spinner";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // Public routes
  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Authenticated routes
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Feed} />
        <Route path="/feed" component={Feed} />
        <Route path="/profile/edit" component={ProfileEdit} />
        <Route path="/settings/privacy" component={PrivacySettings} />
        <Route path="/@/:username" component={UserProfile} />
        <Route path="/profile/:username" component={Profile} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/explore" component={Explore} />
        <Route path="/messages" component={Messages} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/ai" component={AIAssistant} />
        <Route path="/vip" component={VIPSubscription} />
        {user.role === "admin" && (
          <Route path="/admin" component={AdminPanel} />
        )}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
