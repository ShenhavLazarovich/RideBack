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
    <div className="flex h-screen">
      {!isMobile && <DesktopSidebar activeRoute="/achievements" />}
      {isMobile && <MobileMenu isOpen={mobileMenuOpen} activeRoute="/achievements" onClose={toggleMobileMenu} />}

      <main className="flex-1 overflow-y-auto bg-background">
        {isMobile && (
          <MobileHeader 
            title="הישגים"
            toggleMobileMenu={toggleMobileMenu}
          />
        )}

        <div className="container py-4 md:py-6 max-w-7xl">
          <h1 className="text-3xl font-bold mb-4 text-center md:text-right">הישגים וסמלים</h1>
          
          <Tabs defaultValue="achievements" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="achievements">הישגים שלי</TabsTrigger>
              <TabsTrigger value="all-badges">כל הסמלים</TabsTrigger>
            </TabsList>
            
            <TabsContent value="achievements" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    ההישגים של {user?.firstName || user?.username}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground">
                    כאן תוכל לראות את כל ההישגים שהשגת עד כה. המשך בפעילות באתר כדי להשיג סמלים נוספים!
                  </p>
                  
                  <AchievementsGrid userId={user?.id} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="all-badges" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">כל הסמלים הזמינים</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground">
                    כאן תוכל לראות את כל הסמלים שניתן להשיג במערכת. הסמלים מחולקים לקטגוריות שונות.
                  </p>
                  
                  <AchievementsGrid />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};