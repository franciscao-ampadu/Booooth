import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PhotoBooth from "@/components/sketch/PhotoBooth";
import { getAuthState } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Booth · Boothmap",
};

export default async function BoothPage() {
  // Posting a strip needs an account, so the booth is for signed-in users.
  const auth = await getAuthState();
  if (!auth) redirect("/login?next=/booth");
  if (!auth.profile) redirect("/onboarding?next=/booth");

  return <PhotoBooth userId={auth.profile.id} />;
}
