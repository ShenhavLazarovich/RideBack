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

export default function DashboardPage() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  
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
      
      <main className="pt-16 md:pt-0 md:pr-64 min-h-screen pb-20 md:pb-0">
        <section className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">ברוך הבא, {firstName}</h2>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <QuickStat 
                label="אופניים רשומים" 
                value={stats.registeredBikes} 
                color="primary" 
              />
              <QuickStat 
                label="דיווחים פעילים" 
                value={stats.activeReports} 
                color="destructive" 
              />
              <QuickStat 
                label="אופניים שנמצאו" 
                value={stats.recoveredBikes} 
                color="success" 
              />
              <QuickStat 
                label="התראות חדשות" 
                value={stats.newAlerts} 
                color="secondary" 
              />
            </div>
            
            {/* Theft Map */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">מפת גניבות פעילה</h3>
              <TheftMap />
            </div>
            
            {/* Alert Banner - show only if there are active theft reports */}
            {stats.activeReports > 0 && (
              <div className="bg-destructive bg-opacity-10 border border-destructive text-destructive rounded-lg p-4 mb-8 flex items-start">
                <i className="fas fa-exclamation-circle mt-1 ml-3 text-xl"></i>
                <div>
                  <h3 className="font-bold mb-1">דיווח גניבה פעיל</h3>
                  <p className="text-sm">יש לך {stats.activeReports} אופניים שדווחו כגנובים. <Link href="/report" className="underline">צפה בפרטים</Link></p>
                </div>
              </div>
            )}
            
            {/* Quick Actions */}
            <h3 className="text-xl font-bold mb-4">פעולות מהירות</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <Link href="/register" className="bg-white rounded-lg shadow p-5 text-center hover:shadow-md transition-shadow">
                <i className="fas fa-bicycle text-2xl text-primary mb-3"></i>
                <p className="font-medium">רישום אופניים</p>
              </Link>
              <Link href="/report" className="bg-white rounded-lg shadow p-5 text-center hover:shadow-md transition-shadow">
                <i className="fas fa-exclamation-triangle text-2xl text-destructive mb-3"></i>
                <p className="font-medium">דיווח על גניבה</p>
              </Link>
              <Link href="/search" className="bg-white rounded-lg shadow p-5 text-center hover:shadow-md transition-shadow">
                <i className="fas fa-search text-2xl text-secondary mb-3"></i>
                <p className="font-medium">חיפוש אופניים</p>
              </Link>
            </div>
            
            {/* My Bicycles */}
            <h3 className="text-xl font-bold mb-4">האופניים שלי</h3>
            
            {loadingBikes ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                <p className="mt-2 text-muted-foreground">טוען אופניים...</p>
              </div>
            ) : bikes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <i className="fas fa-bicycle text-muted-foreground text-4xl mb-3"></i>
                <p className="text-muted-foreground mb-4">אין לך אופניים רשומים עדיין</p>
                <Link href="/register" className="bg-primary text-white px-4 py-2 rounded-md">
                  רשום אופניים עכשיו
                </Link>
              </div>
            ) : (
              bikes.map((bike) => (
                <BikeCard key={bike.id} bike={bike} />
              ))
            )}
            
            <div className="mt-4">
              <Link href="/register" className="inline-flex items-center text-primary font-medium">
                <i className="fas fa-plus-circle ml-2"></i>
                רשום אופניים נוספים
              </Link>
            </div>
            
            {/* Recent Alerts */}
            <h3 className="text-xl font-bold mt-10 mb-4">התראות אחרונות</h3>
            
            {loadingAlerts ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                <p className="mt-2 text-muted-foreground">טוען התראות...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <i className="fas fa-bell-slash text-muted-foreground text-4xl mb-3"></i>
                <p className="text-muted-foreground">אין התראות חדשות</p>
              </div>
            ) : (
              alerts.slice(0, 3).map((alert) => (
                <AlertCard 
                  key={alert.id} 
                  alert={alert} 
                  onMarkAsRead={handleMarkAlertAsRead} 
                />
              ))
            )}
            
            {alerts.length > 0 && (
              <div className="mt-4">
                <Link href="/alerts" className="inline-flex items-center text-primary font-medium">
                  <i className="fas fa-bell ml-2"></i>
                  כל ההתראות
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <MobileNavigation activeRoute={location} />
    </>
  );
}
