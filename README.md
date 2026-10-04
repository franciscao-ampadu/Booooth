# 📸 Booooth
 
**A nostalgic photo booth experience, reimagined for the web.**

Photo Booth is an interactive, browser-based experience designed to capture the charm and spontaneity of a classic photo booth — without needing the booth itself.

From the moment users arrive, the experience is built to feel playful and immersive. Create an account, step through the animated booth entrance, pose for a four-shot photo session, customise your photo strip, and save the finished memory to your device.

But Photo Booth goes beyond simply taking pictures. Finished photo strips can also be **pinned to a shared digital map**, turning individual snapshots into a visual collection of memories shared between friends — wherever they are.

Built during a hackathon, Photo Booth combines **nostalgia, creativity and modern web technology** to make capturing memories feel a little more special.

A photobooth in your pocket, and a map of every moment with your friends.
Built with Next.js, React, Tailwind and Supabase.

## 🏆 Hackathon Project

Photo Booth was developed as a hackathon project, combining frontend development, authentication and creative UI design into an experience that can be demonstrated immediately.

Our goal was simple:
**Don't just build a camera — build the feeling of a photo booth**.


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


## 🛠️ Tech stack

| Layer | Choice |
|---|---|
| Frontend | Plain **HTML, CSS and JavaScript** |
| Camera | Browser `getUserMedia` API |
| Sounds | Web Audio API (generated beeps and shutter click) + an `.mp3` for login |
| Backend / auth | [Supabase](https://supabase.com) (Auth with email + Google; database and storage planned) |
| Hosting | Netlify |


## Team

| Name | Contact Email |
|---|---|
| Suprita Reddy Cenkeramaddi| supritareddy07@gmail.com |
| Ayesha Mujahid | ayesha.mujahid876@gmail.com |
| Malin Ommundsen| ommundsen.malin@gmail.com |
| Francisca Obenewaa Ampadu | franciscao.ampadu@gmail.com |
| Sree Harshini Ravi | sreeharshiniravi@gmail.com |
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
