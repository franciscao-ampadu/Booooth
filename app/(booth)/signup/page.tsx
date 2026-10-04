import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CameraSignup from "@/components/sketch/CameraSignup";
import { safeNext } from "@/lib/safeNext";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getAuthState } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Create account · Boothmap",
};

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const next = safeNext((await searchParams).next);

  const auth = await getAuthState();
  if (auth) {
    redirect(auth.profile ? next : `/onboarding?next=${encodeURIComponent(next)}`);
  }

  return <CameraSignup next={next} configured={getSupabaseEnv() !== null} />;
}
