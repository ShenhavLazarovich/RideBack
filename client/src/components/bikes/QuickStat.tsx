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
  const getTextColorClass = () => {
    switch (color) {
      case "primary": return "text-primary";
      case "success": return "text-success";
      case "destructive": return "text-destructive";
      case "secondary": return "text-secondary";
      default: return "text-primary";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <p className="text-muted-foreground text-sm mb-1">{label}</p>
      <p className={`text-2xl font-bold ${getTextColorClass()}`}>{value}</p>
    </div>
  );
};
