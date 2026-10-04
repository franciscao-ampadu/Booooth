"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Avatar from "@/components/Avatar";
import {
  loadFriendships,
  respondToRequest,
  searchProfiles,
  sendFriendRequest,
  type FriendsState,
  type PublicProfile,
} from "@/lib/friends";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const SEARCH_DEBOUNCE_MS = 250;

export default function FriendsPanel({
  myId,
  initialState,
}: {
  myId: string;
  /** Loaded on the server; null if that failed. */
  initialState: FriendsState | null;
}) {
  const ids = useId();
  const [state, setState] = useState<FriendsState | null>(initialState);
  const [loadError, setLoadError] = useState(initialState === null);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<{ query: string; results: PublicProfile[] } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    try {
      setState(await loadFriendships(supabase, myId));
      setLoadError(false);
    } catch (err) {
      console.error("[friends] loading failed:", err);
      setLoadError(true);
    }
  }, [myId]);

  // Refresh when the tab comes back into view (e.g. after a friend accepted on
  // their phone).
  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && reload();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [reload]);

  const trimmed = query.trim();
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!trimmed || !supabase) return;
    const timer = setTimeout(async () => {
      try {
        setSearch({ query: trimmed, results: await searchProfiles(supabase, trimmed, myId) });
      } catch (err) {
        console.error("[friends] search failed:", err);
        setSearch({ query: trimmed, results: [] });
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmed, myId]);

  async function act(profileId: string, action: () => Promise<void>, failMessage: string) {
    setBusyId(profileId);
    setActionError(null);
    try {
      await action();
      await reload();
    } catch (err) {
      console.error("[friends]", failMessage, err);
      setActionError(failMessage);
    } finally {
      setBusyId(null);
    }
  }

  const supabase = getSupabaseBrowserClient();
  const add = (p: PublicProfile) =>
    act(p.id, () => sendFriendRequest(supabase!, myId, p.id), `Couldn't add @${p.username}.`);
  const respond = (friendshipId: number, p: PublicProfile, answer: "accepted" | "declined") =>
    act(
      p.id,
      () => respondToRequest(supabase!, friendshipId, answer),
      `Couldn't ${answer === "accepted" ? "accept" : "decline"} @${p.username}.`,
    );

  const relation = (profileId: string) => {
    if (!state) return null;
    if (state.friends.some((f) => f.profile.id === profileId)) return { kind: "friend" as const };
    if (state.outgoing.some((f) => f.profile.id === profileId)) return { kind: "requested" as const };
    const incoming = state.incoming.find((f) => f.profile.id === profileId);
    if (incoming) return { kind: "incoming" as const, friendshipId: incoming.friendshipId };
    return { kind: "none" as const };
  };

  const results = trimmed && search?.query === trimmed ? search.results : null;
  const searching = Boolean(trimmed) && results === null;

  return (
    <section
      aria-labelledby={`${ids}-title`}
      className="rounded-2xl border border-line bg-white p-5 shadow-[0_4px_24px_rgba(31,27,22,0.06)]"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id={`${ids}-title`} className="font-heading text-xl font-semibold">
          Friends
        </h2>
        {state && (
          <span className="text-sm text-muted-warm">
            {state.friends.length} {state.friends.length === 1 ? "friend" : "friends"}
          </span>
        )}
      </div>

      {/* Incoming requests */}
      {state && state.incoming.length > 0 && (
        <div className="mt-4 rounded-2xl bg-cream p-3">
          <h3 className="flex items-center gap-2 px-1 text-sm font-semibold">
            Requests
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs text-ink-warm">
              {state.incoming.length}
            </span>
          </h3>
          <ul className="mt-2 space-y-1">
            {state.incoming.map(({ friendshipId, profile }) => (
              <PersonRow key={friendshipId} profile={profile}>
                <button
                  type="button"
                  disabled={busyId === profile.id}
                  onClick={() => respond(friendshipId, profile, "accepted")}
                  className="h-11 cursor-pointer rounded-full bg-accent px-4 text-sm font-medium text-ink-warm hover:brightness-95 disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  type="button"
                  disabled={busyId === profile.id}
                  onClick={() => respond(friendshipId, profile, "declined")}
                  aria-label={`Decline @${profile.username}`}
                  className="h-11 cursor-pointer rounded-full px-3 text-sm font-medium text-muted-warm hover:text-ink-warm disabled:opacity-50"
                >
                  Decline
                </button>
              </PersonRow>
            ))}
          </ul>
        </div>
      )}

      {/* Search */}
      <label htmlFor={`${ids}-search`} className="mt-5 block text-sm font-medium">
        Add friends
      </label>
      <div className="mt-2 flex h-12 items-center rounded-xl border border-line bg-cream px-4 focus-within:border-ink-warm">
        <span className="text-muted-warm" aria-hidden>
          @
        </span>
        <input
          id={`${ids}-search`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search by username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="h-full w-full bg-transparent pl-1 text-base text-ink-warm outline-none placeholder:text-muted-warm/70"
        />
      </div>

      {actionError && (
        <p role="alert" className="mt-3 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
          {actionError}
        </p>
      )}

      {trimmed && (
        <div aria-live="polite" className="mt-2">
          {searching ? (
            <p className="px-1 py-3 text-sm text-muted-warm">Searching…</p>
          ) : results && results.length === 0 ? (
            <p className="px-1 py-3 text-sm text-muted-warm">No one called @{trimmed} yet.</p>
          ) : (
            <ul className="space-y-1">
              {results?.map((p) => {
                const rel = relation(p.id);
                return (
                  <PersonRow key={p.id} profile={p}>
                    {rel?.kind === "friend" && <Tag>Friends</Tag>}
                    {rel?.kind === "requested" && <Tag>Requested</Tag>}
                    {rel?.kind === "incoming" && (
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => respond(rel.friendshipId, p, "accepted")}
                        className="h-11 cursor-pointer rounded-full bg-accent px-4 text-sm font-medium text-ink-warm hover:brightness-95 disabled:opacity-50"
                      >
                        Accept
                      </button>
                    )}
                    {rel?.kind === "none" && (
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => add(p)}
                        aria-label={`Add @${p.username}`}
                        className="h-11 cursor-pointer rounded-full border border-ink-warm px-4 text-sm font-medium text-ink-warm hover:bg-ink-warm hover:text-cream disabled:opacity-50"
                      >
                        {busyId === p.id ? "Adding…" : "Add"}
                      </button>
                    )}
                  </PersonRow>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Friend list */}
      <div className="mt-5">
        {loadError ? (
          <p className="text-sm text-muted-warm">
            Couldn&apos;t load your friends.{" "}
            <button type="button" onClick={reload} className="h-11 cursor-pointer font-medium text-friend underline">
              Try again
            </button>
          </p>
        ) : !state ? (
          <p className="text-sm text-muted-warm">Loading friends…</p>
        ) : state.friends.length === 0 && state.outgoing.length === 0 ? (
          <p className="text-sm text-muted-warm">
            No friends yet. Search for your crew&apos;s usernames above. Once they accept,
            their photos show up on your map.
          </p>
        ) : (
          <ul className="space-y-1">
            {state.friends.map(({ friendshipId, profile }) => (
              <PersonRow key={friendshipId} profile={profile} />
            ))}
            {state.outgoing.map(({ friendshipId, profile }) => (
              <PersonRow key={friendshipId} profile={profile}>
                <Tag>Requested</Tag>
              </PersonRow>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function PersonRow({ profile, children }: { profile: PublicProfile; children?: React.ReactNode }) {
  return (
    <li className="flex min-h-14 items-center gap-3 rounded-xl px-1">
      <Avatar url={profile.avatar_url} name={profile.username} size="sm" />
      <span className="min-w-0 flex-1 truncate font-medium">@{profile.username}</span>
      {children}
    </li>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted-warm">
      {children}
    </span>
  );
}
