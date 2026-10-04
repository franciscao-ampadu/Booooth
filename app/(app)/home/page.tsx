import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Avatar from "@/components/Avatar";
import FriendsPanel from "@/components/home/FriendsPanel";
import PostPhotoCard from "@/components/home/PostPhotoCard";
import { loadFriendships } from "@/lib/friends";
import { getAuthState } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Home · Boothmap",
};

export default async function HomePage() {
  const auth = await getAuthState();
  if (!auth) redirect("/login?next=/home");
  if (!auth.profile) redirect("/onboarding?next=/home");
  const { profile, supabase } = auth;

  const friends = await loadFriendships(supabase, profile.id).catch((err) => {
    console.error("[home] loading friendships failed:", err);
    return null;
  });

  return (
    <main className="mx-auto w-full max-w-lg px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-3 py-2">
        <Avatar url={profile.avatar_url} name={profile.username} ring="me" size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-warm">Hi there,</p>
          <h1 className="truncate font-heading text-2xl leading-tight font-semibold">
            @{profile.username}
          </h1>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="h-11 cursor-pointer rounded-full px-3 text-sm font-medium text-muted-warm hover:text-ink-warm"
          >
            Sign out
          </button>
        </form>
      </header>

      <div className="mt-4 space-y-4">
        <BoothCard />
        <MapCard />
        <PostPhotoCard userId={profile.id} />
        <FriendsPanel myId={profile.id} initialState={friends} />
      </div>
    </main>
  );
}

function BoothCard() {
  return (
    <Link
      href="/enter"
      className="group relative flex h-36 items-end overflow-hidden rounded-2xl border border-line bg-[#F6E2BD] p-5 text-ink-warm no-underline shadow-[0_4px_24px_rgba(31,27,22,0.06)]"
    >
      {/* A little strip peeking out */}
      <div
        aria-hidden
        className="absolute top-4 right-20 flex w-12 rotate-6 flex-col gap-1 border-2 border-ink-warm bg-white p-1 transition-transform group-hover:-translate-y-1"
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-5 border border-ink-warm bg-[#E9B872]" />
        ))}
      </div>
      <div className="relative">
        <h2 className="font-heading text-2xl font-semibold">Step into the booth</h2>
        <p className="text-sm text-muted-warm">Four shots, one strip, pinned where you are.</p>
      </div>
      <span
        aria-hidden
        className="relative ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-warm text-xl text-cream transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}

function MapCard() {
  return (
    <Link
      href="/map"
      className="group relative flex h-36 items-end overflow-hidden rounded-2xl border border-line bg-[#EAF1FF] p-5 text-ink-warm no-underline shadow-[0_4px_24px_rgba(31,27,22,0.06)]"
    >
      {/* Sketchy streets + pins */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute top-[38%] -left-4 h-6 w-[120%] -rotate-6 bg-white/70" />
        <div className="absolute top-0 left-[58%] h-full w-3 rotate-12 bg-white/70" />
        <span className="absolute top-[18%] left-[64%] h-9 w-9 rounded-full border-4 border-accent bg-[#FFCCD5] shadow-md transition-transform group-hover:-translate-y-1" />
        <span className="absolute top-[46%] left-[80%] h-8 w-8 rounded-full border-4 border-friend bg-[#D1E3FF] shadow-md transition-transform delay-75 group-hover:-translate-y-1" />
        <span className="absolute top-[12%] left-[86%] h-7 w-7 rounded-full border-4 border-friend bg-[#D1E3FF] shadow-md transition-transform delay-150 group-hover:-translate-y-1" />
      </div>
      <div className="relative">
        <h2 className="font-heading text-2xl font-semibold">Open the map</h2>
        <p className="text-sm text-muted-warm">Your strips and your friends&apos;, pinned where they happened.</p>
      </div>
      <span
        aria-hidden
        className="relative ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-warm text-xl text-cream transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}
