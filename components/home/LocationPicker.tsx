"use client";

import "leaflet/dist/leaflet.css";

import type L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { LatLng } from "@/lib/geo";

/**
 * Small map with a fixed pin in the middle: drag the map to put the pin on the
 * spot. Used when the device can't tell us where it is.
 */
export default function LocationPicker({
  initial,
  onChange,
}: {
  initial: LatLng;
  onChange: (pos: LatLng) => void;
}) {
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (!map) return;
    const report = () => {
      const c = map.getCenter();
      onChange({ lat: c.lat, lng: c.lng });
    };
    report();
    map.on("moveend", report);
    return () => {
      map.off("moveend", report);
    };
  }, [map, onChange]);

  return (
    <div className="relative h-56 overflow-hidden rounded-2xl border border-line">
      <MapContainer
        ref={setMap}
        center={[initial.lat, initial.lng]}
        zoom={15}
        className="h-full w-full"
        attributionControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
      </MapContainer>
      {/* Fixed centre pin; its tip marks the chosen spot. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 z-[1000] -translate-x-1/2 -translate-y-full"
      >
        <svg width="32" height="42" viewBox="0 0 32 42">
          <path
            d="M16 41C16 41 30 25.5 30 15.5C30 7.5 23.7 1 16 1C8.3 1 2 7.5 2 15.5C2 25.5 16 41 16 41Z"
            fill="#FF4D6D"
            stroke="#1F1B16"
            strokeWidth="2"
          />
          <circle cx="16" cy="15.5" r="5" fill="#FAF7F2" />
        </svg>
      </div>
    </div>
  );
}
