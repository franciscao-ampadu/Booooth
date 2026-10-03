"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, ZoomControl } from "react-leaflet";
import {
  fetchPhotoById,
  fetchPhotosInBounds,
  type DemoReason,
  type MapPhoto,
} from "@/lib/photos";
import { getPosition, LINDHOLMEN, locationErrorMessage } from "@/lib/geo";
import FilterChips, { type PhotoFilter } from "./FilterChips";
import PhotoSheet from "./PhotoSheet";

const DEFAULT_ZOOM = 14;
const USER_ZOOM = 15;
const PHOTO_ZOOM = 16;
const REFETCH_DEBOUNCE_MS = 300;

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

type IconState = { active: boolean; isNew: boolean };

// react-leaflet calls setIcon (rebuilding the marker DOM) whenever the icon
// object changes, so hand back the same object while its inputs are the same.
const iconCache = new Map<string, L.DivIcon>();

function photoIconCached(photo: MapPhoto, state: IconState) {
  const key = [photo.id, photo.imageUrl, photo.isMine, state.active, state.isNew].join("|");
  let icon = iconCache.get(key);
  if (!icon) {
    icon = photoIcon(photo, state);
    iconCache.set(key, icon);
  }
  return icon;
}

function photoIcon(photo: MapPhoto, { active, isNew }: IconState) {
  const classes = ["bm-pin"];
  if (photo.isMine) classes.push("bm-pin--mine");
  if (active) classes.push("bm-pin--active");
  if (isNew) classes.push("bm-pin--new");
  const img = photo.imageUrl ? `<img src="${escapeAttr(photo.imageUrl)}" alt="" draggable="false">` : "";
  return L.divIcon({
    className: "bm-marker",
    html: `<div class="${classes.join(" ")}">${img}</div>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
}

const youIcon = L.divIcon({
  className: "bm-marker",
  html: '<div class="bm-you"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function MapView() {
  const [map, setMap] = useState<L.Map | null>(null);
  const [photos, setPhotos] = useState<MapPhoto[]>([]);
  const [demoReason, setDemoReason] = useState<DemoReason | null>(null);
  const [filter, setFilter] = useState<PhotoFilter>("all");
  const [selected, setSelected] = useState<MapPhoto | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locationOff, setLocationOff] = useState(false);
  // ?new=<photoId> after posting a strip: fly to it and open its sheet.
  const [newPhotoId] = useState(() => new URLSearchParams(window.location.search).get("new"));

  const [dropPending, setDropPending] = useState(newPhotoId !== null);

  const requestSeq = useRef(0);

  const loadPhotos = useCallback(async (m: L.Map) => {
    const b = m.getBounds();
    const seq = ++requestSeq.current;
    const result = await fetchPhotosInBounds({
      south: b.getSouth(),
      west: b.getWest(),
      north: b.getNorth(),
      east: b.getEast(),
    });
    if (seq !== requestSeq.current) return; // a newer pan already won
    setPhotos(result.photos);
    setDemoReason(result.demo ? result.reason : null);
  }, []);

  // Load on mount, then again whenever the map stops moving.
  useEffect(() => {
    if (!map) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onMoveEnd = () => {
      clearTimeout(timer);
      timer = setTimeout(() => loadPhotos(map), REFETCH_DEBOUNCE_MS);
    };
    const onMapClick = () => setSelected(null);

    void loadPhotos(map);
    map.on("moveend", onMoveEnd);
    map.on("click", onMapClick);
    return () => {
      clearTimeout(timer);
      map.off("moveend", onMoveEnd);
      map.off("click", onMapClick);
    };
  }, [map, loadPhotos]);

  // Centre on the user (unless we're deep-linking to a photo).
  useEffect(() => {
    if (!map) return;
    let cancelled = false;
    getPosition().then(
      ({ lat, lng }) => {
        if (cancelled) return;
        setUserPos([lat, lng]);
        setLocationOff(false);
        if (!newPhotoId) map.setView([lat, lng], USER_ZOOM);
      },
      (err) => {
        if (cancelled) return;
        console.info("[map] location unavailable, using Lindholmen:", locationErrorMessage(err), err);
        setLocationOff(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [map, newPhotoId]);

  useEffect(() => {
    if (!map || !newPhotoId) return;
    let cancelled = false;
    fetchPhotoById(newPhotoId).then((photo) => {
      if (cancelled) return;
      if (!photo) {
        console.warn("[map] ?new photo not found:", newPhotoId);
        setDropPending(false);
        return;
      }
      setSelected(photo);
      map.flyTo([photo.lat, photo.lng], PHOTO_ZOOM, { duration: 1.2 });
      // Let the drop animation play once, then switch to the plain icon.
      setTimeout(() => !cancelled && setDropPending(false), 1500);
      // Drop the param so a refresh doesn't replay the animation.
      const url = new URL(window.location.href);
      url.searchParams.delete("new");
      window.history.replaceState(window.history.state, "", url);
    });
    return () => {
      cancelled = true;
    };
  }, [map, newPhotoId]);

  const visiblePhotos = useMemo(() => {
    // Keep a deep-linked photo on the map even before the bounds refetch lands.
    const list =
      selected && !photos.some((p) => p.id === selected.id) ? [selected, ...photos] : photos;
    if (filter === "me") return list.filter((p) => p.isMine);
    if (filter === "friends") return list.filter((p) => !p.isMine);
    return list;
  }, [photos, selected, filter]);

  const closeSheet = useCallback(() => setSelected(null), []);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={setMap}
        center={[LINDHOLMEN.lat, LINDHOLMEN.lng]}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <ZoomControl position="bottomleft" />

        {userPos && (
          <Marker
            position={userPos}
            icon={youIcon}
            interactive={false}
            keyboard={false}
            zIndexOffset={-1000}
          />
        )}

        {visiblePhotos.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={photoIconCached(p, {
              active: selected?.id === p.id,
              isNew: dropPending && p.id === newPhotoId,
            })}
            title={`${p.isMine ? "Your" : `${p.username}'s`} strip${p.placeName ? ` at ${p.placeName}` : ""}`}
            alt={`${p.username} photo`}
            zIndexOffset={selected?.id === p.id ? 1000 : 0}
            eventHandlers={{ click: () => setSelected(p) }}
          />
        ))}
      </MapContainer>

      <Link
        href="/home"
        aria-label="Home"
        className="absolute top-[calc(0.5rem+env(safe-area-inset-top))] left-3 z-[1001] flex h-11 w-11 items-center justify-center rounded-full bg-cream/90 text-ink-warm shadow-[0_2px_12px_rgba(31,27,22,0.15)] backdrop-blur hover:bg-cream"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      {/* Floating top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex flex-col items-center gap-1.5 px-3 pt-[calc(0.5rem+env(safe-area-inset-top))]">
        <div className="pointer-events-auto rounded-full bg-cream/90 px-1.5 shadow-[0_2px_12px_rgba(31,27,22,0.15)] backdrop-blur">
          <FilterChips value={filter} onChange={setFilter} />
        </div>
        {(demoReason || locationOff) && (
          <div role="status" className="flex flex-wrap items-center justify-center gap-1.5">
            {demoReason && <Badge>Demo data</Badge>}
            {locationOff && <Badge>Location off</Badge>}
            {demoReason === "logged-out" && (
              // 44px tap target around the small pill.
              <Link
                href="/login?next=/map"
                className="pointer-events-auto flex h-11 items-center no-underline"
              >
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-ink-warm shadow-sm">
                  Sign in
                </span>
              </Link>
            )}
          </div>
        )}
      </div>

      <PhotoSheet photo={selected} onClose={closeSheet} />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-cream/95 px-3 py-1 text-xs font-medium text-muted-warm shadow-sm">
      {children}
    </span>
  );
}
