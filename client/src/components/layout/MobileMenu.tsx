import React from "react";
import { useLocation } from "wouter";
import { NavigationItem } from "@/components/ui/navigation-item";
import { useAuth } from "@/hooks/use-auth";

interface MobileMenuProps {
  isOpen: boolean;
  activeRoute: string;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, activeRoute, onClose }) => {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  // Get user initials if available
  const userInitials = user ? 
    (user.username.substring(0, 2) || "ממ") : "ממ";

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" 
      onClick={onClose}
    >
      <div 
        className="bg-white h-full w-3/4 max-w-xs p-6 shadow-lg" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">תפריט</h2>
          <button onClick={onClose}>
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
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
          <ul className="space-y-3">
            <li onClick={() => handleNavigation("/")}>
              <NavigationItem 
                href="/"
                icon="fa-home"
                label="דף הבית"
                isActive={activeRoute === "/"}
              />
            </li>
            <li onClick={() => handleNavigation("/register")}>
              <NavigationItem 
                href="/register"
                icon="fa-bicycle"
                label="רישום אופניים"
                isActive={activeRoute === "/register"}
              />
            </li>
            <li onClick={() => handleNavigation("/report")}>
              <NavigationItem 
                href="/report"
                icon="fa-exclamation-triangle"
                label="דיווח על גניבה"
                isActive={activeRoute === "/report"}
              />
            </li>
            <li onClick={() => handleNavigation("/search")}>
              <NavigationItem 
                href="/search"
                icon="fa-search"
                label="חיפוש אופניים"
                isActive={activeRoute === "/search"}
              />
            </li>
            <li onClick={() => handleNavigation("/profile")}>
              <NavigationItem 
                href="/profile"
                icon="fa-user"
                label="פרופיל"
                isActive={activeRoute === "/profile"}
              />
            </li>
            <li onClick={() => handleNavigation("/achievements")}>
              <NavigationItem 
                href="/achievements"
                icon="fa-trophy"
                label="הישגים"
                isActive={activeRoute === "/achievements"}
              />
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 right-0 left-0 p-6 border-t border-neutral-light">
          <button 
            onClick={handleLogout} 
            className="flex items-center text-muted-foreground w-full"
          >
            <i className="fas fa-sign-out-alt ml-3 flip-horizontal"></i>
            <span>התנתקות</span>
          </button>
        </div>
      </div>
    </div>
  );
};
