import React from "react";
import { useLocation } from "wouter";
import { NavigationItem } from "@/components/ui/navigation-item";
import { useAuth } from "@/hooks/use-auth";

interface DesktopSidebarProps {
  activeRoute: string;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ activeRoute }) => {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user initials if available
  const userInitials = user ? 
    (user.username.substring(0, 2) || "ממ") : "ממ";

  return (
    <aside className="hidden md:block fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary mb-8">RideBack</h1>
        
        {/* User Profile Summary */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl">
              <span>{userInitials}</span>
            </div>
            <div className="mr-3">
              <p className="font-medium">{user?.username}</p>
              <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav>
          <ul className="space-y-2">
            <NavigationItem 
              href="/"
              icon="fa-home"
              label="דף הבית"
              isActive={activeRoute === "/"}
            />
            <NavigationItem 
              href="/register"
              icon="fa-bicycle"
              label="רישום אופניים"
              isActive={activeRoute === "/register"}
            />
            <NavigationItem 
              href="/report"
              icon="fa-exclamation-triangle"
              label="דיווח על גניבה"
              isActive={activeRoute === "/report"}
            />
            <NavigationItem 
              href="/search"
              icon="fa-search"
              label="חיפוש אופניים"
              isActive={activeRoute === "/search"}
            />
            <NavigationItem 
              href="/profile"
              icon="fa-user"
              label="פרופיל"
              isActive={activeRoute === "/profile"}
            />
          </ul>
        </nav>
      </div>
      
      <div className="absolute bottom-0 right-0 left-0 p-6 border-t border-neutral-light">
        <button 
          onClick={handleLogout} 
          className="flex items-center text-muted-foreground w-full"
        >
          <i className="fas fa-sign-out-alt ml-3 flip-horizontal"></i>
          <span>התנתקות</span>
        </button>
      </div>
    </aside>
  );
};
