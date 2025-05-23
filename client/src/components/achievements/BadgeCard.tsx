import React, { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as BadgeType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

// Define a type for what requirements might look like after parsing
interface ParsedRequirements {
  [key: string]: string | number | boolean | null | undefined | object;
}

interface BadgeCardProps {
  badge: BadgeType;
  achieved?: boolean;
  showDetails?: boolean;
  onClick?: () => void;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ 
  badge, 
  achieved = false,
  showDetails = false,
  onClick 
}) => {
  // Function to render requirements safely
  const renderRequirements = (requirementsObj: unknown): React.ReactNode => {
    if (!requirementsObj || typeof requirementsObj !== 'object') {
      return <li className="text-muted-foreground">אין דרישות מוגדרות</li>;
    }
    
    // Safely convert the requirements object
    const reqObj = JSON.parse(JSON.stringify(requirementsObj));
    
    return Object.entries(reqObj).map(([key, value]) => {
      let displayValue: string;
      
      if (typeof value === 'string') {
        displayValue = value;
      } else if (typeof value === 'number') {
        displayValue = value.toString();
      } else if (value === null) {
        displayValue = 'לא מוגדר';
      } else if (typeof value === 'boolean') {
        displayValue = value ? 'כן' : 'לא';
      } else {
        displayValue = 'מידע מורכב';
      }
      
      return (
        <li key={key} className="text-muted-foreground">
          {key}: {displayValue}
        </li>
      );
    });
  };
  // Get level text and color based on badge level
  const getLevelInfo = (level: number) => {
    switch (level) {
      case 1:
        return { text: "ברונזה", color: "text-amber-600 dark:text-amber-400" };
      case 2:
        return { text: "כסף", color: "text-gray-400 dark:text-gray-300" };
      case 3:
        return { text: "זהב", color: "text-yellow-500 dark:text-yellow-300" };
      default:
        return { text: "רגיל", color: "text-gray-600 dark:text-gray-400" };
    }
  };

  // Get category text and color
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "safety":
        return { text: "בטיחות", color: "bg-blue-500" };
      case "community":
        return { text: "קהילה", color: "bg-green-500" };
      case "activity":
        return { text: "פעילות", color: "bg-purple-500" };
      case "expertise":
        return { text: "מומחיות", color: "bg-orange-500" };
      default:
        return { text: category, color: "bg-gray-500" };
    }
  };

  const levelInfo = getLevelInfo(badge.level);
  const categoryInfo = getCategoryInfo(badge.category);

  return (
    <Card 
      className={`
        overflow-hidden transition-all duration-300
        ${achieved ? "border-2 border-primary" : "opacity-75 grayscale"}
        ${onClick ? "cursor-pointer hover:shadow-md" : ""}
      `}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className={`${categoryInfo.color} text-white`}>
            {categoryInfo.text}
          </Badge>
          <span className={`text-sm font-medium ${levelInfo.color}`}>
            {levelInfo.text}
          </span>
        </div>
        <CardTitle className="text-xl mt-2 text-center">{badge.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex flex-col items-center">
        <div className="w-24 h-24 my-2 mx-auto relative flex items-center justify-center p-1 rounded-full bg-muted">
          <img 
            src={badge.imageUrl} 
            alt={badge.name} 
            className="w-20 h-20 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/badge-placeholder.svg";
            }}
          />
          {achieved && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          )}
        </div>
        
        <CardDescription className="text-sm text-center mt-2">
          {badge.description}
        </CardDescription>
      </CardContent>
      
      {showDetails && (
        <CardFooter className="p-4 pt-0 flex flex-col">
          <div className="w-full text-sm">
            <p className="font-semibold mb-1">דרישות:</p>
            <ul className="list-disc list-inside">
              {badge.requirements && typeof badge.requirements === 'object' && 
                renderRequirements(badge.requirements)
              }
            </ul>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};