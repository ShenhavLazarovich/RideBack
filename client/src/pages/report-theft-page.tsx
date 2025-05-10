import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
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

// Initialize Mapbox
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
if (!mapboxToken) {
  console.error("Mapbox token is missing! Please check your .env file");
}
mapboxgl.accessToken = mapboxToken;

// Add geocoding function
async function searchAddress(query: string) {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=il&language=he`
    );
    const data = await response.json();
    return data.features;
  } catch (error) {
    console.error('Error searching address:', error);
    return [];
  }
}

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
  latitude: z.string().min(1, { message: "יש לבחור מיקום במפה" }),
  longitude: z.string().min(1, { message: "יש לבחור מיקום במפה" }),
});

type TheftReportFormValues = z.infer<typeof theftReportSchema>;

export default function ReportTheftPage() {
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  
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
      latitude: "",
      longitude: "",
    },
  });
  
  // Watch form fields for conditional rendering
  const policeReported = form.watch("policeReported");
  const useProfileContact = form.watch("useProfileContact");

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [34.7818, 32.0853], // Tel Aviv coordinates
      zoom: 11
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    // Add click handler to place marker
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      
      // Update form values
      form.setValue('latitude', lat.toString());
      form.setValue('longitude', lng.toString());
      
      // Update marker
      if (marker.current) {
        marker.current.remove();
      }
      
      marker.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map.current!);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [form]);
  
  // Report theft mutation
  const reportTheftMutation = useMutation({
    mutationFn: async (data: TheftReportFormValues) => {
      const res = await apiRequest("POST", "/api/reports", {
        ...data,
        theftDate: new Date(data.theftDate).toISOString(),
        status: "active"
      });
      return await res.json();
    },
    onSuccess: () => {
      console.log("onSettled called 1");
      queryClient.invalidateQueries({ queryKey: ["/api/bikes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      console.log("onSettled called 2");
    },
    onError: (error) => {
      console.error("Error submitting theft report:", error);
    },
    onSettled: () => {
      console.log("onSettled called, navigating to main page");
      window.location.href = "/";
    }
  });
  
  const onSubmit = (data: TheftReportFormValues) => {
    console.log("onSubmit called with data:", data);
    reportTheftMutation.mutate(data);
  };
  
  // Handle cancel button
  const handleCancel = () => {
    navigate("/");
  };

  // Add address search handler
  const handleAddressSearch = async (value: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!value.trim()) {
      setAddressSuggestions([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchAddress(value);
      setAddressSuggestions(results);
      setIsSearching(false);
    }, 300);
  };

  // Add address selection handler
  const handleAddressSelect = (feature: any) => {
    const [lng, lat] = feature.center;
    form.setValue('theftLocation', feature.place_name);
    form.setValue('latitude', lat.toString());
    form.setValue('longitude', lng.toString());
    setAddressSuggestions([]);

    // Update map
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15
      });

      if (marker.current) {
        marker.current.remove();
      }

      marker.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map.current);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader 
        title="דיווח על גניבה" 
        toggleMobileMenu={() => setIsMobileMenuOpen(true)} 
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">דיווח על גניבת אופניים</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Bike Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">בחירת אופניים</h3>
                
                {loadingBikes ? (
                  <div className="text-center py-4">
                    <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                    <p className="mt-2 text-muted-foreground">טוען רשימת אופניים...</p>
                  </div>
                ) : bikes.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">אין לך אופניים רשומים</p>
                    <Link href="/register-bike">
                      <Button variant="link" className="mt-2">
                        הוסף אופניים חדשים
                      </Button>
                    </Link>
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
              <div className="space-y-4">
                <h3 className="text-lg font-bold">פרטי הגניבה</h3>
                
                <FormField
                  control={form.control}
                  name="theftDate"
                  render={({ field }) => (
                    <FormItem>
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
                    <FormItem>
                      <FormLabel>מיקום הגניבה</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="הקלד כתובת או מקום..."
                            onChange={(e) => {
                              field.onChange(e);
                              handleAddressSearch(e.target.value);
                            }}
                          />
                        </FormControl>
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <i className="fas fa-spinner fa-spin text-muted-foreground"></i>
                          </div>
                        )}
                        {addressSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border">
                            {addressSuggestions.map((suggestion) => (
                              <button
                                key={suggestion.id}
                                type="button"
                                className="w-full text-right px-4 py-2 hover:bg-muted cursor-pointer"
                                onClick={() => handleAddressSelect(suggestion)}
                              >
                                {suggestion.place_name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <FormDescription>
                        הקלד כתובת או מקום והמפה תתעדכן אוטומטית
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Map Picker */}
                <div className="space-y-2">
                  <FormLabel>מיקום במפה</FormLabel>
                  <div 
                    ref={mapContainer} 
                    className="w-full h-[300px] rounded-lg border"
                  />
                  <FormDescription>
                    המפה תתעדכן אוטומטית לפי הכתובת שבחרת
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>קו רוחב</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>קו אורך</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="theftDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>פרטים נוספים</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="תאר את הנסיבות, האם האופניים היו נעולים, האם יש עדים וכו'"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Police Report */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">דיווח למשטרה</h3>
                
                <FormField
                  control={form.control}
                  name="policeReported"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          דיווחתי למשטרה על הגניבה
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                {policeReported && (
                  <>
                    <FormField
                      control={form.control}
                      name="policeStation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>תחנת משטרה</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="לדוגמה: תחנת תל אביב צפון" />
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
                            <Input {...field} placeholder="לדוגמה: 20230412-123" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
              
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">פרטי התקשרות</h3>
                
                <FormField
                  control={form.control}
                  name="useProfileContact"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          השתמש בפרטי ההתקשרות שלי מהפרופיל
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                {!useProfileContact && (
                  <>
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שם מלא</FormLabel>
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
                            <Input {...field} type="tel" />
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
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
              
              {/* Visibility */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">הגדרות פרטיות</h3>
                
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>חשיפת הדיווח</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="public" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              פומבי - כל המשתמשים יוכלו לראות את הדיווח
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="private" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              פרטי - רק אתה תוכל לראות את הדיווח
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  ביטול
                </Button>
                <Button
                  type="submit"
                  disabled={reportTheftMutation.isPending}
                >
                  {reportTheftMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin ml-2"></i>
                      שולח...
                    </>
                  ) : (
                    "שלח דיווח"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      
      <MobileNavigation activeRoute={location} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        activeRoute={location}
      />
    </div>
  );
}
