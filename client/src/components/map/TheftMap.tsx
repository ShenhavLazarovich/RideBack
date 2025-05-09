import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { apiRequest } from "@/lib/queryClient";

// Initialize Mapbox with your token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

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

  const { data: reports = [], isLoading } = useQuery<TheftReport[]>({
    queryKey: ["/api/reports/map"],
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [34.7818, 32.0853], // Tel Aviv coordinates
      zoom: 11
    });

    map.current.on('load', () => {
      // Map is ready
      console.log('Map loaded');
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !reports.length) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each report
    reports.forEach(report => {
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
        </div>
      `);

      marker.setPopup(popup);
      markers.current.push(marker);
    });
  }, [reports]);

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
      <div ref={mapContainer} className="w-full h-[400px] rounded-lg" />
    </div>
  );
}
