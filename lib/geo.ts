export type LatLng = { lat: number; lng: number };

export const LINDHOLMEN: LatLng = { lat: 57.7065, lng: 11.9384 };

export type LocationFailure = "insecure" | "unsupported" | "denied" | "unavailable" | "timeout";

export class LocationError extends Error {
  constructor(
    readonly reason: LocationFailure,
    message: string,
  ) {
    super(message);
  }
}

function currentPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, options),
  );
}

const REASON_BY_CODE: Record<number, LocationFailure> = {
  1: "denied",
  2: "unavailable",
  3: "timeout",
};

/**
 * The user's position. Tries GPS-grade accuracy first, then falls back to a
 * coarse fix, which is what laptops (no GPS) usually manage.
 * Throws a LocationError whose `reason` says what went wrong.
 */
export async function getPosition(): Promise<LatLng> {
  if (!window.isSecureContext) {
    throw new LocationError("insecure", "Geolocation needs HTTPS or localhost");
  }
  if (!("geolocation" in navigator)) {
    throw new LocationError("unsupported", "Geolocation API missing");
  }

  try {
    const pos = await currentPosition({ enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch (err) {
    const first = err as GeolocationPositionError;
    if (first.code === first.PERMISSION_DENIED) {
      throw new LocationError("denied", first.message);
    }
    console.warn(`[geo] high-accuracy fix failed (${first.code}: ${first.message}), trying coarse`);
  }

  try {
    const pos = await currentPosition({ enableHighAccuracy: false, timeout: 15_000, maximumAge: 10 * 60_000 });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch (err) {
    const e = err as GeolocationPositionError;
    console.warn(`[geo] coarse fix failed (${e.code}: ${e.message})`);
    throw new LocationError(REASON_BY_CODE[e.code] ?? "unavailable", e.message);
  }
}

/** Human explanation for a failed location lookup. */
export function locationErrorMessage(err: unknown): string {
  const reason = err instanceof LocationError ? err.reason : "unavailable";
  switch (reason) {
    case "insecure":
      return "Location only works over HTTPS. Open the app via its Vercel URL (or localhost on this computer).";
    case "unsupported":
      return "This browser can't share your location.";
    case "denied":
      return "Location is blocked for this site. Allow it in your browser's site settings.";
    case "timeout":
      return "Finding your location took too long.";
    case "unavailable":
      return "Your device couldn't find your location. On a Mac, turn on System Settings → Privacy & Security → Location Services for your browser, and keep Wi-Fi on.";
  }
}
