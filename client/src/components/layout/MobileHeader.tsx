import React from "react";
import { useLocation } from "wouter";

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  toggleMobileMenu: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = "RideBack",
  showBackButton = false,
  toggleMobileMenu,
}) => {
  const [, navigate] = useLocation();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <header className="md:hidden bg-white shadow-md fixed top-0 right-0 left-0 z-50">
      <div className="flex items-center justify-between p-4">
        <div>
          {showBackButton && (
            <button onClick={handleBack} className="text-neutral-medium">
              <i className="fas fa-arrow-right text-xl"></i>
            </button>
          )}
        </div>
        <h1 className="text-xl font-bold text-primary">{title}</h1>
        <button onClick={toggleMobileMenu} className="text-neutral-medium">
          <i className="fas fa-bars text-2xl"></i>
        </button>
      </div>
    </header>
  );
};
