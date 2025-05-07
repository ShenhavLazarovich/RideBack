import React from "react";
import { Link } from "wouter";

interface NavigationItemProps {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  href,
  icon,
  label,
  isActive,
}) => {
  const baseClasses = "flex items-center p-3 rounded-lg";
  const activeClasses = "bg-primary bg-opacity-10 text-primary";
  const inactiveClasses = "hover:bg-neutral-lighter transition-colors text-muted-foreground";

  const className = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;

  return (
    <Link href={href} className={className}>
      <i className={`fas ${icon} ml-3`}></i>
      <span>{label}</span>
    </Link>
  );
};
