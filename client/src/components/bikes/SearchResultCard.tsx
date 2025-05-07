import React from "react";
import { BikeSearch } from "@shared/schema";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";

interface SearchResultCardProps {
  result: BikeSearch;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ result }) => {
  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "stolen":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-destructive text-white mb-1">גנוב</span>;
      case "found":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-success text-white mb-1">נמצא</span>;
      default:
        return <span className="px-2 py-1 rounded text-xs font-medium bg-secondary text-white mb-1">רשום</span>;
    }
  };

  // Get bike type in Hebrew
  const getBikeTypeInHebrew = (type: string) => {
    switch (type) {
      case "road":
        return "אופניי כביש";
      case "mountain":
        return "אופני הרים";
      case "hybrid":
        return "אופני היברידיים";
      case "electric":
        return "אופניים חשמליים";
      case "city":
        return "אופני עיר";
      default:
        return "אחר";
    }
  };

  // Mask serial number for privacy
  const getMaskedSerialNumber = (serialNumber: string) => {
    if (serialNumber.length <= 4) return serialNumber;
    
    const prefix = serialNumber.substring(0, 2);
    const suffix = serialNumber.substring(serialNumber.length - 4);
    return `${prefix}***${suffix}`;
  };

  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Bike image */}
        <div className="md:w-1/4 h-48 md:h-auto bg-muted">
          {result.imageUrl ? (
            <img 
              src={result.imageUrl} 
              alt={`${result.brand} ${result.model} - ${getBikeTypeInHebrew(result.type)}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <i className="fas fa-bicycle text-muted-foreground text-5xl"></i>
            </div>
          )}
        </div>
        <div className="p-4 md:p-6 flex-1">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-lg font-bold">{result.brand} {result.model}</h4>
            <div className="flex flex-col items-end">
              {getStatusBadge(result.status)}
              <span className="text-muted-foreground text-xs">{formatDate(new Date(result.reportDate))}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mb-4 text-sm">
            <div>
              <p className="text-muted-foreground">סוג:</p>
              <p>{getBikeTypeInHebrew(result.type)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">צבע:</p>
              <p>{result.color}</p>
            </div>
            <div>
              <p className="text-muted-foreground">יצרן:</p>
              <p>{result.brand}</p>
            </div>
            <div>
              <p className="text-muted-foreground">מיקום:</p>
              <p>{result.location}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-muted-foreground">מספר שלדה (חלקי):</p>
              <p>{getMaskedSerialNumber(result.serialNumber)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/search/${result.id}`} className="text-primary text-sm font-medium">
              <i className="fas fa-info-circle ml-1"></i>
              פרטים מלאים
            </Link>
            <Link href={`/contact/${result.id}`} className="text-secondary text-sm font-medium">
              <i className="fas fa-phone ml-1"></i>
              יצירת קשר
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
