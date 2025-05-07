import React from "react";
import { Alert } from "@shared/schema";
import { formatRelativeTime } from "@/lib/utils";

interface AlertCardProps {
  alert: Alert;
  onMarkAsRead: (alertId: number) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onMarkAsRead }) => {
  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to relevant details page
    // This would depend on the alert type
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    onMarkAsRead(alert.id);
  };

  return (
    <div className="bg-white rounded-lg shadow mb-4 p-4">
      <div className="flex items-start">
        <div className="bg-secondary bg-opacity-10 text-secondary rounded-full p-2 ml-3">
          <i className="fas fa-bell"></i>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-medium">{alert.title}</h4>
            <span className="text-muted-foreground text-xs">{formatRelativeTime(new Date(alert.createdAt))}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
          <div className="flex gap-2">
            <a href="#" onClick={handleViewDetails} className="text-primary text-sm font-medium">צפה בפרטים</a>
            <button onClick={handleMarkAsRead} className="text-muted-foreground text-sm font-medium">סמן כנקרא</button>
          </div>
        </div>
      </div>
    </div>
  );
};
