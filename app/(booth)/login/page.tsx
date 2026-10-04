import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CameraLogin from "@/components/sketch/CameraLogin";
import { safeNext } from "@/lib/safeNext";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getAuthState } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Log in · Boothmap",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const error = typeof params.error === "string" ? params.error : null;

  const auth = await getAuthState();
  if (auth) {
    redirect(auth.profile ? next : `/onboarding?next=${encodeURIComponent(next)}`);
  }

  return <CameraLogin next={next} initialError={error} configured={getSupabaseEnv() !== null} />;
}
