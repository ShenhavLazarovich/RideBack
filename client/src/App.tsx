import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import DashboardPage from "@/pages/dashboard-page";
import RegisterBikePage from "@/pages/register-bike-page";
import ReportTheftPage from "@/pages/report-theft-page";
import SearchPage from "@/pages/search-page";
import ProfilePage from "@/pages/profile-page";
import { useEffect, useState } from "react";
import { handleRedirectResult, authenticateWithServer } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

// Component to handle Firebase Auth redirects
function FirebaseAuthHandler() {
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        // Check if we have a redirect result (coming back from Google auth redirect)
        const result = await handleRedirectResult();
        if (result && result.user) {
          // User successfully authenticated with Firebase via redirect
          // Now authenticate with our server
          await authenticateWithServer(result.user);
          
          // Update the auth state
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          
          toast({
            title: "התחברות הצליחה",
            description: "ברוך הבא ל-RideBack!",
          });
        }
      } catch (error: any) {
        console.error("Error handling redirect:", error);
        if (error.message !== "No redirect result") {
          let errorMessage = "אירעה שגיאה בהתחברות. אנא נסה שנית.";
          
          // Handle specific Firebase error codes
          if (error.code === "auth/configuration-not-found") {
            errorMessage = "שגיאת התחברות: Google Authentication לא מוגדר כראוי בפרויקט Firebase.";
          } else if (error.code) {
            errorMessage = `שגיאת Firebase: ${error.code}`;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          toast({
            title: "שגיאת התחברות",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkRedirectResult();
  }, [toast]);

  // If we're checking the redirect result, return nothing or a simple loading indicator
  if (isChecking) {
    return <div className="h-screen w-screen flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/register" component={RegisterBikePage} />
      <ProtectedRoute path="/report" component={ReportTheftPage} />
      <ProtectedRoute path="/search" component={SearchPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FirebaseAuthHandler />
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
