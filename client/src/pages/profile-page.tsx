import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Profile form schema
const profileFormSchema = z.object({
  username: z.string().min(3, { message: "שם משתמש חייב להכיל לפחות 3 תווים" }),
  email: z.string().email({ message: "אימייל לא תקין" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  firstName: z.string().optional().or(z.literal("")),
  lastName: z.string().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Password change schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "נדרש להזין את הסיסמה הנוכחית" }),
  newPassword: z.string().min(6, { message: "סיסמה חדשה חייבת להכיל לפחות 6 תווים" }),
  confirmNewPassword: z.string().min(1, { message: "נדרש לאשר את הסיסמה החדשה" }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "הסיסמאות החדשות אינן תואמות",
  path: ["confirmNewPassword"],
});

type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

export default function ProfilePage() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's profile data
  const { data: profileData, isLoading: loadingProfile } = useQuery<Partial<ProfileFormValues> & { bikesCount?: number; activeTheftReportsCount?: number; }>(
    {
      queryKey: ["/api/profile"],
      enabled: !!user,
    }
  );

  // Initialize profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: (profileData?.username ?? user?.username ?? ""),
      email: (profileData?.email ?? ""),
      phone: (profileData?.phone ?? ""),
      firstName: (profileData?.firstName ?? ""),
      lastName: (profileData?.lastName ?? ""),
    },
  });

  // Update values when profile data is loaded
  React.useEffect(() => {
    if (profileData) {
      profileForm.reset({
        username: (profileData.username ?? ""),
        email: (profileData.email ?? ""),
        phone: (profileData.phone ?? ""),
        firstName: (profileData.firstName ?? ""),
        lastName: (profileData.lastName ?? ""),
      });
    }
  }, [profileData, profileForm]);

  // Initialize password change form
  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "הפרופיל עודכן בהצלחה",
        description: "פרטי הפרופיל שלך עודכנו",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בעדכון הפרופיל",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string, newPassword: string }) => {
      const res = await apiRequest("POST", "/api/change-password", data);
      return await res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "הסיסמה שונתה בהצלחה",
        description: "הסיסמה שלך עודכנה, בפעם הבאה התחבר עם הסיסמה החדשה",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בשינוי הסיסמה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordChangeValues) => {
    const { currentPassword, newPassword } = data;
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <>
      <MobileHeader 
        title="פרופיל" 
        toggleMobileMenu={() => setIsMobileMenuOpen(true)} 
      />
      <DesktopSidebar activeRoute={location} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        activeRoute={location} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      <div className="flex min-h-screen bg-background">
        <main className="flex-1 flex flex-col items-center justify-start pt-16 pb-20 md:pb-0">
          <section className="w-full flex flex-col items-center p-4 md:p-8">
            <h2 className="text-2xl font-bold mb-6 w-full max-w-3xl text-center md:text-right">הפרופיל שלי</h2>
            <div className="w-full max-w-3xl space-y-8">
              {/* Profile Summary Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>פרטי משתמש</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl">
                      <span>{user?.username?.substring(0, 2) || "מש"}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{user?.username}</h3>
                      <p className="text-sm text-muted-foreground">
                        {profileData?.email && `${profileData.email} · `}
                        חבר מתאריך {new Date(user?.createdAt || Date.now()).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">סך הכל אופניים רשומים:</span>
                      <span className="font-medium"> {profileData?.bikesCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">דיווחי גניבה פעילים:</span>
                      <span className="font-medium"> {profileData?.activeTheftReportsCount || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Profile Edit Form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>עריכת פרטי פרופיל</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={profileForm.control} name="username" render={({ field }) => (
                          <FormItem>
                            <FormLabel>שם משתמש</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={profileForm.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>אימייל</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={profileForm.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>טלפון</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={profileForm.control} name="firstName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>שם פרטי</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={profileForm.control} name="lastName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>שם משפחה</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" className="bg-primary">עדכן פרופיל</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Password Change Form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>שינוי סיסמה</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                          <FormItem>
                            <FormLabel>סיסמה נוכחית</FormLabel>
                            <FormControl><Input type="password" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                          <FormItem>
                            <FormLabel>סיסמה חדשה</FormLabel>
                            <FormControl><Input type="password" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={passwordForm.control} name="confirmNewPassword" render={({ field }) => (
                          <FormItem>
                            <FormLabel>אישור סיסמה חדשה</FormLabel>
                            <FormControl><Input type="password" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" className="bg-primary">שנה סיסמה</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
      
      <MobileNavigation activeRoute={location} />
    </>
  );
}
