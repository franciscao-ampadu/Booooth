# Photobooth Project (Boothmap)

 I MADE IT - harshini

 I AM HERE - ayesha

A photobooth in your pocket, and a map of every moment with your friends.
Built with Next.js, React, Tailwind and Supabase.

## Running it locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill in the Supabase URL and anon key
   (Supabase → Project Settings → API). Without them the map runs on demo data.
3. Start the dev server: `npm run dev`, then open http://localhost:3000

The database tables and storage bucket are in `supabase/schema.sql` (run it once
in the Supabase SQL editor).

## Where things are

| Page | Route | Code |
| --- | --- | --- |
| Landing page | `/` | `app/page.tsx` |
| Log in (camera) | `/login` | `app/(booth)/login`, `components/sketch/CameraLogin.tsx` |
| Create account (camera) | `/signup` | `app/(booth)/signup`, `components/sketch/CameraSignup.tsx` |
| Booth entrance (curtain) | `/enter` | `app/(booth)/enter`, `components/sketch/EnterBooth.tsx` |
| Photobooth + strip | `/booth` | `app/(booth)/booth`, `components/sketch/PhotoBooth.tsx`, `lib/strip.ts` |
| Pick a username | `/onboarding` | `app/(app)/onboarding` |
| Home (friends, upload) | `/home` | `app/(app)/home` |
| Map | `/map` | `app/(app)/map`, `components/map/` |

Styles for the hand-drawn pages (login, sign-up, entrance, booth) are in
`app/(booth)/sketch.css`. Each page's rules are scoped under its own class
(`.bm-camera-page`, `.bm-enter`, `.bm-booth`) so they don't clash.
Static files such as sounds go in `public/`.

The flow: log in → `/enter` → `/booth` → **Post** pins the strip on `/map`.

## Git workflow
* Committing = "#issue_number feat/bug: Commit message here"
* Frequent merges from main into individual feature branches
* Always merge main into feature branches and deal with merge conflicts
* Merge requests are always reviewed by another person
