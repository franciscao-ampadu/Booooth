import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// POST only, so a prefetch or stray link can't log you out.
export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  // 303 turns the POST into a GET of the landing page.
  return NextResponse.redirect(new URL("/", request.nextUrl.origin), { status: 303 });
}
