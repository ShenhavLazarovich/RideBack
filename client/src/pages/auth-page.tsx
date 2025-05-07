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
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

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
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

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
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Omit confirmPassword as it's not needed for the API call
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const result = await signInWithGoogle();
      
      if (result.success && result.user) {
        // Send the Google user data to our backend
        const response = await fetch('/api/login/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: result.user.email,
            displayName: result.user.displayName,
            uid: result.user.uid,
            photoURL: result.user.photoURL,
          }),
        });

        if (response.ok) {
          // Refresh user data
          window.location.href = '/';
        } else {
          const errorData = await response.json();
          toast({
            title: "התחברות נכשלה",
            description: errorData.message || "אירעה שגיאה בעת התחברות עם גוגל",
            variant: "destructive",
          });
        }
      } else {
        // Check if it's a configuration error
        if (result.error && result.error.includes("Firebase is not configured")) {
          toast({
            title: "התחברות עם גוגל לא זמינה",
            description: "נדרשת קונפיגורציה של Firebase כדי להשתמש באפשרות זו. הזן את פרטי ה-API של Firebase בסביבת העבודה.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "התחברות נכשלה",
            description: result.error || "אירעה שגיאה בעת התחברות עם גוגל",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "התחברות נכשלה",
        description: error?.message || "אירעה שגיאה בעת התחברות עם גוגל",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
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

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        או התחבר באמצעות
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    type="button"
                    className="w-full mt-4 flex items-center justify-center"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <span className="ml-2">מתחבר...</span>
                    ) : (
                      <>
                        <svg
                          className="ml-2 h-4 w-4"
                          aria-hidden="true"
                          focusable="false"
                          data-prefix="fab"
                          data-icon="google"
                          role="img"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 488 512"
                        >
                          <path
                            fill="currentColor"
                            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                          ></path>
                        </svg>
                        התחבר עם גוגל
                      </>
                    )}
                  </Button>
                </div>
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

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        או הירשם באמצעות
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    type="button"
                    className="w-full mt-4 flex items-center justify-center"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <span className="ml-2">מתחבר...</span>
                    ) : (
                      <>
                        <svg
                          className="ml-2 h-4 w-4"
                          aria-hidden="true"
                          focusable="false"
                          data-prefix="fab"
                          data-icon="google"
                          role="img"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 488 512"
                        >
                          <path
                            fill="currentColor"
                            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                          ></path>
                        </svg>
                        הירשם עם גוגל
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
