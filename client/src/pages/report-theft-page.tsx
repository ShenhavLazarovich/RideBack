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

// Updated form schema
const theftReportSchema = z.object({
  bikeId: z.coerce.number().min(1, { message: "יש לבחור אופניים" }),
  theftDate: z.string().min(1, { message: "יש להזין תאריך גניבה" }),
  theftLocation: z.string().min(1, { message: "יש להזין מיקום גניבה" }),
  theftDetails: z.string().optional(),
  reward: z.coerce.number().min(0).default(0),
  photos: z.any().optional(),
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  
  // Fetch user's registered bikes
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
      reward: 0,
      latitude: "",
      longitude: "",
    },
  });
  
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
    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      form.setValue('latitude', lat.toString());
      form.setValue('longitude', lng.toString());
      if (marker.current) marker.current.remove();
      marker.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current!);
      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&language=he`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          form.setValue('theftLocation', data.features[0].place_name);
        }
      } catch (err) {
        // Optionally handle error
      }
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
      // Final check for required fields
      if (!data.bikeId || !data.theftDate || !data.theftLocation || !data.latitude || !data.longitude) {
        throw new Error("יש למלא את כל השדות החיוניים");
      }

      // Create the request body
      const requestBody = {
        bikeId: Number(data.bikeId),
        theftDate: new Date(data.theftDate).toISOString(),
        theftLocation: data.theftLocation,
        latitude: data.latitude,
        longitude: data.longitude,
        theftDetails: data.theftDetails || undefined,
        reward: data.reward || undefined
      };

      // Debug: log the request body
      console.log('Request body:', requestBody);

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      return await res.json();
    },
    onSuccess: () => {
      setShowConfirmation(true);
      queryClient.invalidateQueries({ queryKey: ["/api/bikes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: (error) => {
      alert("שגיאה בשליחת הדיווח: " + error);
    },
  });
  
  const onSubmit = (data: TheftReportFormValues) => {
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

  // Helper to check if required fields are filled
  const requiredFieldsFilled =
    form.watch("bikeId") &&
    form.watch("bikeId") !== 0 &&
    form.watch("theftDate") &&
    form.watch("theftLocation") &&
    form.watch("latitude") &&
    form.watch("longitude");

  if (showConfirmation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4">הדיווח נשלח בהצלחה!</h2>
          <p className="mb-4">תודה על הדיווח. תוכל לעקוב אחרי סטטוס הדיווח שלך בלוח הבקרה.</p>
          <Button onClick={() => navigate("/")}>חזור לדף הבית</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar activeRoute={location} />
      <main className="pt-16 md:pt-0 md:pr-64 min-h-screen pb-20 md:pb-0">
        <section className="p-4 md:p-8">
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">דיווח על גניבת אופניים/קורקינט</h1>
            <div className="bg-card rounded-lg shadow p-6 border border-border">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Bike selection */}
                  <div>
                    <label className="block font-medium mb-1">בחר אופניים <span className="text-red-500">*</span></label>
                    <select {...form.register("bikeId", { required: true, valueAsNumber: true })} className="w-full border rounded p-2">
                      <option value={0}>בחר אופניים</option>
                      {bikes.map((bike: Bike) => (
                        <option key={bike.id} value={bike.id}>{bike.brand} {bike.model}</option>
                      ))}
                    </select>
                    {form.formState.errors.bikeId && (
                      <div className="text-red-500 text-xs mt-1">יש לבחור אופניים</div>
                    )}
                  </div>
                  {/* Date */}
                  <div>
                    <label className="block font-medium mb-1">תאריך הגניבה <span className="text-red-500">*</span></label>
                    <Input type="date" {...form.register("theftDate", { required: true })} />
                    {form.formState.errors.theftDate && (
                      <div className="text-red-500 text-xs mt-1">יש להזין תאריך</div>
                    )}
                  </div>
                  {/* Location */}
                  <div>
                    <label className="block font-medium mb-1">מיקום הגניבה <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Input
                        {...form.register("theftLocation", { required: true })}
                        placeholder="הקלד כתובת או מקום..."
                        autoComplete="off"
                        onChange={async (e) => {
                          form.setValue("theftLocation", e.target.value);
                          if (searchTimeout.current) clearTimeout(searchTimeout.current);
                          const value = e.target.value;
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
                        }}
                        value={form.watch("theftLocation")}
                      />
                      {isSearching && (
                        <div className="absolute left-3 top-3">
                          <i className="fas fa-spinner fa-spin text-muted-foreground"></i>
                        </div>
                      )}
                      {addressSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border max-h-48 overflow-auto">
                          {addressSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              type="button"
                              className="w-full text-right px-4 py-2 hover:bg-muted cursor-pointer"
                              onClick={() => {
                                form.setValue('theftLocation', suggestion.place_name);
                                form.setValue('latitude', suggestion.center[1].toString());
                                form.setValue('longitude', suggestion.center[0].toString());
                                setAddressSuggestions([]);
                                // Update map marker
                                if (map.current) {
                                  map.current.flyTo({ center: suggestion.center, zoom: 15 });
                                  if (marker.current) marker.current.remove();
                                  marker.current = new mapboxgl.Marker().setLngLat(suggestion.center).addTo(map.current);
                                }
                              }}
                            >
                              {suggestion.place_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {form.formState.errors.theftLocation && (
                      <div className="text-red-500 text-xs mt-1">יש להזין מיקום</div>
                    )}
                    <div ref={mapContainer} className="w-full h-60 rounded border mt-2" />
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block font-medium mb-1">פרטים נוספים</label>
                    <Textarea {...form.register("theftDetails")} placeholder="תאר את הנסיבות, האם האופניים היו נעולים, האם יש עדים וכו'" />
                  </div>
                  {/* Cash Reward */}
                  <div>
                    <label className="block font-medium mb-1">פרס כספי (אופציונלי)</label>
                    <Input type="number" min={0} {...form.register("reward")} placeholder="הזן סכום פרס" />
                  </div>
                  {/* Photo Upload */}
                  <div>
                    <label className="block font-medium mb-1">העלה תמונות (אופציונלי)</label>
                    <Input type="file" multiple accept="image/*" onChange={e => setUploadedPhotos(Array.from(e.target.files || []))} />
                    {uploadedPhotos.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {uploadedPhotos.map((file, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 rounded px-2 py-1">{file.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={handleCancel}>ביטול</Button>
                    <Button type="submit" className="bg-primary text-primary-foreground" disabled={!requiredFieldsFilled || reportTheftMutation.isPending}>שלח דיווח</Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
