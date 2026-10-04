"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import CameraShell, { playShutter, SHUTTER_ANIMATION_MS } from "./CameraShell";

type Status =
  | { kind: "idle" }
  | { kind: "busy"; action: "password" | "google" | "link" }
  | { kind: "shooting" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

const FORM_ID = "loginForm";

/** Where to go once signed in: onboarding first if the user has no profile yet. */
export async function destinationAfterSignIn(
  supabase: SupabaseClient,
  userId: string,
  next: string,
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  return profile ? next : `/onboarding?next=${encodeURIComponent(next)}`;
}

export function callbackUrl(next: string) {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", next);
  return url.toString();
}

export default function CameraLogin({
  next,
  initialError,
  configured,
}: {
  next: string;
  initialError: string | null;
  configured: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>(
    initialError ? { kind: "error", message: initialError } : { kind: "idle" },
  );
  const busy = status.kind === "busy" || status.kind === "shooting";

  async function logIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || busy) return;

    setStatus({ kind: "busy", action: "password" });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      console.error("[login] password sign-in failed:", error);
      setStatus({ kind: "error", message: error.message });
      return;
    }

    const destination = await destinationAfterSignIn(supabase, data.user.id, next);
    playShutter();
    setStatus({ kind: "shooting" });
    setTimeout(() => {
      router.replace(destination);
      router.refresh();
    }, SHUTTER_ANIMATION_MS);
  }

  async function signInWithGoogle() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || busy) return;
    setStatus({ kind: "busy", action: "google" });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl(next) },
    });
    // On success the browser is already on its way to Google.
    if (error) {
      console.error("[login] Google sign-in failed:", error);
      setStatus({ kind: "error", message: error.message });
    }
  }

  async function sendMagicLink() {
    const supabase = getSupabaseBrowserClient();
    const address = email.trim();
    if (!supabase || busy) return;
    if (!address) {
      setStatus({ kind: "error", message: "Type your email first, then tap the link option." });
      return;
    }
    setStatus({ kind: "busy", action: "link" });
    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: callbackUrl(next) },
    });
    if (error) {
      console.error("[login] magic link failed:", error);
      setStatus({ kind: "error", message: error.message });
    } else {
      setStatus({ kind: "sent", email: address });
    }
  }

  return (
    <main className="bm-camera-page">
      <CameraShell
        formId={FORM_ID}
        shutterLabel="press to log in"
        shutterAriaLabel="Take the photo and log in"
        shutterDisabled={!configured || busy || status.kind === "sent"}
        shooting={status.kind === "shooting"}
      >
        {!configured ? (
          <div className="lcd-message">
            <p>Sign-in isn&apos;t set up here yet (missing Supabase keys in .env.local).</p>
            <Link href="/map">peek at the demo map →</Link>
          </div>
        ) : status.kind === "sent" ? (
          <div className="lcd-message" role="status">
            <p>
              check your inbox! we sent a sign-in link to <strong>{status.email}</strong>
            </p>
            <p>open it on this device, in this browser.</p>
            <button type="button" className="text-button" onClick={() => setStatus({ kind: "idle" })}>
              use a different email
            </button>
          </div>
        ) : (
          <form id={FORM_ID} className="login-form" onSubmit={logIn}>
            <div className="tagline">say cheese!</div>

            <label>
              email
              <input
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label>
              password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <p className="form-error" role="alert">
              {status.kind === "error" ? status.message : ""}
            </p>

            <div className="google-login-wrap">
              <span className="login-divider">or</span>
              <button type="button" className="google-login" onClick={signInWithGoogle} disabled={busy}>
                {status.kind === "busy" && status.action === "google"
                  ? "opening Google…"
                  : "sign in with Google"}
              </button>
              <button type="button" className="text-button" onClick={sendMagicLink} disabled={busy}>
                {status.kind === "busy" && status.action === "link"
                  ? "sending…"
                  : "no password? email me a link"}
              </button>
            </div>
          </form>
        )}
      </CameraShell>

      <Link href={`/signup?next=${encodeURIComponent(next)}`} className="create-account-button">
        Create Account
      </Link>

      <div className={`bm-flash${status.kind === "shooting" ? " flash-in" : ""}`} aria-hidden />
    </main>
  );
}
