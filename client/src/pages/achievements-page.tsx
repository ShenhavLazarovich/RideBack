import React from "react";
import { AchievementsGrid } from "@/components/achievements/AchievementsGrid";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { useLocation } from "wouter";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { MobileNavigation } from "@/components/layout/MobileNavigation";

export default function AchievementsPage() {
  const { user, isLoading } = useAuth();
  const mobileState = useMobile();
  const { isMobile, toggleMobileMenu, mobileMenuOpen } = mobileState;
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <MobileHeader 
        title="הישגים"
        toggleMobileMenu={toggleMobileMenu}
      />
      <DesktopSidebar activeRoute={location} />
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        activeRoute={location} 
        onClose={toggleMobileMenu} 
      />
      
      <div className="flex min-h-screen bg-background">
        <main className="flex-1 flex flex-col items-center justify-start pt-16 pb-20 md:pb-0">
          <section className="w-full flex flex-col items-center p-4 md:p-8">
            <h2 className="text-2xl font-bold mb-6 w-full max-w-3xl text-center md:text-right">הישגים וסמלים</h2>
            <div className="bg-card rounded-lg shadow p-6 md:p-8 border border-border w-full max-w-3xl">
              <Tabs defaultValue="achievements" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="achievements">הישגים שלי</TabsTrigger>
                  <TabsTrigger value="all-badges">כל הסמלים</TabsTrigger>
                </TabsList>
                
                <TabsContent value="achievements" className="mt-4">
                  <div>
                    <h3 className="text-xl font-bold mb-4">
                      ההישגים של {user?.firstName || user?.username}
                    </h3>
                    <p className="mb-6 text-muted-foreground">
                      כאן תוכל לראות את כל ההישגים שהשגת עד כה. המשך בפעילות באתר כדי להשיג סמלים נוספים!
                    </p>
                    
                    <AchievementsGrid userId={user?.id} />
                  </div>
                </TabsContent>
                
                <TabsContent value="all-badges" className="mt-4">
                  <div>
                    <h3 className="text-xl font-bold mb-4">כל הסמלים הזמינים</h3>
                    <p className="mb-6 text-muted-foreground">
                      כאן תוכל לראות את כל הסמלים שניתן להשיג במערכת. הסמלים מחולקים לקטגוריות שונות.
                    </p>
                    
                    <AchievementsGrid />
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