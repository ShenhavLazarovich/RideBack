import React, { useState } from "react";
import { useLocation, useRouter } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { FileUpload } from "@/components/ui/file-upload";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Form schema for bike registration
const bikeFormSchema = z.object({
  brand: z.string().min(1, { message: "יש לציין את יצרן האופניים" }),
  model: z.string().min(1, { message: "יש לציין את דגם האופניים" }),
  type: z.string().min(1, { message: "יש לבחור סוג אופניים" }),
  year: z.coerce.number().min(1970, { message: "שנת ייצור לא תקינה" }).max(new Date().getFullYear(), { message: "שנת ייצור לא תקינה" }),
  color: z.string().min(1, { message: "יש לציין את צבע האופניים" }),
  frameSize: z.string().optional(),
  serialNumber: z.string().min(4, { message: "מספר שלדה חייב להכיל לפחות 4 תווים" }),
  additionalInfo: z.string().optional(),
});

type BikeFormValues = z.infer<typeof bikeFormSchema>;

export default function RegisterBikePage() {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bikeImages, setBikeImages] = useState<File[]>([]);
  const { user } = useAuth();
  
  // Initialize form
  const form = useForm<BikeFormValues>({
    resolver: zodResolver(bikeFormSchema),
    defaultValues: {
      brand: "",
      model: "",
      type: "",
      year: new Date().getFullYear(),
      color: "",
      frameSize: "",
      serialNumber: "",
      additionalInfo: "",
    },
  });
  
  // Register bike mutation
  const registerBikeMutation = useMutation({
    mutationFn: async (data: BikeFormValues) => {
      // First, create the bike
      const res = await apiRequest("POST", "/api/bikes", data);
      const bike = await res.json();
      
      // If there are images, upload them
      if (bikeImages.length > 0) {
        const formData = new FormData();
        bikeImages.forEach(file => {
          formData.append('images', file);
        });
        
        await apiRequest("POST", `/api/bikes/${bike.id}/images`, formData);
      }
      
      return bike;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bikes"] });
      navigate("/");
    },
  });
  
  const onSubmit = (data: BikeFormValues) => {
    registerBikeMutation.mutate(data);
  };
  
  // Handle image selection
  const handleImageChange = (files: File[]) => {
    setBikeImages(files);
  };
  
  // Handle cancel button
  const handleCancel = () => {
    navigate("/");
  };
  
  return (
    <>
      <MobileHeader 
        title="רישום אופניים" 
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
            <h2 className="text-2xl font-bold mb-6">רישום אופניים חדשים</h2>
            
            <div className="bg-white rounded-lg shadow p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Info */}
                  <h3 className="text-lg font-bold mb-4">פרטי האופניים</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>יצרן</FormLabel>
                          <FormControl>
                            <Input placeholder="Trek, Specialized, Giant וכו׳" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>דגם</FormLabel>
                          <FormControl>
                            <Input placeholder="FX 3, Rockhopper וכו׳" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>סוג אופניים</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="בחר סוג" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="road">אופני כביש</SelectItem>
                              <SelectItem value="mountain">אופני הרים</SelectItem>
                              <SelectItem value="hybrid">אופני היברידיים</SelectItem>
                              <SelectItem value="electric">אופניים חשמליים</SelectItem>
                              <SelectItem value="city">אופני עיר</SelectItem>
                              <SelectItem value="other">אחר</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שנת ייצור</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2023" 
                              min={1970}
                              max={new Date().getFullYear()}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value === "" ? "" : e.target.value;
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>צבע</FormLabel>
                          <FormControl>
                            <Input placeholder="שחור, אדום, כחול וכו׳" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="frameSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>גודל שלדה</FormLabel>
                          <FormControl>
                            <Input placeholder="M, L או מידה במספרים" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Serial Number */}
                  <h3 className="text-lg font-bold mb-4">מספר שלדה (מספר סידורי)</h3>
                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>מספר שלדה</FormLabel>
                        <FormControl>
                          <Input placeholder="בדרך כלל מוטבע בתחתית השלדה" {...field} />
                        </FormControl>
                        <FormDescription>
                          מספר השלדה הוא המזהה הייחודי של האופניים. זהו מספר באורך 8-12 תווים.
                        </FormDescription>
                        <div className="mt-3">
                          <a href="#" className="text-primary text-sm">
                            <i className="fas fa-question-circle ml-1"></i>
                            איך למצוא את מספר השלדה?
                          </a>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Photos */}
                  <h3 className="text-lg font-bold mb-4">תמונות</h3>
                  <FileUpload 
                    onChange={handleImageChange}
                    value={bikeImages}
                    maxFiles={5}
                    maxSizeMB={5}
                    accept="image/jpeg,image/png"
                  />
                  
                  {/* Additional Info */}
                  <h3 className="text-lg font-bold mb-4">פרטים נוספים</h3>
                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>מידע נוסף / סימנים מזהים</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="מדבקות, שריטות, התאמות מיוחדות או כל פרט שיעזור לזהות את האופניים"
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                      className="order-1 md:order-2 bg-primary text-white w-full md:w-auto"
                      disabled={registerBikeMutation.isPending}
                    >
                      {registerBikeMutation.isPending ? "רושם אופניים..." : "רשום אופניים"}
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
