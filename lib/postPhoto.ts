import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_IMAGE_SIDE = 1600;
const JPEG_QUALITY = 0.85;

export class PostPhotoError extends Error {}

/**
 * "Haga, Gothenburg"-style label via OpenStreetMap Nominatim (free, max
 * 1 request/second, so only call this once per post). Null on failure.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.search = new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lng),
      zoom: "16",
      addressdetails: "1",
      "accept-language": "en",
    }).toString();
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { address = {} } = await res.json();
    const local =
      address.neighbourhood ?? address.suburb ?? address.quarter ?? address.city_district ?? address.village;
    const city = address.city ?? address.town ?? address.municipality;
    const parts = [...new Set([local, city].filter(Boolean))];
    return parts.length ? parts.join(", ") : null;
  } catch (err) {
    console.warn("[postPhoto] reverse geocoding failed:", err);
    return null;
  }
}

/**
 * Downscale to at most 1600px and re-encode as JPEG. Keeps uploads small and
 * drops EXIF (including the phone's own GPS tags).
 */
export async function prepareImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new PostPhotoError("Couldn't read that image. Try a JPEG or PNG.");
  }

  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) throw new PostPhotoError("Couldn't process that image.");
  return blob;
}

/** Upload the image to Storage and save the photos row. Returns the new photo id. */
export async function postPhoto(
  supabase: SupabaseClient,
  input: {
    userId: string;
    image: Blob;
    caption: string;
    lat: number;
    lng: number;
    placeName: string | null;
    /** Booth filter/theme, e.g. "vintage" or "autumn". */
    filter?: string | null;
  },
): Promise<string> {
  // Storage RLS only allows uploads into my own "<user_id>/" folder.
  const path = `${input.userId}/${crypto.randomUUID()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(path, input.image, { contentType: "image/jpeg" });
  if (uploadError) {
    console.error("[postPhoto] upload failed:", uploadError);
    throw new PostPhotoError("Uploading the photo failed. Check your connection and try again.");
  }

  const { data, error } = await supabase
    .from("photos")
    .insert({
      user_id: input.userId,
      image_path: path,
      caption: input.caption.trim() || null,
      lat: input.lat,
      lng: input.lng,
      place_name: input.placeName,
      filter: input.filter ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[postPhoto] saving photo row failed:", error);
    // Don't leave an orphaned file behind.
    await supabase.storage.from("photos").remove([path]);
    throw new PostPhotoError("Saving the photo failed. Please try again.");
  }
  return data.id;
}
