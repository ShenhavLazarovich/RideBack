import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgeCard } from "./BadgeCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge, UserAchievement } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface AchievementsGridProps {
  userId?: number;
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({ userId }) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all badges
  const { 
    data: badges, 
    isLoading: isLoadingBadges 
  } = useQuery<Badge[]>({
    queryKey: ["/api/badges"],
    enabled: true,
  });

  // Fetch user achievements (if userId is provided)
  const { 
    data: achievements, 
    isLoading: isLoadingAchievements 
  } = useQuery<UserAchievement[]>({
    queryKey: ["/api/achievements"],
    enabled: !!userId,
  });

  const isLoading = isLoadingBadges || (userId && isLoadingAchievements);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">טוען הישגים...</span>
      </div>
    );
  }

  if (!badges) {
    return <div>לא נמצאו תגים במערכת.</div>;
  }

  // Get the list of badges the user has achieved
  const achievedBadgeIds = new Set(achievements?.map(a => a.badgeId) || []);

  // Filter badges based on active tab
  const filteredBadges = badges.filter(badge => {
    if (activeTab === "all") return true;
    if (activeTab === "achieved") return achievedBadgeIds.has(badge.id);
    if (activeTab === "unachieved") return !achievedBadgeIds.has(badge.id);
    return badge.category === activeTab;
  });

  return (
    <div className="mt-4">
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
          <TabsTrigger value="all">הכל</TabsTrigger>
          {userId && (
            <>
              <TabsTrigger value="achieved">הושגו</TabsTrigger>
              <TabsTrigger value="unachieved">טרם הושגו</TabsTrigger>
            </>
          )}
          <TabsTrigger value="safety">בטיחות</TabsTrigger>
          <TabsTrigger value="community">קהילה</TabsTrigger>
          <TabsTrigger value="activity">פעילות</TabsTrigger>
          <TabsTrigger value="expertise">מומחיות</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                achieved={achievedBadgeIds.has(badge.id)}
                onClick={() => setSelectedBadge(badge)}
              />
            ))}
            {filteredBadges.length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">אין תגים בקטגוריה זו</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Badge details dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent className="max-w-lg">
          {selectedBadge && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center">{selectedBadge.name}</DialogTitle>
                <DialogDescription className="text-center">
                  פרטים מלאים על התג
                </DialogDescription>
              </DialogHeader>
              
              <div className="w-full max-w-xs mx-auto">
                <BadgeCard
                  badge={selectedBadge}
                  achieved={achievedBadgeIds.has(selectedBadge.id)}
                  showDetails={true}
                />
              </div>
              
              {userId && (
                <div className="text-center mt-4">
                  <p className="text-sm">
                    {achievedBadgeIds.has(selectedBadge.id) 
                      ? "הישג זה הושג! המשך כך!" 
                      : "עדיין לא השגת הישג זה. המשך לשפר את הפעילות שלך באתר כדי להשיג אותו!"}
                  </p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};