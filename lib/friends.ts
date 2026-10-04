import type { SupabaseClient } from "@supabase/supabase-js";

export type PublicProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

export type FriendLink = {
  friendshipId: number;
  profile: PublicProfile;
};

export type FriendsState = {
  friends: FriendLink[];
  /** Requests waiting for me to accept or decline. */
  incoming: FriendLink[];
  /** Requests I sent that haven't been accepted (declined ones look pending, on purpose). */
  outgoing: FriendLink[];
};

// friendships has two FKs to profiles, so each embed names its FK.
const FRIENDSHIP_COLUMNS =
  "id, status, requester_id, addressee_id, " +
  "requester:profiles!friendships_requester_id_fkey(id, username, avatar_url), " +
  "addressee:profiles!friendships_addressee_id_fkey(id, username, avatar_url)";

type FriendshipRow = {
  id: number;
  status: "pending" | "accepted" | "declined";
  requester_id: string;
  addressee_id: string;
  requester: PublicProfile;
  addressee: PublicProfile;
};

const byUsername = (a: FriendLink, b: FriendLink) =>
  a.profile.username.localeCompare(b.profile.username);

/** All of my friendships, split into friends / incoming / outgoing. RLS returns only rows I'm part of. */
export async function loadFriendships(
  supabase: SupabaseClient,
  myId: string,
): Promise<FriendsState> {
  const { data, error } = await supabase
    .from("friendships")
    .select(FRIENDSHIP_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const state: FriendsState = { friends: [], incoming: [], outgoing: [] };
  for (const row of data as unknown as FriendshipRow[]) {
    const iAmRequester = row.requester_id === myId;
    const link = {
      friendshipId: row.id,
      profile: iAmRequester ? row.addressee : row.requester,
    };
    if (row.status === "accepted") state.friends.push(link);
    else if (iAmRequester) state.outgoing.push(link);
    else if (row.status === "pending") state.incoming.push(link);
    // Requests I declined are simply hidden.
  }
  state.friends.sort(byUsername);
  return state;
}

/** Username prefix search, excluding me. */
export async function searchProfiles(
  supabase: SupabaseClient,
  query: string,
  myId: string,
): Promise<PublicProfile[]> {
  // Usernames are [a-z0-9_]; escape "_" since it's a LIKE wildcard.
  const q = query.toLowerCase().replace(/[^a-z0-9_]/g, "").replace(/_/g, "\\_");
  if (!q) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .ilike("username", `${q}%`)
    .neq("id", myId)
    .order("username")
    .limit(10);
  if (error) throw error;
  return data;
}

export async function sendFriendRequest(
  supabase: SupabaseClient,
  myId: string,
  otherId: string,
): Promise<void> {
  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: myId, addressee_id: otherId });
  // 23505 = a request already exists, which is what we wanted anyway.
  if (error && error.code !== "23505") throw error;
}

export async function respondToRequest(
  supabase: SupabaseClient,
  friendshipId: number,
  status: "accepted" | "declined",
): Promise<void> {
  const { data, error } = await supabase
    .from("friendships")
    .update({ status })
    .eq("id", friendshipId)
    .select("id");
  if (error) throw error;
  // RLS blocks updates silently (0 rows), e.g. if this isn't my request to answer.
  if (data.length === 0) throw new Error("Request not found or not yours to answer");
}
