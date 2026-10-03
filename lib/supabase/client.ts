import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

let client: SupabaseClient | null | undefined;

/**
 * Browser Supabase client, shared across the app.
 * Returns null when the env vars aren't set, so callers can fall back to demo
 * data instead of crashing.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  const env = getSupabaseEnv();
  client = env ? createBrowserClient(env.url, env.anonKey) : null;
  return client;
}
