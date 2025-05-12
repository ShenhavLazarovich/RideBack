"use client"

import { useEffect, useRef } from "react"

export function MapComponent() {
  const mapRef = useRef(null)

  useEffect(() => {
    // This is a placeholder for a real map implementation
    // In a real app, you would use a library like Mapbox, Google Maps, or Leaflet
    const canvas = mapRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height

    // Draw a simple map background
    ctx.fillStyle = "#e5e7eb"
    ctx.fillRect(0, 0, width, height)

    // Draw some roads
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 4

    // Horizontal roads
    for (let i = 1; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(0, height * (i / 5))
      ctx.lineTo(width, height * (i / 5))
      ctx.stroke()
    }

    // Vertical roads
    for (let i = 1; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(width * (i / 5), 0)
      ctx.lineTo(width * (i / 5), height)
      ctx.stroke()
    }

    // Draw some theft markers
    const markers = [
      { x: width * 0.2, y: height * 0.3, color: "#ef4444" },
      { x: width * 0.5, y: height * 0.7, color: "#ef4444" },
      { x: width * 0.8, y: height * 0.4, color: "#ef4444" },
      { x: width * 0.3, y: height * 0.6, color: "#8b5cf6" },
      { x: width * 0.7, y: height * 0.2, color: "#8b5cf6" },
    ]

    markers.forEach((marker) => {
      // Draw marker pin
      ctx.fillStyle = marker.color
      ctx.beginPath()
      ctx.arc(marker.x, marker.y, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(marker.x, marker.y)
      ctx.lineTo(marker.x, marker.y + 15)
      ctx.lineWidth = 2
      ctx.strokeStyle = marker.color
      ctx.stroke()

      // Draw marker shadow
      ctx.beginPath()
      ctx.ellipse(marker.x, marker.y + 15, 8, 3, 0, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      ctx.fill()
    })

    // Draw a "current location" marker
    ctx.fillStyle = "#3b82f6"
    ctx.beginPath()
    ctx.arc(width * 0.5, height * 0.5, 10, 0, Math.PI * 2)
    ctx.fill()

    // Draw a pulse effect
    ctx.beginPath()
    ctx.arc(width * 0.5, height * 0.5, 20, 0, Math.PI * 2)
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(width * 0.5, height * 0.5, 30, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(59, 130, 246, 0.5)"
    ctx.lineWidth = 2
    ctx.stroke()
  }, [])

  return (
    <div className="relative h-full w-full bg-gray-100">
      <canvas ref={mapRef} width={800} height={600} className="h-full w-full" />
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button className="rounded-full bg-white p-2 shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button className="rounded-full bg-white p-2 shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M5 12h14" />
          </svg>
        </button>
        <button className="rounded-full bg-white p-2 shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </button>
      </div>
    </div>
  )
}
