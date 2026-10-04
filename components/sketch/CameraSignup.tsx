"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import CameraShell, { playShutter, SHUTTER_ANIMATION_MS } from "./CameraShell";
import { callbackUrl } from "./CameraLogin";

// Keep in sync with the profiles_username_format check in supabase/schema.sql.
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

type Status =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "shooting" }
  | { kind: "confirm"; email: string }
  | { kind: "error"; message: string };

const FORM_ID = "signupForm";

export default function CameraSignup({ next, configured }: { next: string; configured: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const busy = status.kind === "busy" || status.kind === "shooting";

  async function signUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || busy) return;
    if (!USERNAME_PATTERN.test(username)) {
      setStatus({ kind: "error", message: "username: 3–20 lowercase letters, numbers or _" });
      return;
    }

    setStatus({ kind: "busy" });
    const address = email.trim();
    const { data, error } = await supabase.auth.signUp({
      email: address,
      password,
      options: {
        // The onboarding page suggests this name if we can't save the profile now.
        data: { username, full_name: username, display_name: username },
        emailRedirectTo: callbackUrl(next),
      },
    });
    if (error) {
      console.error("[signup] sign-up failed:", error);
      setStatus({ kind: "error", message: error.message });
      return;
    }

    // Email confirmation is on in Supabase: no session until they click the link.
    if (!data.session || !data.user) {
      setStatus({ kind: "confirm", email: address });
      return;
    }

    // Signed in straight away: save the profile so they skip onboarding.
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: data.user.id, username });
    const destination = profileError
      ? `/onboarding?next=${encodeURIComponent(next)}` // e.g. username taken: pick another there
      : next;
    if (profileError) console.warn("[signup] creating profile failed:", profileError);

    playShutter();
    setStatus({ kind: "shooting" });
    setTimeout(() => {
      router.replace(destination);
      router.refresh();
    }, SHUTTER_ANIMATION_MS);
  }

  return (
    <main className="bm-camera-page">
      <CameraShell
        formId={FORM_ID}
        shutterLabel="press to sign up"
        shutterAriaLabel="Take the photo and create your account"
        shutterDisabled={!configured || busy || status.kind === "confirm"}
        shooting={status.kind === "shooting"}
      >
        {!configured ? (
          <div className="lcd-message">
            <p>Sign-up isn&apos;t set up here yet (missing Supabase keys in .env.local).</p>
          </div>
        ) : status.kind === "confirm" ? (
          <div className="lcd-message" role="status">
            <p>
              almost there! confirm your email: we sent a link to <strong>{status.email}</strong>
            </p>
            <p>open it on this device, in this browser.</p>
          </div>
        ) : (
          <form id={FORM_ID} className="login-form signup-form" onSubmit={signUp}>
            <div className="tagline">join the booth!</div>

            <label>
              username
              <input
                type="text"
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                maxLength={20}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              />
            </label>

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
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <p className="form-error" role="alert">
              {status.kind === "error" ? status.message : ""}
            </p>
          </form>
        )}
      </CameraShell>

      <Link href={`/login?next=${encodeURIComponent(next)}`} className="create-account-button">
        Already have an account? Log in
      </Link>

      <div className={`bm-flash${status.kind === "shooting" ? " flash-in" : ""}`} aria-hidden />
    </main>
  );
}
