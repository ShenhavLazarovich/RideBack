import React from "react";
import { useLocation } from "wouter";

interface MobileNavigationProps {
  activeRoute: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeRoute }) => {
  const [, navigate] = useLocation();

  const isActive = (path: string) => {
    return activeRoute === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 right-0 left-0 bg-white shadow-lg border-t border-neutral-light z-40">
      <div className="flex justify-between">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate("/"); }} 
          className={`flex flex-col items-center p-3 flex-1 ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}
        >
          <i className="fas fa-home text-xl"></i>
          <span className="text-xs mt-1">בית</span>
        </a>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate("/register"); }} 
          className={`flex flex-col items-center p-3 flex-1 ${isActive("/register") ? "text-primary" : "text-muted-foreground"}`}
        >
          <i className="fas fa-bicycle text-xl"></i>
          <span className="text-xs mt-1">רישום</span>
        </a>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate("/report"); }} 
          className={`flex flex-col items-center p-3 flex-1 ${isActive("/report") ? "text-primary" : "text-muted-foreground"}`}
        >
          <i className="fas fa-exclamation-triangle text-xl"></i>
          <span className="text-xs mt-1">דיווח</span>
        </a>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate("/search"); }} 
          className={`flex flex-col items-center p-3 flex-1 ${isActive("/search") ? "text-primary" : "text-muted-foreground"}`}
        >
          <i className="fas fa-search text-xl"></i>
          <span className="text-xs mt-1">חיפוש</span>
        </a>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate("/profile"); }} 
          className={`flex flex-col items-center p-3 flex-1 ${isActive("/profile") ? "text-primary" : "text-muted-foreground"}`}
        >
          <i className="fas fa-user text-xl"></i>
          <span className="text-xs mt-1">פרופיל</span>
        </a>
      </div>
    </nav>
  );
};
