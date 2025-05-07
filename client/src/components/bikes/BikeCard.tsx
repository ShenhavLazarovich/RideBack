import React from "react";
import { Bike } from "@shared/schema";
import { Link } from "wouter";

interface BikeCardProps {
  bike: Bike;
}

export const BikeCard: React.FC<BikeCardProps> = ({ bike }) => {
  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "stolen":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-destructive text-white">גנוב</span>;
      case "found":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-success text-white">נמצא</span>;
      default:
        return <span className="px-2 py-1 rounded text-xs font-medium bg-success text-white">רשום</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Bike image */}
        <div className="md:w-1/3 h-48 md:h-auto bg-muted">
          {bike.imageUrl ? (
            <img 
              src={bike.imageUrl} 
              alt={`${bike.brand} ${bike.model} - ${bike.type === "road" ? "אופניי כביש" : "אופני הרים"}`} 
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
            <h4 className="text-lg font-bold">{bike.brand} {bike.model}</h4>
            {getStatusBadge(bike.status)}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
            <div>
              <p className="text-muted-foreground">סוג:</p>
              <p>{bike.type === "road" ? "אופניי כביש" : 
                 bike.type === "mountain" ? "אופני הרים" : 
                 bike.type === "hybrid" ? "אופני היברידיים" : 
                 bike.type === "electric" ? "אופניים חשמליים" : 
                 bike.type === "city" ? "אופני עיר" : "אחר"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">צבע:</p>
              <p>{bike.color}</p>
            </div>
            <div>
              <p className="text-muted-foreground">מספר שלדה:</p>
              <p>{bike.serialNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">שנת ייצור:</p>
              <p>{bike.year}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/bikes/${bike.id}`} className="text-primary text-sm font-medium">
              <i className="fas fa-info-circle ml-1"></i>
              פרטים מלאים
            </Link>
            
            {bike.status === "stolen" ? (
              <Link href={`/report/${bike.id}`} className="text-destructive text-sm font-medium">
                <i className="fas fa-exclamation-triangle ml-1"></i>
                צפה בדיווח
              </Link>
            ) : (
              <>
                <Link href={`/bikes/${bike.id}/edit`} className="text-muted-foreground text-sm font-medium">
                  <i className="fas fa-pen ml-1"></i>
                  ערוך
                </Link>
                <Link href={`/report/new?bikeId=${bike.id}`} className="text-destructive text-sm font-medium">
                  <i className="fas fa-exclamation-triangle ml-1"></i>
                  דווח על גניבה
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
