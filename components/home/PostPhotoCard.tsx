"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react";
import { getPosition, LINDHOLMEN, locationErrorMessage, type LatLng } from "@/lib/geo";
import { postPhoto, PostPhotoError, prepareImage, reverseGeocode } from "@/lib/postPhoto";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Leaflet needs `window`, so the picker is client-only.
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 items-center justify-center rounded-2xl border border-line bg-cream text-sm text-muted-warm">
      Loading map…
    </div>
  ),
});

type Status =
  | { kind: "editing" }
  | { kind: "posting"; step: string }
  | { kind: "posted"; photoId: string; placeName: string | null }
  | { kind: "error"; message: string };

const MAX_CAPTION = 140;

export default function PostPhotoCard({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "editing" });
  // Manual location, for when the device can't find itself (common on laptops).
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<LatLng | null>(null);
  const ids = useId();

  // Free the preview's object URL when it's replaced or we unmount.
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!picked) return;
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
    setStatus({ kind: "editing" });
  }

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setCaption("");
    setPickerOpen(false);
    setPickedLocation(null);
    setStatus({ kind: "editing" });
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!file || !supabase) return;

    try {
      let lat: number;
      let lng: number;
      if (pickerOpen && pickedLocation) {
        ({ lat, lng } = pickedLocation);
      } else {
        setStatus({ kind: "posting", step: "Finding your location…" });
        try {
          ({ lat, lng } = await getPosition());
        } catch (err) {
          // Handled: we show the message and the map picker.
          console.warn("[home] location lookup failed:", err);
          setPickerOpen(true);
          setStatus({
            kind: "error",
            message: `${locationErrorMessage(err)} Or drag the map below to the spot and post again.`,
          });
          return;
        }
      }

      setStatus({ kind: "posting", step: "Preparing photo…" });
      const [image, placeName] = await Promise.all([prepareImage(file), reverseGeocode(lat, lng)]);

      setStatus({ kind: "posting", step: "Uploading…" });
      const photoId = await postPhoto(supabase, { userId, image, caption, lat, lng, placeName });

      setFile(null);
      setPreviewUrl(null);
      setCaption("");
      setPickerOpen(false);
      setPickedLocation(null);
      setStatus({ kind: "posted", photoId, placeName });
    } catch (err) {
      console.error("[home] posting photo failed:", err);
      setStatus({
        kind: "error",
        message: err instanceof PostPhotoError ? err.message : "Something went wrong. Please try again.",
      });
    }
  }

  const posting = status.kind === "posting";

  return (
    <section
      aria-labelledby={`${ids}-title`}
      className="rounded-2xl border border-line bg-white p-5 shadow-[0_4px_24px_rgba(31,27,22,0.06)]"
    >
      <h2 id={`${ids}-title`} className="font-heading text-xl font-semibold">
        Post a photo
      </h2>

      {status.kind === "posted" ? (
        <div role="status" className="mt-4 space-y-4">
          <p className="text-base">
            Posted{status.placeName ? ` near ${status.placeName}` : ""}! Your friends can see it on
            their map now.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/map?new=${status.photoId}`}
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-accent font-medium text-ink-warm no-underline hover:brightness-95"
            >
              See it on the map
            </Link>
            <button
              type="button"
              onClick={reset}
              className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-full border border-line font-medium text-ink-warm hover:border-ink-warm"
            >
              Post another
            </button>
          </div>
        </div>
      ) : !file ? (
        <>
          <p className="mt-1 text-sm text-muted-warm">
            It gets pinned where you are right now.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <FilePickButton id={`${ids}-camera`} capture onChange={pickFile} primary>
              Take a photo
            </FilePickButton>
            <FilePickButton id={`${ids}-library`} onChange={pickFile}>
              Choose photo
            </FilePickButton>
          </div>
          {status.kind === "error" && <ErrorNote>{status.message}</ErrorNote>}
        </>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="flex justify-center rounded-2xl bg-cream p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl ?? ""}
              alt="Selected photo preview"
              className="max-h-72 w-auto max-w-full -rotate-1 border-[6px] border-white object-contain shadow-[0_6px_18px_rgba(31,27,22,0.18)]"
            />
          </div>

          <div>
            <label htmlFor={`${ids}-caption`} className="block text-sm font-medium">
              Caption <span className="font-normal text-muted-warm">(optional)</span>
            </label>
            <input
              id={`${ids}-caption`}
              value={caption}
              maxLength={MAX_CAPTION}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="kanelbulle the size of my head"
              disabled={posting}
              className="mt-2 h-12 w-full rounded-xl border border-line bg-cream px-4 text-base text-ink-warm outline-none placeholder:text-muted-warm/70 focus:border-ink-warm"
            />
          </div>

          {status.kind === "error" && <ErrorNote>{status.message}</ErrorNote>}

          {pickerOpen ? (
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium">Where was it taken?</p>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  disabled={posting}
                  className="h-11 cursor-pointer text-sm font-medium text-friend underline underline-offset-4"
                >
                  Use my location
                </button>
              </div>
              <LocationPicker initial={pickedLocation ?? LINDHOLMEN} onChange={setPickedLocation} />
              <p className="mt-2 text-xs text-muted-warm">Drag the map so the pin is on the spot.</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              disabled={posting}
              className="h-11 cursor-pointer text-sm font-medium text-muted-warm underline underline-offset-4 hover:text-ink-warm"
            >
              Pick the spot on a map instead
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              disabled={posting}
              className="h-12 cursor-pointer rounded-full border border-line px-5 font-medium text-ink-warm hover:border-ink-warm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={posting}
              aria-live="polite"
              className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-full bg-accent font-medium text-ink-warm hover:brightness-95 disabled:cursor-default disabled:opacity-70"
            >
              {status.kind === "posting"
                ? status.step
                : pickerOpen
                  ? "Post & pin it here"
                  : "Post & pin it"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function FilePickButton({
  id,
  capture,
  primary,
  onChange,
  children,
}: {
  id: string;
  capture?: boolean;
  primary?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <input
        id={id}
        type="file"
        accept="image/*"
        // Opens the front camera on phones; ignored on laptops.
        capture={capture ? "user" : undefined}
        onChange={onChange}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={`flex h-12 cursor-pointer items-center justify-center rounded-full px-4 text-center font-medium text-ink-warm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink-warm ${
          primary ? "bg-accent hover:brightness-95" : "border border-line hover:border-ink-warm"
        }`}
      >
        {children}
      </label>
    </>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-3 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
      {children}
    </p>
  );
}
