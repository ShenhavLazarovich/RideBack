import React from "react";

interface QuickStatProps {
  label: string;
  value: number | string;
  color?: "primary" | "success" | "destructive" | "secondary";
}

export const QuickStat: React.FC<QuickStatProps> = ({ 
  label, 
  value, 
  color = "primary" 
}) => {
  const getColorClasses = () => {
    switch (color) {
      case "primary": 
        return {
          text: "text-primary",
          bg: "bg-primary/5"
        };
      case "success": 
        return {
          text: "text-success",
          bg: "bg-success/5"
        };
      case "destructive": 
        return {
          text: "text-destructive",
          bg: "bg-destructive/5"
        };
      case "secondary": 
        return {
          text: "text-secondary",
          bg: "bg-secondary/5"
        };
      default: 
        return {
          text: "text-primary",
          bg: "bg-primary/5"
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`rounded-lg shadow p-4 text-center ${colors.bg}`}>
      <p className="text-muted-foreground text-sm mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
    </div>
  );
};
