import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/safeNext";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Google OAuth and magic links both land here with ?code=… (PKCE flow).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));

  const fail = (message: string) => {
    const url = new URL("/login", origin);
    url.searchParams.set("error", message);
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  };

  const providerError = searchParams.get("error_description") ?? searchParams.get("error");
  if (providerError) return fail(providerError);

  const code = searchParams.get("code");
  const supabase = await getSupabaseServerClient();
  if (!supabase) return fail("Supabase isn't configured yet.");
  if (!code) return fail("That sign-in link is missing its code. Try again.");

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error);
    // The PKCE verifier lives in this browser's cookies, so links opened in
    // another browser/app fail here.
    return fail("That link didn't work. Open it on the same device and browser you requested it from, or request a new one.");
  }

  const { data } = await supabase.auth.getUser();
  const { data: profile } = data.user
    ? await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle()
    : { data: null };

  const destination = profile
    ? next
    : `/onboarding?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(new URL(destination, origin));
}
