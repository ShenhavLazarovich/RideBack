import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { BikeCard } from "@/components/bikes/BikeCard";
import { AlertCard } from "@/components/bikes/AlertCard";
import { QuickStat } from "@/components/bikes/QuickStat";
import { getFirstName } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bike, Alert } from "@shared/schema";
import { TheftMap } from "@/components/map/TheftMap";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("map");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // Fetch bikes
  const { data: bikes = [], isLoading: loadingBikes } = useQuery<Bike[]>({
    queryKey: ["/api/bikes"],
  });
  
  // Fetch alerts
  const { data: alerts = [], isLoading: loadingAlerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });
  
  // Stats for dashboard
  const stats = {
    registeredBikes: bikes.length,
    activeReports: bikes.filter(b => b.status === "stolen").length,
    recoveredBikes: bikes.filter(b => b.status === "found").length,
    newAlerts: alerts.filter(a => !a.read).length,
  };
  
  // Mark alert as read
  const markAlertAsReadMutation = useMutation({
    mutationFn: async (alertId: number) => {
      return await apiRequest("PATCH", `/api/alerts/${alertId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });
  
  const handleMarkAlertAsRead = (alertId: number) => {
    markAlertAsReadMutation.mutate(alertId);
  };
  
  // Get username first name to display in welcome message
  const firstName = user ? getFirstName(user.username) : "";
  
  return (
    <>
      <MobileHeader 
        title="RideBack" 
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
            <div className="w-full max-w-3xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="fas fa-map-marker-alt text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">תל אביב, ישראל</span>
                </div>
                <Button onClick={() => navigate("/report")} className="gap-1 bg-red-600 hover:bg-red-700">
                  <i className="fas fa-plus" /> דווח על גניבה
                </Button>
              </div>
              <div className="relative mb-4">
                <i className="fas fa-search absolute left-3 top-3 text-muted-foreground" />
                <Input placeholder="חפש אופניים, קורקינטים או מודעות..." className="pl-9" />
              </div>
              <Tabs defaultValue="map" className="mb-4" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="map">מפת גניבות</TabsTrigger>
                  <TabsTrigger value="listings">לוח מודעות</TabsTrigger>
                </TabsList>
                <TabsContent value="map" className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">דיווחים אחרונים</h2>
                    <Button variant="outline" size="sm" className="gap-1">
                      <i className="fas fa-filter" /> סנן
                    </Button>
                  </div>
                  <div className="rounded-lg overflow-hidden border mb-4" style={{ height: 400 }}>
                    <TheftMap />
                  </div>
                  {/* Recent Reports List Placeholder */}
                  <h3 className="text-sm font-medium mb-2">דיווחים אחרונים בסביבה</h3>
                  <div className="space-y-2">
                    {alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="p-3 border rounded flex items-center gap-3 bg-white">
                        <i className="fas fa-exclamation-triangle text-red-500"></i>
                        <div>
                          <div className="font-bold">{alert.title || "דיווח גניבה"}</div>
                          <div className="text-xs text-muted-foreground">{typeof alert.createdAt === 'string' ? alert.createdAt : new Date(alert.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="listings" className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">מודעות חדשות</h2>
                  </div>
                  <div className="w-full max-w-2xl mx-auto">
                    <div className="bg-card rounded-lg shadow p-6 border border-border flex flex-col items-center text-center">
                      <i className="fab fa-facebook text-4xl text-blue-600 mb-4"></i>
                      <h3 className="text-xl font-bold mb-2">מודעות פייסבוק מרקטפלייס</h3>
                      <p className="mb-6 text-muted-foreground">
                        כאן תוכל לצפות במודעות אופניים וקורקינטים למכירה מתוך Facebook Marketplace בישראל. לחיצה על אחד הכפתורים תעביר אותך ישירות לדף הרלוונטי בפייסבוק.
                      </p>
                      <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                        <a href="https://www.facebook.com/marketplace/105930569439602/bicycles/" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                          <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2" size="lg">
                            <i className="fas fa-bicycle"></i> צפה באופניים למכירה בפייסבוק
                          </Button>
                        </a>
                        <a href="https://www.facebook.com/marketplace/105930569439602/scooters/" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                          <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2" size="lg">
                            <i className="fas fa-motorcycle"></i> צפה בקורקינטים למכירה בפייסבוק
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>
      </div>
      <MobileNavigation activeRoute={location} />
    </>
  );
}
