"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Status =
  | { kind: "idle" }
  | { kind: "busy"; action: "google" | "email" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

export default function LoginForm({
  next,
  initialError,
  configured,
}: {
  next: string;
  initialError: string | null;
  configured: boolean;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>(
    initialError ? { kind: "error", message: initialError } : { kind: "idle" },
  );
  const busy = status.kind === "busy";

  const callbackUrl = () => {
    const url = new URL("/auth/callback", window.location.origin);
    url.searchParams.set("next", next);
    return url.toString();
  };

  async function signInWithGoogle() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setStatus({ kind: "busy", action: "google" });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    // On success the browser is already navigating to Google.
    if (error) {
      console.error("[login] Google sign-in failed:", error);
      setStatus({ kind: "error", message: error.message });
    }
  }

  async function sendMagicLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    const address = email.trim();
    if (!supabase || !address) return;
    setStatus({ kind: "busy", action: "email" });
    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: callbackUrl() },
    });
    if (error) {
      console.error("[login] magic link failed:", error);
      setStatus({ kind: "error", message: error.message });
    } else {
      setStatus({ kind: "sent", email: address });
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <Link href="/" className="font-heading text-3xl font-bold tracking-tight text-ink-warm no-underline">
          Boothmap
        </Link>
        <p className="mt-2 text-base text-muted-warm">
          A photobooth in your pocket — and a map of every moment with your friends.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_4px_24px_rgba(31,27,22,0.06)]">
        <h1 className="font-heading text-xl font-semibold">Sign in or sign up</h1>

        {!configured ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-warm">
              Sign-in isn&apos;t set up on this deployment yet (missing Supabase keys).
            </p>
            <Link
              href="/map"
              className="flex h-12 items-center justify-center rounded-full bg-accent font-medium text-ink-warm no-underline hover:brightness-95"
            >
              Explore the demo map
            </Link>
          </div>
        ) : status.kind === "sent" ? (
          <div className="mt-4 space-y-4" role="status">
            <p className="text-base">
              Check your inbox — we sent a sign-in link to{" "}
              <strong className="font-semibold break-all">{status.email}</strong>.
            </p>
            <p className="text-sm text-muted-warm">
              Open it on this device, in this browser.
            </p>
            <button
              type="button"
              onClick={() => setStatus({ kind: "idle" })}
              className="h-11 cursor-pointer text-sm font-medium text-friend underline underline-offset-4"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            {status.kind === "error" && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-ink-warm"
              >
                {status.message}
              </p>
            )}

            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={busy}
              className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-line bg-white font-medium text-ink-warm hover:border-ink-warm disabled:cursor-default disabled:opacity-60"
            >
              <GoogleLogo />
              {status.kind === "busy" && status.action === "google"
                ? "Opening Google…"
                : "Continue with Google"}
            </button>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-warm" aria-hidden>
              <span className="h-px flex-1 bg-line" />
              or
              <span className="h-px flex-1 bg-line" />
            </div>

            <form onSubmit={sendMagicLink} className="space-y-3">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border border-line bg-cream px-4 text-base text-ink-warm outline-none placeholder:text-muted-warm/70 focus:border-ink-warm"
              />
              <button
                type="submit"
                disabled={busy}
                className="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-accent font-medium text-ink-warm hover:brightness-95 disabled:cursor-default disabled:opacity-60"
              >
                {status.kind === "busy" && status.action === "email"
                  ? "Sending…"
                  : "Email me a sign-in link"}
              </button>
            </form>
            <p className="mt-3 text-center text-xs text-muted-warm">
              No password needed. New here? This creates your account.
            </p>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-sm">
        <Link href="/map" className="text-muted-warm underline-offset-4 hover:text-ink-warm">
          Just looking? Open the demo map
        </Link>
      </p>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
