"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at import time, so the map is client-only.
// (`ssr: false` is only allowed inside a Client Component.)
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      className="flex h-full w-full items-center justify-center bg-cream text-muted-warm"
    >
      <span className="animate-pulse font-heading text-lg">Loading map…</span>
    </div>
  ),
});

export default function MapPage() {
  return (
    // Full screen minus the bottom nav (set --bottom-nav-h once the nav exists).
    <main className="h-[calc(100dvh-var(--bottom-nav-h,0px))] w-full overflow-hidden">
      <MapView />
    </main>
  );
}
