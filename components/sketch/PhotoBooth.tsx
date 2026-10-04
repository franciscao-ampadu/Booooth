"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPosition, LINDHOLMEN, locationErrorMessage, type LatLng } from "@/lib/geo";
import { postPhoto, PostPhotoError, reverseGeocode } from "@/lib/postPhoto";
import {
  captureFrame,
  drawStrip,
  FILTERS,
  FRAMES,
  stripDate,
  THEMES,
  type FilterName,
  type FrameName,
} from "@/lib/strip";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Leaflet needs `window`, so the picker is client-only.
const LocationPicker = dynamic(() => import("@/components/home/LocationPicker"), {
  ssr: false,
  loading: () => <p className="post-status">loading map…</p>,
});

// Photobooth: camera → 3-2-1 countdown ×4 → a printed strip you can theme,
// filter, download or post to the map. Ported from booth.html + booth.js.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type PostStatus =
  | { kind: "idle" }
  | { kind: "posting"; step: string }
  | { kind: "needs-location"; message: string }
  | { kind: "error"; message: string };

export default function PhotoBooth({ userId }: { userId: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const stripRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const shotsRef = useRef<HTMLCanvasElement[]>([]);
  const takenAtRef = useRef("");
  const printNext = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraMsg, setCameraMsg] = useState("Allow camera access to start…");
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [shotFlash, setShotFlash] = useState(0);
  const [phase, setPhase] = useState<"stage" | "review">("stage");

  const [themeIndex, setThemeIndex] = useState(0);
  const [filter, setFilter] = useState<FilterName>("none");
  const [frame, setFrame] = useState<FrameName>("white");
  const [caption, setCaption] = useState("");
  const [post, setPost] = useState<PostStatus>({ kind: "idle" });
  const [picked, setPicked] = useState<LatLng | null>(null);

  const theme = THEMES[themeIndex];

  /* ---------- Camera ---------- */
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      } catch (err) {
        console.error("[booth] camera failed:", err);
        setCameraMsg(
          "Couldn't open the camera. Allow access in your browser, and make sure the page is on localhost or https.",
        );
      }
    })();
    // Turn the camera off when leaving the booth.
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* ---------- Sounds (generated, no files needed) ---------- */
  const tone = useCallback((freq: number, dur: number, type: OscillatorType = "sine", endFreq = freq) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(audio.destination);
    osc.start(t);
    osc.stop(t + dur);
  }, []);

  /* ---------- Taking the shots ---------- */
  async function runBooth() {
    const video = videoRef.current;
    if (!video || running) return;
    // Audio may only start after a click
    audioRef.current ??= new AudioContext();
    void audioRef.current.resume();

    setRunning(true);
    setThumbs([]);
    const shots: HTMLCanvasElement[] = [];

    for (let i = 0; i < 4; i++) {
      for (let n = 3; n >= 1; n--) {
        setCount(n);
        tone(880, 0.12);
        await sleep(1000);
      }
      setCount(null);
      const shot = captureFrame(video);
      shots.push(shot);
      setShotFlash((k) => k + 1);
      tone(900, 0.12, "square", 120);
      setThumbs((t) => [...t, shot.toDataURL("image/jpeg", 0.6)]);
      await sleep(700);
    }

    shotsRef.current = shots;
    takenAtRef.current = stripDate();
    printNext.current = true;
    setPost({ kind: "idle" });
    setPhase("review");
    setRunning(false);
  }

  /* ---------- Strip ---------- */
  useEffect(() => {
    const canvas = stripRef.current;
    if (phase !== "review" || !canvas) return;
    let cancelled = false;
    (async () => {
      // next/font gives Gloria Hallelujah its own family name; read it from the CSS variable.
      const handFont =
        getComputedStyle(document.documentElement).getPropertyValue("--font-gloria").trim() ||
        '"Gloria Hallelujah", cursive';
      await document.fonts.load(`28px ${handFont}`).catch(() => {});
      if (cancelled) return;
      drawStrip(canvas, shotsRef.current, { theme, frame, filter, takenAt: takenAtRef.current, handFont });
      if (printNext.current) {
        printNext.current = false;
        canvas.classList.remove("printing");
        void canvas.offsetWidth; // restart the animation
        canvas.classList.add("printing");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, theme, frame, filter]);

  const changeTheme = useCallback((delta: number) => {
    setThemeIndex((i) => (i + delta + THEMES.length) % THEMES.length);
  }, []);

  // Left/right arrow keys switch themes too
  useEffect(() => {
    if (phase !== "review") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft") changeTheme(-1);
      if (e.key === "ArrowRight") changeTheme(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, changeTheme]);

  function retake() {
    setPhase("stage");
    setThumbs([]);
    setPost({ kind: "idle" });
    setPicked(null);
  }

  function download() {
    stripRef.current?.toBlob(
      (blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "boothmap-strip.jpg";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      },
      "image/jpeg",
      0.85,
    );
  }

  /* ---------- Posting to the map ---------- */
  async function postStrip() {
    const supabase = getSupabaseBrowserClient();
    const canvas = stripRef.current;
    if (!supabase || !canvas || post.kind === "posting") return;

    try {
      let lat: number;
      let lng: number;
      if (post.kind === "needs-location" && picked) {
        ({ lat, lng } = picked);
      } else {
        setPost({ kind: "posting", step: "finding your location…" });
        try {
          ({ lat, lng } = await getPosition());
        } catch (err) {
          console.warn("[booth] location lookup failed:", err);
          setPost({
            kind: "needs-location",
            message: `${locationErrorMessage(err)} Or drag the map below to the spot and post again.`,
          });
          return;
        }
      }

      setPost({ kind: "posting", step: "printing your strip…" });
      const [image, placeName] = await Promise.all([
        new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new PostPhotoError("Couldn't save the strip."))),
            "image/jpeg",
            0.85,
          ),
        ),
        reverseGeocode(lat, lng),
      ]);

      setPost({ kind: "posting", step: "pinning it to the map…" });
      const photoId = await postPhoto(supabase, {
        userId,
        image,
        caption,
        lat,
        lng,
        placeName,
        filter: theme.id === "classic" ? filter : `${theme.id}/${filter}`,
      });
      router.push(`/map?new=${photoId}`);
    } catch (err) {
      console.error("[booth] posting strip failed:", err);
      setPost({
        kind: "error",
        message: err instanceof PostPhotoError ? err.message : "Something went wrong. Please try again.",
      });
    }
  }

  const posting = post.kind === "posting";

  return (
    <main className="bm-booth">
      <header className="booth-header">
        <Link className="back-link" href="/home">
          ← home
        </Link>
        <Link className="back-link" href="/map">
          map →
        </Link>
      </header>

      {/* STEP 1: camera + countdown */}
      <section className="stage" hidden={phase !== "stage"}>
        <div className="camera-frame wobble-a">
          <video ref={videoRef} autoPlay playsInline muted />
          <div className="countdown" aria-live="assertive">
            {count ?? ""}
          </div>
          {!cameraReady && <p className="camera-msg">{cameraMsg}</p>}
        </div>

        <ol className="thumbs" aria-label="Your 4 shots">
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className={thumbs[i] ? "filled" : undefined}
              style={thumbs[i] ? { backgroundImage: `url(${thumbs[i]})` } : undefined}
            />
          ))}
        </ol>

        <button className="btn-booth wobble-a" onClick={runBooth} disabled={!cameraReady || running}>
          {running ? "smile!" : "Start"}
        </button>
      </section>

      {/* STEP 2: the printed strip */}
      <section className="review" hidden={phase !== "review"}>
        <div className="strip-wrap">
          <button className="arrow" aria-label="Previous theme" onClick={() => changeTheme(-1)}>
            ‹
          </button>
          <canvas ref={stripRef} className="strip-canvas" />
          <button className="arrow" aria-label="Next theme" onClick={() => changeTheme(1)}>
            ›
          </button>
        </div>
        <p className="theme-name">{theme.name}</p>

        <div className="controls">
          <div className="chips" aria-label="Filter">
            {FILTERS.map((f) => (
              <button key={f.id} className={filter === f.id ? "active" : undefined} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
          {/* Themes bring their own colours */}
          <div className="chips" aria-label="Frame colour" hidden={theme.id !== "classic"}>
            {(Object.keys(FRAMES) as FrameName[]).map((id) => (
              <button key={id} className={frame === id ? "active" : undefined} onClick={() => setFrame(id)}>
                {FRAMES[id].label}
              </button>
            ))}
          </div>

          <input
            className="caption-input"
            value={caption}
            maxLength={140}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="add a caption (optional)"
            aria-label="Caption"
            disabled={posting}
          />

          {post.kind === "needs-location" && (
            <div className="picker">
              <LocationPicker initial={picked ?? LINDHOLMEN} onChange={setPicked} />
            </div>
          )}

          {post.kind !== "idle" && (
            <p
              className={`post-status${post.kind === "posting" ? "" : " error"}`}
              role={post.kind === "posting" ? "status" : "alert"}
            >
              {post.kind === "posting" ? post.step : post.message}
            </p>
          )}

          <div className="actions">
            <button className="btn-outline wobble-a" onClick={retake} disabled={posting}>
              Retake
            </button>
            <button className="btn-outline wobble-a" onClick={download}>
              Download
            </button>
            <button className="btn-booth wobble-a" onClick={postStrip} disabled={posting}>
              {post.kind === "needs-location" ? "Pin it here" : "Post"}
            </button>
          </div>
        </div>
      </section>

      <div key={shotFlash} className={`bm-flash${shotFlash ? " shot-flash" : ""}`} aria-hidden />
      {/* Page-entrance flash: fades out when you arrive from /enter */}
      <div className="bm-flash flash-out" aria-hidden />
    </main>
  );
}
