import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/**
 * Supabase client for Server Components and Route Handlers, backed by the
 * request cookies. Create one per request. Returns null without env vars.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  const env = getSupabaseEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components can't set cookies; proxy.ts refreshes the session instead.
        }
      },
    },
  });
}

export type Profile = { id: string; username: string; avatar_url: string | null };

/** The signed-in user and their profile row (null until onboarding is done). */
export async function getAuthState(): Promise<{
  supabase: SupabaseClient;
  user: User;
  profile: Profile | null;
} | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  // getUser() verifies the session with Supabase Auth instead of trusting the cookie.
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profileError) console.error("[auth] loading profile failed:", profileError);

  return { supabase, user: data.user, profile: profile ?? null };
}
