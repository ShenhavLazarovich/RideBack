import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Refetch every 10 seconds to ensure session is still valid
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Attempting login with credentials:", { ...credentials, password: "[HIDDEN]" });
      const res = await apiRequest("POST", "/api/login", credentials);
      
      // Check document.cookie to see if the cookie was set
      console.log("Cookies after login:", document.cookie);
      
      const userData = await res.json();
      console.log("Login response:", userData);
      
      // Force a quick validation of user data
      try {
        const validateRes = await fetch("/api/user", {
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache"
          }
        });
        
        console.log("Validation request status:", validateRes.status);
        
        if (validateRes.ok) {
          console.log("Session validation successful");
        } else {
          console.log("Session validation failed with status:", validateRes.status);
        }
      } catch (error) {
        console.error("Session validation error:", error);
      }
      
      return userData;
    },
    onSuccess: (user: SelectUser) => {
      console.log("Login successful, updating query data with user:", user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "התחברת בהצלחה",
        description: `ברוך הבא, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login failed with error:", error);
      toast({
        title: "התחברות נכשלה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "נרשמת בהצלחה",
        description: "ברוך הבא ל-RideBack!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "ההרשמה נכשלה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "התנתקת בהצלחה",
        description: "להתראות!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "ההתנתקות נכשלה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
