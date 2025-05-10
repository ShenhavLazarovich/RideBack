import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { apiRequest } from "@/lib/queryClient";

// Initialize Mapbox with your token
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
if (!mapboxToken) {
  console.error("Mapbox token is missing! Please check your .env file");
}
mapboxgl.accessToken = mapboxToken;

console.log("Mapbox token:", import.meta.env.VITE_MAPBOX_TOKEN);

// Add marker styles
const markerStyles = `
  .theft-marker {
    background: white;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    cursor: pointer;
  }
  .marker-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .marker-info {
    font-size: 12px;
    line-height: 1.2;
  }
  .popup-content {
    padding: 8px;
  }
  .popup-content img {
    max-width: 200px;
    height: auto;
    margin-bottom: 8px;
  }
  .theft-status {
    color: #ef4444;
    font-weight: bold;
  }
  .found-status {
    color: #22c55e;
    font-weight: bold;
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = markerStyles;
document.head.appendChild(styleSheet);

interface TheftReport {
  id: number;
  theftDate: string;
  theftLocation: string;
  latitude: string;
  longitude: string;
  status: string;
  bike: {
    id: number;
    brand: string;
    model: string;
    color: string;
    imageUrl: string | null;
  };
}

export function TheftMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapInitialized, setMapInitialized] = useState(false);

  const { data: reports = [], isLoading } = useQuery<TheftReport[], Error>({
    queryKey: ["/api/reports/map"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/reports/map");
      const data = await response.json();
      // Filter only active theft cases
      return data.filter((report: TheftReport) => report.status === "stolen");
    }
  });

  // Initialize map
  useEffect(() => {
    const initializeMap = () => {
      console.log("Attempting to initialize map...");
      console.log("Map container ref:", mapContainer.current);
      console.log("Mapbox token:", mapboxToken);
      
      if (!mapContainer.current) {
        console.error("Map container not ready yet");
        return false;
      }

      if (!mapboxToken) {
        console.error("Cannot initialize map: Mapbox token is missing");
        return false;
      }

      try {
        // Initialize map
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [34.7818, 32.0853], // Tel Aviv coordinates
          zoom: 11,
          attributionControl: true
        });

        map.current.on('load', () => {
          console.log('Map loaded successfully');
          setMapInitialized(true);
        });

        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl());

        console.log("Map initialized successfully");
        return true;
      } catch (error) {
        console.error("Error initializing map:", error);
        return false;
      }
    };

    // Try to initialize immediately
    if (!initializeMap()) {
      // If initialization fails, try again after a short delay
      const timer = setTimeout(() => {
        if (initializeMap()) {
          clearTimeout(timer);
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add markers when reports are loaded and map is initialized
  useEffect(() => {
    if (!map.current || !mapInitialized || !Array.isArray(reports) || reports.length === 0) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each report
    reports.forEach((report: TheftReport) => {
      if (!report.latitude || !report.longitude || 
          isNaN(parseFloat(report.latitude)) || 
          isNaN(parseFloat(report.longitude))) return;

      const el = document.createElement("div");
      el.className = "theft-marker";
      el.innerHTML = `
        <div class="marker-content">
          <i class="fas fa-bicycle text-destructive"></i>
          <div class="marker-info">
            <div>${report.bike.brand} ${report.bike.model}</div>
            <div>${report.theftLocation}</div>
            <div class="theft-status">נגנב</div>
          </div>
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([parseFloat(report.longitude), parseFloat(report.latitude)])
        .addTo(map.current!);

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="popup-content">
          ${report.bike.imageUrl ? `<img src="${report.bike.imageUrl}" alt="${report.bike.brand} ${report.bike.model}">` : ''}
          <h3>${report.bike.brand} ${report.bike.model}</h3>
          <p>צבע: ${report.bike.color}</p>
          <p>מיקום: ${report.theftLocation}</p>
          <p>תאריך: ${new Date(report.theftDate).toLocaleDateString('he-IL')}</p>
          <p class="theft-status">סטטוס: נגנב</p>
        </div>
      `);

      marker.setPopup(popup);
      markers.current.push(marker);
    });

    // If we have markers, fit the map bounds to show all of them
    if (markers.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.current.forEach(marker => {
        bounds.extend(marker.getLngLat());
      });
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [reports, mapInitialized]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
        <p className="mt-2 text-muted-foreground">טוען מפה...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div 
        ref={mapContainer} 
        className="w-full h-[400px] rounded-lg" 
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}
