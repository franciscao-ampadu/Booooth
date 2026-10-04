# 📸 Booooth
 
**A nostalgic photo booth experience, reimagined for the web.**

Photo Booth is an interactive, browser-based experience designed to capture the charm and spontaneity of a classic photo booth — without needing the booth itself.

From the moment users arrive, the experience is built to feel playful and immersive. Create an account, step through the animated booth entrance, pose for a four-shot photo session, customise your photo strip, and save the finished memory to your device.

But Photo Booth goes beyond simply taking pictures. Finished photo strips can also be **pinned to a shared digital map**, turning individual snapshots into a visual collection of memories shared between friends, wherever they are.

A photobooth in your pocket, and a map of every moment with your friends.

## 🏆 Hackathon Project

Photo Booth was developed as a hackathon project, combining frontend development, authentication and creative UI design into an experience that can be demonstrated immediately.

Our goal was simple:
**Don't just build a camera — build the feeling of a photo booth**.

**Booooth**: https://booooth-app.netlify.app

## 🧠 What we learned

 - Using the browser camera API and drawing a photo strip on a canvas
 - Supabase authentication, and why redirect URLs matter once you deploy
 - Testing on a real phone early (HTTPS-only camera access)
 - Working together with Git under hackathon time pressure


## ✨ Features

- Secure authentication — Sign up or log in using email and password or Google, powered by Supabase Auth.
- Camera-inspired login — Authentication takes place inside the lens of a camera interface, with the shutter button triggering a flash and camera sound as users enter.
- Animated booth entrance — Approach a photo booth surrounded by falling autumn leaves, press the button, and watch the curtain open before stepping inside.
- Authentic photo session — A live camera preview, audible 3–2–1 countdown, flash effect and four consecutive shots recreate the rhythm of a real photo booth.
- Animated photo printing — The completed photo strip is rendered onto a canvas and gradually "prints" down the screen.
- Photo filters — Choose between Colour, Black & White and Vintage styles.
- Customisable frames — Personalise the strip with white, pink, blue or black frames.
- Themed photo strips — Browse through themed designs including Hearts, Autumn, Football, Halloween, Kanelbulle 🍥 and Space.
- Download & retake — Save the finished strip as a JPEG or jump straight back into the booth for another round.
- Shared memory map — Pin completed photo strips to a shared digital map and build a collection of memories with friends.
- Mobile-first design — Designed to work smoothly on phones, making the booth accessible wherever you are.


### 🔐 User Authentication

Photo Booth uses **Supabase Auth** to provide secure account management.

Users can:

- Create a personal account
- Log in securely
- Sign out
- Authenticate using email and password
- Continue with Google for faster sign-in

Authentication is integrated directly into the visual experience rather than feeling like a separate step.

### 💥 Camera Effects

The interface includes details inspired by a physical camera:

 - Shutter button
 - Camera shutter sound
 - Screen flash animation
 - Smooth transitions between pages


## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js** |
| Frontend | **React + TypeScript** |
| Styling | **Tailwind CSS + custom CSS** |
| Authentication | **Supabase Auth** |
| Database | **Supabase PostgreSQL** |
| Storage | **Supabase Storage** |
| Camera | Browser `getUserMedia` API |
| Photo Processing | HTML Canvas API |
| Authentication Providers | Email/Password + Google OAuth |
| Hosting | Netlify |

## 📁 (General) File Structure

The project follows the **Next.js App Router** structure, with reusable components and backend utilities separated from the main application pages.

```text
photobooth-project/
├── app/                          # Next.js App Router: every folder = a URL
│   ├── layout.tsx                # Root layout: <html>, fonts, globals.css
│   ├── page.tsx                  # "/" landing page
│   ├── globals.css               # Tailwind + shared colours, wobbly borders, map pin styles
│   ├── favicon.ico
│   ├── (booth)/                  # Hand-drawn "sketch" pages
│   │   ├── layout.tsx            # Wraps pages in .bm-sketch, loads sketch.css
│   │   ├── sketch.css            # All styles for login/signup/enter/booth
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── enter/page.tsx
│   │   └── booth/page.tsx
│   ├── (app)/                    # Clean "app" pages
│   │   ├── layout.tsx            # Cream background, Bricolage + Inter fonts
│   │   ├── home/page.tsx
│   │   ├── onboarding/page.tsx
│   │   └── map/
│   │       ├── layout.tsx        # Page title
│   │       └── page.tsx
│   └── auth/
│       ├── callback/route.ts     # OAuth / email-link landing
│       └── signout/route.ts      # POST to log out
│
├── components/
│   ├── Avatar.tsx                # Round avatar, pink ring = me, blue = friend
│   ├── sketch/                   # Components for the (booth) pages
│   │   ├── CameraShell.tsx       # The drawn camera frame + shutter button
│   │   ├── CameraLogin.tsx       # Login form on the camera "screen"
│   │   ├── CameraSignup.tsx      # Sign-up form on the camera "screen"
│   │   ├── EnterBooth.tsx        # SVG booth with curtain animation
│   │   ├── FallingLeaves.tsx     # Random autumn leaves (browser only)
│   │   └── PhotoBooth.tsx        # Camera, countdown, strip, posting
│   ├── auth/
│   │   └── OnboardingForm.tsx    # Username + location permission
│   ├── home/
│   │   ├── PostPhotoCard.tsx     # Upload a photo from the phone instead
│   │   ├── LocationPicker.tsx    # Small map: drag to choose a spot
│   │   └── FriendsPanel.tsx      # Search, requests, friend list
│   ├── map/
│   │   ├── MapView.tsx           # Leaflet map, pins, locate-me
│   │   ├── PhotoSheet.tsx        # Bottom sheet with the strip details
│   │   └── FilterChips.tsx       # All / Me / Friends
│   └── landing/
│       └── MapDemo.tsx           # Fake interactive map on the landing page
│
├── lib/                          # Logic with no UI
│   ├── strip.ts                  # Drawing the photo strip on a canvas
│   ├── postPhoto.ts              # Upload + save a photo, reverse geocoding
│   ├── photos.ts                 # Load photos for the map (+ demo data)
│   ├── friends.ts                # Friend requests and search
│   ├── geo.ts                    # Get the user's location, error messages
│   ├── safeNext.ts               # Safe "where to go after login"
│   ├── timeAgo.ts                # "5 min ago"
│   └── supabase/
│       ├── env.ts                # Reads the two env variables
│       ├── client.ts             # Supabase client for the browser
│       └── server.ts             # Supabase client for the server + getAuthState()
│
├── public/
│   └── sounds/login-shutter.mp3  # Shutter sound on login/sign-up
│
├── supabase/
│   └── schema.sql                # Tables, RLS policies, storage bucket
│
├── proxy.ts                      # Runs on every request, refreshes the session
├── next.config.ts
├── tsconfig.json                 # "@/..." import alias = project root
├── eslint.config.mjs
├── postcss.config.mjs            # Tailwind plugin
├── package.json
├── .env.example                  # Template for .env.local
└── README.md
```

### 🧭 Application Flow

```text
Landing Page
     ↓
Login / Sign Up
     ↓
Onboarding
     ↓
Booth Entrance
     ↓
Photo Booth
     ↓
Customise Photo Strip
     ↓
Download or Post
     ↓
Shared Memory Map
```

The project separates the **photo booth experience**, **main application**, **reusable components**, and **Supabase/database logic**, making the codebase easier to navigate and extend.

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


## Team

| Name | Contact Email |
|---|---|
| Suprita Reddy Cenkeramaddi| supritareddy07@gmail.com |
| Ayesha Mujahid | ayesha.mujahid876@gmail.com |
| Malin Ommundsen| ommundsen.malin@gmail.com |
| Francisca Obenewaa Ampadu | franciscao.ampadu@gmail.com |
| Sree Harshini Ravi | sreeharshiniravi@gmail.com |