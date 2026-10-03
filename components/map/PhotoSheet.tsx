"use client";

import { useEffect, useState } from "react";
import type { MapPhoto } from "@/lib/photos";
import { timeAgo } from "@/lib/timeAgo";

export default function PhotoSheet({
  photo,
  onClose,
}: {
  photo: MapPhoto | null;
  onClose: () => void;
}) {
  // Keep showing the last photo while the sheet slides closed.
  const [shown, setShown] = useState(photo);
  if (photo && photo !== shown) setShown(photo);
  const open = photo !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="photo-sheet-title"
      aria-hidden={!open}
      inert={!open}
      className={`fixed inset-x-0 bottom-0 z-[1100] mx-auto max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(31,27,22,0.18)] transition-transform duration-300 ease-out ${
        open ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto mb-1 h-1.5 w-10 rounded-full bg-line" aria-hidden />

      {shown && (
        <>
          <div className="flex items-center gap-3">
            <Avatar photo={shown} />
            <div className="min-w-0 flex-1">
              <h2
                id="photo-sheet-title"
                className="truncate font-heading text-lg leading-tight font-semibold text-ink-warm"
              >
                {shown.isMine ? "You" : shown.username}
              </h2>
              <p className="truncate text-sm text-muted-warm">
                {[shown.placeName, timeAgo(shown.createdAt)].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close photo"
              className="-mr-2 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-warm hover:bg-cream"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {shown.caption && (
            <p className="mt-3 text-base leading-snug text-ink-warm">{shown.caption}</p>
          )}

          <div className="mt-4 flex justify-center rounded-2xl bg-cream px-4 py-5">
            {shown.imageUrl ? (
              // Signed Supabase URLs and data: URIs, so no next/image here.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shown.imageUrl}
                alt={`Photo strip by ${shown.username}${shown.placeName ? ` at ${shown.placeName}` : ""}`}
                className="max-h-[50dvh] w-auto max-w-full -rotate-2 border-[6px] border-white object-contain shadow-[0_6px_18px_rgba(31,27,22,0.18)]"
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-warm">
                Image unavailable
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function Avatar({ photo }: { photo: MapPhoto }) {
  const ring = photo.isMine ? "border-accent" : "border-friend";
  if (photo.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo.avatarUrl}
        alt=""
        className={`h-11 w-11 shrink-0 rounded-full border-[3px] object-cover ${ring}`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] bg-cream font-heading text-base font-semibold text-ink-warm uppercase ${ring}`}
    >
      {photo.username.charAt(0)}
    </span>
  );
}
