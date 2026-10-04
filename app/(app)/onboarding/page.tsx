import type { Metadata } from "next";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/auth/OnboardingForm";
import { safeNext } from "@/lib/safeNext";
import { getAuthState } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Welcome · Boothmap",
};

/** Turn a display name or email into a username suggestion like "malin_o". */
function suggestUsername(source: string): string {
  const base = source
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // å → a
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);
  return base.length >= 3 ? base : "";
}

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const next = safeNext((await searchParams).next);

  const auth = await getAuthState();
  if (!auth) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (auth.profile) redirect(next);

  const meta = auth.user.user_metadata ?? {};
  const name: string = meta.full_name ?? meta.name ?? auth.user.email?.split("@")[0] ?? "";
  const avatarUrl: string | null = meta.avatar_url ?? meta.picture ?? null;

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10">
      <OnboardingForm
        userId={auth.user.id}
        suggestedUsername={suggestUsername(name)}
        providerAvatarUrl={avatarUrl}
        next={next}
      />
    </main>
  );
}
