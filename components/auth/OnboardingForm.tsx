"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Keep in sync with the profiles_username_format check in supabase/schema.sql.
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export default function OnboardingForm({
  userId,
  suggestedUsername,
  providerAvatarUrl,
  next,
}: {
  userId: string;
  suggestedUsername: string;
  providerAvatarUrl: string | null;
  next: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"profile" | "location">("profile");
  const [username, setUsername] = useState(suggestedUsername);
  const [useProviderAvatar, setUseProviderAvatar] = useState(providerAvatarUrl !== null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const valid = USERNAME_PATTERN.test(username);
  const avatarUrl = useProviderAvatar ? providerAvatarUrl : null;

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) {
      setError("Use 3–20 characters: lowercase letters, numbers or _.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({ id: userId, username, avatar_url: avatarUrl });
    setSaving(false);

    if (insertError) {
      console.error("[onboarding] creating profile failed:", insertError);
      setError(
        insertError.code === "23505"
          ? `@${username} is taken. Try another one.`
          : "Couldn't save your profile. Please try again.",
      );
      return;
    }
    setStep("location");
  }

  function finish() {
    router.replace(next);
    router.refresh();
  }

  function enableLocation() {
    if (!("geolocation" in navigator)) return finish();
    setLocating(true);
    // We only need the permission prompt here; the map reads the position itself.
    navigator.geolocation.getCurrentPosition(finish, finish, {
      enableHighAccuracy: true,
      timeout: 8000,
    });
  }

  if (step === "location") {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 text-center shadow-[0_4px_24px_rgba(31,27,22,0.06)]">
        <div
          aria-hidden
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-friend/15"
        >
          <span className="h-5 w-5 rounded-full border-[3px] border-white bg-friend shadow" />
        </div>
        <h1 className="font-heading text-2xl font-semibold">Pin strips where you take them</h1>
        <p className="mt-3 text-base text-muted-warm">
          Boothmap uses your location to centre the map on you and to pin each strip at the spot
          it was taken. Only you and your friends see your pins, and we only check your location
          while the app is open.
        </p>
        <button
          type="button"
          onClick={enableLocation}
          disabled={locating}
          className="mt-6 flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-accent font-medium text-ink-warm hover:brightness-95 disabled:opacity-60"
        >
          {locating ? "Waiting for your browser…" : "Turn on location"}
        </button>
        <button
          type="button"
          onClick={finish}
          className="mt-2 h-11 w-full cursor-pointer text-sm font-medium text-muted-warm hover:text-ink-warm"
        >
          Not now
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={saveProfile}
      className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-[0_4px_24px_rgba(31,27,22,0.06)]"
    >
      <h1 className="font-heading text-2xl font-semibold">Pick your username</h1>
      <p className="mt-1 text-sm text-muted-warm">This is how friends find you.</p>

      <div className="mt-6 flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="Your avatar"
            referrerPolicy="no-referrer"
            className="h-16 w-16 shrink-0 rounded-full border-4 border-accent object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-accent bg-cream font-heading text-2xl font-semibold uppercase"
          >
            {username.charAt(0) || "?"}
          </span>
        )}
        {providerAvatarUrl && (
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useProviderAvatar}
              onChange={(e) => setUseProviderAvatar(e.target.checked)}
              className="h-5 w-5 accent-[#FF4D6D]"
            />
            Use my Google photo
          </label>
        )}
      </div>

      <label htmlFor="username" className="mt-6 block text-sm font-medium">
        Username
      </label>
      <div className="mt-2 flex h-12 items-center rounded-xl border border-line bg-cream px-4 focus-within:border-ink-warm">
        <span className="text-muted-warm" aria-hidden>
          @
        </span>
        <input
          id="username"
          required
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={20}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
            setError(null);
          }}
          aria-describedby="username-hint"
          aria-invalid={error !== null}
          className="h-full w-full bg-transparent pl-1 text-base text-ink-warm outline-none"
        />
      </div>
      <p id="username-hint" className="mt-2 text-xs text-muted-warm">
        3–20 characters: lowercase letters, numbers and _
      </p>

      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !valid}
        className="mt-6 flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-accent font-medium text-ink-warm hover:brightness-95 disabled:cursor-default disabled:opacity-50"
      >
        {saving ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
