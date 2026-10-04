import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type MapBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export type MapPhoto = {
  id: string;
  userId: string;
  imageUrl: string | null;
  caption: string | null;
  lat: number;
  lng: number;
  placeName: string | null;
  createdAt: string;
  username: string;
  avatarUrl: string | null;
  isMine: boolean;
};

/** Why we fell back to the built-in demo photos. */
export type DemoReason = "not-configured" | "logged-out" | "error" | "empty";

export type PhotosResult =
  | { photos: MapPhoto[]; demo: false }
  | { photos: MapPhoto[]; demo: true; reason: DemoReason };

// The FK is named explicitly: photos and profiles are also linked through
// reactions, which makes a bare profiles(...) embed ambiguous (PGRST201).
const PHOTO_COLUMNS =
  "id, user_id, image_path, caption, lat, lng, place_name, created_at, profile:profiles!photos_user_id_fkey(username, avatar_url)";

const SIGNED_URL_TTL_SECONDS = 3600;

type ProfileRow = { username: string; avatar_url: string | null };

type PhotoRow = {
  id: string;
  user_id: string;
  image_path: string;
  caption: string | null;
  lat: number;
  lng: number;
  place_name: string | null;
  created_at: string;
  // Supabase types an embedded to-one relation as object or array depending
  // on how the FK is detected, so accept both.
  profile: ProfileRow | ProfileRow[] | null;
};

/**
 * Photos inside the map's visible bounds, newest first. RLS limits the rows to
 * my photos and my accepted friends' photos, so no friend filtering here.
 * Falls back to demo photos if Supabase isn't usable or has nothing to show.
 */
export async function fetchPhotosInBounds(bounds: MapBounds): Promise<PhotosResult> {
  const ctx = await getSessionContext();
  if ("reason" in ctx) return demoResult(ctx.reason);

  const { data, error } = await ctx.supabase
    .from("photos")
    .select(PHOTO_COLUMNS)
    .gte("lat", bounds.south)
    .lte("lat", bounds.north)
    .gte("lng", bounds.west)
    .lte("lng", bounds.east)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[photos] query failed, showing demo data:", error);
    return demoResult("error");
  }
  if (!data || data.length === 0) {
    console.info("[photos] no photos in view, showing demo data");
    return demoResult("empty");
  }

  const photos = await toMapPhotos(ctx.supabase, data as unknown as PhotoRow[], ctx.userId);
  return { photos, demo: false };
}

/** A single photo, used for the ?new=<id> deep link after posting. */
export async function fetchPhotoById(id: string): Promise<MapPhoto | null> {
  const demo = DEMO_PHOTOS.find((p) => p.id === id);
  if (demo) return demo;

  const ctx = await getSessionContext();
  if ("reason" in ctx) return null;

  const { data, error } = await ctx.supabase
    .from("photos")
    .select(PHOTO_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[photos] fetching photo", id, "failed:", error);
    return null;
  }
  if (!data) return null;

  const [photo] = await toMapPhotos(ctx.supabase, [data as unknown as PhotoRow], ctx.userId);
  return photo;
}

async function getSessionContext(): Promise<
  { supabase: SupabaseClient; userId: string } | { reason: DemoReason }
> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    console.info(
      "[photos] Supabase not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY), showing demo data",
    );
    return { reason: "not-configured" };
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("[photos] reading session failed, showing demo data:", error);
    return { reason: "error" };
  }
  if (!data.session) {
    console.info("[photos] not logged in, showing demo data");
    return { reason: "logged-out" };
  }
  return { supabase, userId: data.session.user.id };
}

// Signed URLs get a fresh token on every call, so re-signing on each pan would
// make every pin image reload. Reuse them until they're close to expiring.
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();
const SIGNED_URL_REUSE_MS = (SIGNED_URL_TTL_SECONDS - 600) * 1000;

async function signImagePaths(supabase: SupabaseClient, paths: string[]) {
  const now = Date.now();
  const missing = paths.filter((p) => (signedUrlCache.get(p)?.expiresAt ?? 0) <= now);

  if (missing.length > 0) {
    // One batch call for every image that still needs a URL.
    const { data, error } = await supabase.storage
      .from("photos")
      .createSignedUrls(missing, SIGNED_URL_TTL_SECONDS);

    if (error) {
      console.error("[photos] signing image URLs failed:", error);
    } else {
      for (const s of data) {
        if (s.path && s.signedUrl) {
          signedUrlCache.set(s.path, { url: s.signedUrl, expiresAt: now + SIGNED_URL_REUSE_MS });
        } else if (s.error) {
          console.error("[photos] could not sign", s.path, s.error);
        }
      }
    }
  }

  return (path: string) => signedUrlCache.get(path)?.url ?? null;
}

async function toMapPhotos(
  supabase: SupabaseClient,
  rows: PhotoRow[],
  myUserId: string,
): Promise<MapPhoto[]> {
  const urlFor = await signImagePaths(supabase, [...new Set(rows.map((r) => r.image_path))]);

  return rows.map((r) => {
    const profile = Array.isArray(r.profile) ? r.profile[0] : r.profile;
    return {
      id: r.id,
      userId: r.user_id,
      imageUrl: urlFor(r.image_path),
      caption: r.caption,
      lat: r.lat,
      lng: r.lng,
      placeName: r.place_name,
      createdAt: r.created_at,
      username: profile?.username ?? "unknown",
      avatarUrl: profile?.avatar_url ?? null,
      isMine: r.user_id === myUserId,
    };
  });
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

/** A booth strip placeholder: four coloured frames on white paper. */
function demoStrip(colors: [string, string, string, string]): string {
  const frames = colors
    .map((c, i) => `<rect x="20" y="${20 + i * 200}" width="260" height="185" rx="4" fill="${c}"/>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="840" viewBox="0 0 300 840"><rect width="300" height="840" fill="#ffffff"/>${frames}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const HOUR = 3600_000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

export const DEMO_PHOTOS: MapPhoto[] = [
  {
    id: "demo-lindholmen",
    userId: "demo-me",
    imageUrl: demoStrip(["#FF4D6D", "#FF8FA3", "#FFB3C1", "#FFCCD5"]),
    caption: "hackathon hour 3, still optimistic",
    lat: 57.7065,
    lng: 11.9384,
    placeName: "Lindholmen, Gothenburg",
    createdAt: ago(2 * HOUR),
    username: "you",
    avatarUrl: null,
    isMine: true,
  },
  {
    id: "demo-haga",
    userId: "demo-ellie",
    imageUrl: demoStrip(["#3A86FF", "#6FA6FF", "#A3C6FF", "#D1E3FF"]),
    caption: "kanelbulle the size of my head",
    lat: 57.6985,
    lng: 11.9555,
    placeName: "Haga, Gothenburg",
    createdAt: ago(26 * HOUR),
    username: "ellie",
    avatarUrl: null,
    isMine: false,
  },
  {
    id: "demo-liseberg",
    userId: "demo-sam",
    imageUrl: demoStrip(["#FFBE0B", "#FFD166", "#FFE29A", "#FFF1CC"]),
    caption: "screamed on Helix, no regrets",
    lat: 57.6953,
    lng: 11.992,
    placeName: "Liseberg, Gothenburg",
    createdAt: ago(3 * 24 * HOUR),
    username: "sam",
    avatarUrl: null,
    isMine: false,
  },
  {
    id: "demo-slottsskogen",
    userId: "demo-jonas",
    imageUrl: demoStrip(["#2A9D8F", "#52B69A", "#99D98C", "#D9ED92"]),
    caption: "picnic, ft. one brave seagull",
    lat: 57.6862,
    lng: 11.942,
    placeName: "Slottsskogen, Gothenburg",
    createdAt: ago(4 * 24 * HOUR),
    username: "jonas",
    avatarUrl: null,
    isMine: false,
  },
  {
    id: "demo-avenyn",
    userId: "demo-me",
    imageUrl: demoStrip(["#8338EC", "#A06CF0", "#C1A0F5", "#E2D3FA"]),
    caption: "missed the tram, took a strip instead",
    lat: 57.701,
    lng: 11.975,
    placeName: "Avenyn, Gothenburg",
    createdAt: ago(14 * 24 * HOUR),
    username: "you",
    avatarUrl: null,
    isMine: true,
  },
];

function demoResult(reason: DemoReason): PhotosResult {
  return { photos: DEMO_PHOTOS, demo: true, reason };
}
