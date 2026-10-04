-- Boothmap schema: tables, Row Level Security, storage bucket.
-- Run once in Supabase → SQL Editor. Safe to re-run.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Same rule as the onboarding form: 3–20 lowercase letters, digits or _.
do $$ begin
  alter table public.profiles
    add constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,20}$');
exception when duplicate_object then null;
end $$;

create table if not exists public.friendships (
  id bigint generated always as identity primary key,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending','accepted','declined')) default 'pending',
  created_at timestamptz default now(),
  unique (requester_id, addressee_id)
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  -- References profiles (not auth.users) so the map can embed profiles(username, avatar_url).
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_path text not null,      -- path in Storage bucket 'photos', e.g. '<user_id>/<uuid>.jpg'
  caption text,
  lat double precision not null,
  lng double precision not null,
  place_name text,               -- e.g. 'Lindholmen, Gothenburg'
  filter text,
  created_at timestamptz default now()
);

-- The map queries by lat/lng bounds, newest first.
create index if not exists photos_lat_lng_idx on public.photos (lat, lng);
create index if not exists photos_created_at_idx on public.photos (created_at desc);

create table if not exists public.reactions (
  photo_id uuid references public.photos(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  emoji text not null,
  primary key (photo_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Helper: are two users accepted friends?
-- security definer so it can be used inside other tables' policies without
-- tripping over friendships' own RLS.
-- ---------------------------------------------------------------------------

create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester_id = a and f.addressee_id = b)
        or (f.requester_id = b and f.addressee_id = a))
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles    enable row level security;
alter table public.friendships enable row level security;
alter table public.photos      enable row level security;
alter table public.reactions   enable row level security;

-- profiles: any logged-in user can read (username search); you edit only yours.
drop policy if exists "profiles readable by logged-in users" on public.profiles;
create policy "profiles readable by logged-in users" on public.profiles
  for select to authenticated using (true);

drop policy if exists "create own profile" on public.profiles;
create policy "create own profile" on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- friendships: see rows you're part of; send as requester; only the addressee
-- answers; either side can remove.
drop policy if exists "see own friendships" on public.friendships;
create policy "see own friendships" on public.friendships
  for select to authenticated
  using (auth.uid() in (requester_id, addressee_id));

drop policy if exists "send friend request" on public.friendships;
create policy "send friend request" on public.friendships
  for insert to authenticated
  with check (requester_id = auth.uid() and status = 'pending');

drop policy if exists "addressee answers request" on public.friendships;
create policy "addressee answers request" on public.friendships
  for update to authenticated
  using (addressee_id = auth.uid())
  with check (addressee_id = auth.uid());

drop policy if exists "remove own friendship" on public.friendships;
create policy "remove own friendship" on public.friendships
  for delete to authenticated
  using (auth.uid() in (requester_id, addressee_id));

-- photos: yours or an accepted friend's; insert/delete only your own.
drop policy if exists "see own and friends photos" on public.photos;
create policy "see own and friends photos" on public.photos
  for select to authenticated
  using (user_id = auth.uid() or public.are_friends(auth.uid(), user_id));

drop policy if exists "post own photos" on public.photos;
create policy "post own photos" on public.photos
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "delete own photos" on public.photos;
create policy "delete own photos" on public.photos
  for delete to authenticated using (user_id = auth.uid());

-- reactions: visible if you can see the photo (photos RLS applies in the subquery).
drop policy if exists "see reactions on visible photos" on public.reactions;
create policy "see reactions on visible photos" on public.reactions
  for select to authenticated
  using (exists (select 1 from public.photos p where p.id = photo_id));

drop policy if exists "react as yourself" on public.reactions;
create policy "react as yourself" on public.reactions
  for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.photos p where p.id = photo_id));

drop policy if exists "change own reaction" on public.reactions;
create policy "change own reaction" on public.reactions
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "remove own reaction" on public.reactions;
create policy "remove own reaction" on public.reactions
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: private 'photos' bucket, files under '<user_id>/...'
-- Signing a URL needs select access, so friends get read access too.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

drop policy if exists "upload to own photos folder" on storage.objects;
create policy "upload to own photos folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "read own and friends photo files" on storage.objects;
create policy "read own and friends photo files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.are_friends(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  );

drop policy if exists "delete own photo files" on storage.objects;
create policy "delete own photo files" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Realtime (stretch: new friend photos pop onto the map without refresh)
-- ---------------------------------------------------------------------------
-- alter publication supabase_realtime add table public.photos;
