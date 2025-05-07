import React, { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bike } from "@shared/schema";
import { Link } from "wouter";

// Form schema for theft report
const theftReportSchema = z.object({
  bikeId: z.coerce.number().min(1, { message: "יש לבחור אופניים" }),
  theftDate: z.string().min(1, { message: "יש להזין תאריך גניבה" }),
  theftLocation: z.string().min(1, { message: "יש להזין מיקום גניבה" }),
  theftDetails: z.string().optional(),
  policeReported: z.boolean().default(false),
  policeStation: z.string().optional(),
  policeFileNumber: z.string().optional(),
  useProfileContact: z.boolean().default(true),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email({ message: "כתובת דוא\"ל לא תקינה" }).optional(),
  visibility: z.enum(["public", "private"]).default("public"),
});

type TheftReportFormValues = z.infer<typeof theftReportSchema>;

export default function ReportTheftPage() {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  
  // Fetch user's registered bikes that are not already reported as stolen
  const { data: bikes = [], isLoading: loadingBikes } = useQuery<Bike[]>({
    queryKey: ["/api/bikes/available"],
  });
  
  // Initialize form
  const form = useForm<TheftReportFormValues>({
    resolver: zodResolver(theftReportSchema),
    defaultValues: {
      bikeId: 0,
      theftDate: new Date().toISOString().split('T')[0],
      theftLocation: "",
      theftDetails: "",
      policeReported: false,
      policeStation: "",
      policeFileNumber: "",
      useProfileContact: true,
      contactName: user?.username || "",
      contactPhone: "",
      contactEmail: "",
      visibility: "public",
    },
  });
  
  // Watch form fields for conditional rendering
  const policeReported = form.watch("policeReported");
  const useProfileContact = form.watch("useProfileContact");
  
  // Report theft mutation
  const reportTheftMutation = useMutation({
    mutationFn: async (data: TheftReportFormValues) => {
      const res = await apiRequest("POST", "/api/reports", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bikes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      navigate("/");
    },
  });
  
  const onSubmit = (data: TheftReportFormValues) => {
    reportTheftMutation.mutate(data);
  };
  
  // Handle cancel button
  const handleCancel = () => {
    navigate("/");
  };
  
  return (
    <>
      <MobileHeader 
        title="דיווח על גניבה" 
        showBackButton={true}
        toggleMobileMenu={() => setIsMobileMenuOpen(true)} 
      />
      <DesktopSidebar activeRoute={location} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        activeRoute={location} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <main className="pt-16 md:pt-0 md:pr-64 min-h-screen pb-20 md:pb-0">
        <section className="p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">דיווח על גניבת אופניים</h2>
            
            <div className="bg-white rounded-lg shadow p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Select Bicycle */}
                  <h3 className="text-lg font-bold mb-4">בחר אופניים</h3>
                  <div className="mb-6">
                    <p className="text-muted-foreground text-sm mb-3">
                      בחר מהאופניים הרשומים שלך או <Link href="/register" className="text-primary">רשום אופניים חדשים</Link>
                    </p>
                    
                    {loadingBikes ? (
                      <div className="text-center py-4">
                        <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                        <p className="mt-2 text-muted-foreground">טוען אופניים...</p>
                      </div>
                    ) : bikes.length === 0 ? (
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <i className="fas fa-exclamation-circle text-muted-foreground text-xl mb-2"></i>
                        <p className="text-muted-foreground">אין לך אופניים רשומים שניתן לדווח עליהם.</p>
                        <Button asChild className="mt-2">
                          <Link href="/register">רשום אופניים עכשיו</Link>
                        </Button>
                      </div>
                    ) : (
                      <FormField
                        control={form.control}
                        name="bikeId"
                        render={({ field }) => (
                          <FormItem>
                            <div className="space-y-3">
                              {bikes.map((bike) => (
                                <div key={bike.id} className="flex items-center">
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={(value) => field.onChange(parseInt(value))}
                                      defaultValue={field.value.toString()}
                                      className="flex flex-col space-y-1"
                                    >
                                      <FormItem className="flex items-center space-x-3 space-y-0 p-3 border border-neutral-light rounded-lg cursor-pointer hover:bg-neutral-lighter">
                                        <FormControl>
                                          <RadioGroupItem value={bike.id.toString()} className="ml-3" />
                                        </FormControl>
                                        <div className="flex items-center flex-1">
                                          <div className="w-14 h-14 bg-muted rounded overflow-hidden ml-3">
                                            {bike.imageUrl ? (
                                              <img 
                                                src={bike.imageUrl} 
                                                alt={`${bike.brand} ${bike.model}`} 
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center">
                                                <i className="fas fa-bicycle text-muted-foreground text-2xl"></i>
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <p className="font-medium">{bike.brand} {bike.model}</p>
                                            <p className="text-sm text-muted-foreground">
                                              {bike.type === "road" ? "אופניי כביש" : 
                                               bike.type === "mountain" ? "אופני הרים" : 
                                               bike.type === "electric" ? "אופניים חשמליים" : "אחר"} | {bike.color} | {bike.year}
                                            </p>
                                          </div>
                                        </div>
                                      </FormItem>
                                    </RadioGroup>
                                  </FormControl>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  {/* Theft Details */}
                  <h3 className="text-lg font-bold mb-4">פרטי הגניבה</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <FormField
                      control={form.control}
                      name="theftDate"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>תאריך הגניבה</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="theftLocation"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>מיקום הגניבה</FormLabel>
                          <FormControl>
                            <Input placeholder="עיר, רחוב, מספר או מקום ציבורי" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="theftDetails"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>פרטים נוספים</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="תיאור האירוע ופרטים רלוונטים שיכולים לעזור במציאת האופניים"
                              className="resize-none"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Police Report */}
                  <h3 className="text-lg font-bold mb-4">דיווח למשטרה</h3>
                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="policeReported"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="ml-2"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>דיווחתי למשטרה על הגניבה</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {policeReported && (
                      <div className="pl-6 border-r-2 border-neutral-light pr-3 space-y-4">
                        <FormField
                          control={form.control}
                          name="policeStation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>תחנת משטרה</FormLabel>
                              <FormControl>
                                <Input placeholder="שם התחנה" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="policeFileNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>מספר תיק</FormLabel>
                              <FormControl>
                                <Input placeholder="מספר התיק במשטרה" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Contact Information */}
                  <h3 className="text-lg font-bold mb-4">פרטי קשר לשיתוף בדיווח הציבורי</h3>
                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="useProfileContact"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="ml-2 mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>השתמש בפרטי הקשר מהפרופיל שלי</FormLabel>
                            <FormDescription>
                              {user?.phone && `טלפון: ${user.phone} | `}
                              {user?.email && `דוא"ל: ${user.email}`}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {!useProfileContact && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>שם איש קשר</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>טלפון</FormLabel>
                              <FormControl>
                                <Input type="tel" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>דוא"ל</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Visibility Settings */}
                  <h3 className="text-lg font-bold mb-4">הגדרות פרטיות</h3>
                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="visibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-3"
                            >
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="public" className="ml-2 mt-1" />
                                </FormControl>
                                <div className="leading-none">
                                  <FormLabel className="font-medium">דיווח ציבורי</FormLabel>
                                  <FormDescription>
                                    הדיווח יופיע במאגר החיפוש הציבורי ויעזור לאנשים לזהות את האופניים שלך
                                  </FormDescription>
                                </div>
                              </FormItem>
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="private" className="ml-2 mt-1" />
                                </FormControl>
                                <div className="leading-none">
                                  <FormLabel className="font-medium">דיווח פרטי</FormLabel>
                                  <FormDescription>
                                    הדיווח ישמר רק במערכת שלנו ולא יופיע בחיפוש הציבורי
                                  </FormDescription>
                                </div>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Submit */}
                  <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCancel}
                      className="order-2 md:order-1 mt-4 md:mt-0"
                    >
                      בטל
                    </Button>
                    <Button
                      type="submit"
                      className="order-1 md:order-2 bg-destructive text-white w-full md:w-auto"
                      disabled={reportTheftMutation.isPending || bikes.length === 0}
                    >
                      {reportTheftMutation.isPending ? "מדווח על גניבה..." : "דווח על גניבה"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </section>
      </main>
      
      <MobileNavigation activeRoute={location} />
    </>
  );
}
