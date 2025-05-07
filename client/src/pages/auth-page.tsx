import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signInWithGoogle, authenticateWithServer } from "@/lib/firebase";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, { message: "שם משתמש חייב להכיל לפחות 3 תווים" }),
  password: z.string().min(6, { message: "סיסמה חייבת להכיל לפחות 6 תווים" }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, { message: "שם משתמש חייב להכיל לפחות 3 תווים" }),
  password: z.string().min(6, { message: "סיסמה חייבת להכיל לפחות 6 תווים" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "הסיסמאות אינן תואמות",
  path: ["confirmPassword"],
});
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log("User is authenticated, redirecting to dashboard", user);
      navigate("/");
    }
  }, [user, navigate]);
  
  const { toast } = useToast();
  
  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      console.log("Starting Google sign-in process");
      
      const result = await signInWithGoogle();
      console.log("Google sign-in successful, got user:", result?.user?.email);
      
      if (result && result.user) {
        console.log("Authenticating with server...");
        // Authenticate with our server using the Firebase token
        await authenticateWithServer(result.user);
        
        console.log("Authentication with server successful, refreshing user data");
        // Refresh the user data
        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
        // Force a page reload to ensure state is fresh
        console.log("Reloading page to ensure fresh state");
        window.location.href = '/';
        
        toast({
          title: "התחברות הצליחה",
          description: "ברוך הבא ל-RideBack!",
        });
      }
    } catch (error: any) {
      console.error("Error with Google sign-in:", error);
      let errorMessage = "אירעה שגיאה בהתחברות. אנא נסה שנית.";
      
      // Handle specific Firebase error codes
      if (error.code === "auth/configuration-not-found") {
        errorMessage = "שגיאת התחברות: Google Authentication לא מוגדר כראוי. צריך להגדיר את ספק האימות בקונסולת Firebase.";
      } else if (error.code === "auth/unauthorized-domain") {
        errorMessage = "הדומיין שלך לא מורשה בהגדרות Firebase. יש להוסיף את הדומיין של האפליקציה לרשימת הדומיינים המורשים בהגדרות Authentication בקונסולת Firebase.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "חלון ההתחברות נחסם. אנא אפשר חלונות קופצים ונסה שוב.";
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "חלון ההתחברות נסגר לפני השלמת התהליך. אנא נסה שוב.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "שגיאת התחברות",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Login form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form setup
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    console.log("Login form submitted for user:", data.username);
    
    loginMutation.mutate(data, {
      onSuccess: (userData) => {
        // Force a page reload after successful login to ensure fresh state
        console.log("Login successful for user:", userData.username);
        console.log("Redirecting to dashboard after login...");
        
        // Add a short delay to ensure session is saved before redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      },
      onError: (error) => {
        console.error("Login submission error:", error.message);
      }
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Omit confirmPassword as it's not needed for the API call
    const { confirmPassword, ...registerData } = data;
    console.log("Registration form submitted for user:", registerData.username);
    
    registerMutation.mutate(registerData, {
      onSuccess: (userData) => {
        // Force a page reload after successful registration to ensure fresh state
        console.log("Registration successful for user:", userData.username);
        console.log("Redirecting to dashboard after registration...");
        
        // Add a short delay to ensure session is saved before redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      },
      onError: (error) => {
        console.error("Registration submission error:", error.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Hero section - takes full width on mobile, half on desktop */}
      <div className="md:w-1/2 bg-primary p-8 text-white flex flex-col justify-center items-center md:fixed md:right-0 md:top-0 md:bottom-0">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">ברוך הבא ל-RideBack</h1>
          <p className="text-lg mb-6">האפליקציה שתעזור לך לרשום, לדווח ולמצוא אופניים גנובים</p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 rounded-full p-3 ml-4">
                <i className="fas fa-bicycle text-xl"></i>
              </div>
              <div className="text-right">
                <h3 className="font-bold mb-1">רישום אופניים</h3>
                <p className="text-sm opacity-80">שמור פרטים מזהים של האופניים שלך למקרה של גניבה</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 rounded-full p-3 ml-4">
                <i className="fas fa-exclamation-triangle text-xl"></i>
              </div>
              <div className="text-right">
                <h3 className="font-bold mb-1">דיווח על גניבה</h3>
                <p className="text-sm opacity-80">דווח על גניבת אופניים ושתף את המידע עם הקהילה</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 rounded-full p-3 ml-4">
                <i className="fas fa-search text-xl"></i>
              </div>
              <div className="text-right">
                <h3 className="font-bold mb-1">חיפוש אופניים</h3>
                <p className="text-sm opacity-80">חפש אופניים גנובים או אבודים במאגר המידע שלנו</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth forms - takes full width on mobile, half on desktop */}
      <div className="md:w-1/2 md:fixed md:left-0 p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {activeTab === "login" ? "התחברות" : "הרשמה"}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" 
                ? "התחבר כדי לנהל את האופניים שלך ולחפש במאגר" 
                : "צור חשבון חדש כדי להתחיל להשתמש באפליקציה"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">התחברות</TabsTrigger>
                <TabsTrigger value="register">הרשמה</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שם משתמש</FormLabel>
                          <FormControl>
                            <Input {...field} autoComplete="username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>סיסמה</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} autoComplete="current-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "מתחבר..." : "התחבר"}
                    </Button>
                  </form>
                </Form>
                
                <div className="my-4 flex items-center">
                  <Separator className="flex-1" />
                  <span className="mx-2 text-sm text-muted-foreground">או</span>
                  <Separator className="flex-1" />
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <>
                      <span className="animate-spin mr-2">◌</span>
                      <span>מתחבר...</span>
                    </>
                  ) : (
                    <>
                      <FcGoogle className="w-5 h-5" />
                      <span>התחבר עם Google</span>
                    </>
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שם משתמש</FormLabel>
                          <FormControl>
                            <Input {...field} autoComplete="username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>סיסמה</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} autoComplete="new-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>אימות סיסמה</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} autoComplete="new-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "נרשם..." : "הירשם"}
                    </Button>
                  </form>
                </Form>
                
                <div className="my-4 flex items-center">
                  <Separator className="flex-1" />
                  <span className="mx-2 text-sm text-muted-foreground">או</span>
                  <Separator className="flex-1" />
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <>
                      <span className="animate-spin mr-2">◌</span>
                      <span>מתחבר...</span>
                    </>
                  ) : (
                    <>
                      <FcGoogle className="w-5 h-5" />
                      <span>הירשם עם Google</span>
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
