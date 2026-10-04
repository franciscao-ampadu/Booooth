// Booth logic goes here: camera, countdown, 4 shots, strip.
// Photobooth: camera (getUserMedia) → 4 shots → vertical strip on a <canvas>.

const FRAME_W = 520, FRAME_H = 390;                 // one photo (4:3)
const STRIP = { margin: 60, gap: 32, bottom: 170 };
STRIP.w = FRAME_W + 2 * STRIP.margin;
STRIP.h = STRIP.margin + 4 * FRAME_H + 3 * STRIP.gap + STRIP.bottom;

const FRAMES = {
  white: { bg: "#ffffff", text: "#141414" },
  pink:  { bg: "#ff4d6d", text: "#ffffff" },
  blue:  { bg: "#3a86ff", text: "#ffffff" },
  ink:   { bg: "#141414", text: "#ffffff" },
};

const THEMES = [
  { id: "classic", name: "Classic" },

  { id: "hearts", name: "Hearts", bg: "#ffd0dc", text: "#b0124f",
    emoji: ["💗", "❤️", "💕", "💘"] },

  { id: "autumn", name: "Autumn", bg: "#f3c98b", text: "#7a3b12",
    emoji: ["🍂", "🍁", "🍄", "🌰"] },

  { id: "football", name: "Football", title: "MATCHDAY", bg: "#2e7d32", text: "#ffffff",
    emoji: ["⚽", "🥅", "🏆", "🟨", "🟥", "👟"],
    paintBg(ctx) {
      // mown-grass stripes
      for (let y = 0, i = 0; y < STRIP.h; y += 94, i++) {
        ctx.fillStyle = i % 2 ? "#2e7d32" : "#3a9440";
        ctx.fillRect(0, y, STRIP.w, 94);
      }
      // white pitch line around the edge
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, STRIP.w - 16, STRIP.h - 16);
    } },

  { id: "halloween", name: "Halloween", bg: "#1b1326", text: "#ff8a1f",
    emoji: ["🎃", "👻", "🦇", "🕷️"] },

  { id: "kanelbulle", name: "Kanelbulle", title: "FIKA TIME", bg: "#f6e6cc", text: "#6b3a1e",
    emoji: ["BUN", "☕", "🤎"],
    paintBg(ctx) {
      // dashed bakery-box border
      ctx.strokeStyle = "#b07a4a";
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.strokeRect(8, 8, STRIP.w - 16, STRIP.h - 16);
      ctx.setLineDash([]);
    } },

  { id: "space", name: "Space", bg: "#0c1033", text: "#ffe66d",
    emoji: ["🚀", "⭐", "🌙", "✨"] },
];
let themeIndex = 0;

const $ = (id) => document.getElementById(id);
const video = $("video"), countdownEl = $("countdown"), cameraMsg = $("cameraMsg");
const startBtn = $("startBtn"), shotFlash = $("shotFlash");
const stage = $("stage"), review = $("review"), strip = $("strip");
const thumbs = [...document.querySelectorAll(".thumbs li")];

let shots = [], takenAt = "", filter = "none", frameName = "white", audioCtx = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Camera ---------- */
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    cameraMsg.hidden = true;
    startBtn.disabled = false;
  } catch (err) {
    console.error(err);
    cameraMsg.textContent =
      "Couldn't open the camera. Allow access in your browser, and make sure the page is on localhost or https.";
  }
}

/* ---------- Sounds (generated, no files needed) ---------- */
function tone(freq, dur, type = "sine", endFreq = freq) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur);
}
const beep = () => tone(880, 0.12);
const shutterClick = () => tone(900, 0.12, "square", 120);

/* ---------- Taking the shots ---------- */
function captureFrame() {
  const c = document.createElement("canvas");
  c.width = FRAME_W;
  c.height = FRAME_H;
  const ctx = c.getContext("2d");

  // Centre-crop the video to 4:3
  const vw = video.videoWidth, vh = video.videoHeight;
  let sw = vw, sh = vh, sx = 0, sy = 0;
  if (vw / vh > 4 / 3) { sw = vh * 4 / 3; sx = (vw - sw) / 2; }
  else { sh = vw * 3 / 4; sy = (vh - sh) / 2; }

  // Mirror so the photo matches the preview
  ctx.translate(FRAME_W, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, FRAME_W, FRAME_H);
  return c;
}

function flashScreen() {
  shotFlash.classList.remove("shot-flash");
  void shotFlash.offsetWidth; // restart the animation
  shotFlash.classList.add("shot-flash");
}

async function runBooth() {
  startBtn.disabled = true;
  shots = [];
  thumbs.forEach((t) => (t.style.backgroundImage = ""));

  for (let i = 0; i < 4; i++) {
    for (let n = 3; n >= 1; n--) {
      countdownEl.textContent = n;
      beep();
      await sleep(1000);
    }
    countdownEl.textContent = "";
    shots.push(captureFrame());
    flashScreen();
    shutterClick();
    thumbs[i].style.backgroundImage = `url(${shots[i].toDataURL("image/jpeg", 0.6)})`;
    await sleep(700);
  }

  takenAt = new Date()
    .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    .toUpperCase();
  stage.hidden = true;
  review.hidden = false;
  await drawStrip(true);
}

/* ---------- Filters (pixel maths) ---------- */
function applyFilter(ctx, x, y, w, h, name) {
  if (name === "none") return;
  const img = ctx.getImageData(x, y, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    if (name === "bw") {
      const v = 0.299 * r + 0.587 * g + 0.114 * b;
      d[i] = d[i + 1] = d[i + 2] = Math.min(255, Math.max(0, (v - 128) * 1.15 + 128));
    } else if (name === "vintage") {
      const nr = r * 0.393 + g * 0.769 + b * 0.189;
      const ng = r * 0.349 + g * 0.686 + b * 0.168;
      const nb = r * 0.272 + g * 0.534 + b * 0.131;
      d[i]     = Math.min(255, nr * 0.85 + 30);
      d[i + 1] = Math.min(255, ng * 0.85 + 25);
      d[i + 2] = Math.min(255, nb * 0.85 + 20);
    }
  }
  ctx.putImageData(img, x, y);
}

// Emoji stickers down both side borders (fixed pattern, so it doesn't flicker)
function drawStickers(ctx, emojis) {
  ctx.font = '28px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const xs = [STRIP.margin / 2, STRIP.w - STRIP.margin / 2];
  let n = 0;
  for (let y = 50; y < STRIP.h - STRIP.bottom; y += 62) {
    xs.forEach((x, side) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((((n * 37 + side * 17) % 31) - 15) * Math.PI / 180);
      ctx.fillText(emojis[(n + side) % emojis.length], 0, 0);
      ctx.restore();
    });
    n++;
  }
  ctx.textBaseline = "alphabetic";
}

/* ---------- Building the strip ---------- */
// A little cinnamon bun, drawn in code (there's no emoji for it)
function drawBun(ctx, r) {
  ctx.fillStyle = "#d9a066";
  ctx.strokeStyle = "#7a3b12";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // spiral
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 5; a += 0.2) {
    const rad = 2 + a * 0.8;
    const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
    if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // pearl sugar
  ctx.fillStyle = "#fff";
  [[-9, -10], [10, -7], [-11, 7], [8, 11], [0, -14]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(dx, dy, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Stickers on all four borders (fixed pattern, so it doesn't flicker)
function drawStickers(ctx, items) {
  const m = STRIP.margin;
  const spots = [];
  for (let y = m; y <= STRIP.h - STRIP.bottom; y += 66) {
    spots.push([m / 2, y], [STRIP.w - m / 2, y]);            // left + right
  }
  for (let i = 0; i < 5; i++) {
    const x = m + 52 + i * 104;
    spots.push([x, m / 2], [x, STRIP.h - STRIP.bottom + 28]); // top + bottom
  }

  ctx.font = '34px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  spots.forEach(([x, y], n) => {
    const item = items[(n + Math.floor(n / 2)) % items.length];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((((n * 37) % 31) - 15) * Math.PI / 180);
    if (item === "BUN") drawBun(ctx, 17);
    else ctx.fillText(item, 0, 0);
    ctx.restore();
  });
  ctx.textBaseline = "alphabetic";
}

async function drawStrip(animate = false) {
  await document.fonts.load('28px "Gloria Hallelujah"');
  strip.width = STRIP.w;
  strip.height = STRIP.h;
  const ctx = strip.getContext("2d");
  const theme = THEMES[themeIndex];
  const f = theme.id === "classic" ? FRAMES[frameName] : theme;

  ctx.fillStyle = f.bg;
  ctx.fillRect(0, 0, STRIP.w, STRIP.h);
  if (theme.paintBg) theme.paintBg(ctx);   // theme-specific background

  shots.forEach((shot, i) => {
    const x = STRIP.margin;
    const y = STRIP.margin + i * (FRAME_H + STRIP.gap);
    ctx.drawImage(shot, x, y);
    applyFilter(ctx, x, y, FRAME_W, FRAME_H, filter);
  });

  if (theme.emoji) drawStickers(ctx, theme.emoji);

  ctx.fillStyle = f.text;
  ctx.textAlign = "center";
  ctx.font = '40px "Gloria Hallelujah"';
  ctx.fillText(theme.title || "BOOTHMAP", STRIP.w / 2, STRIP.h - 85);
  ctx.font = '26px "Gloria Hallelujah"';
  ctx.fillText(
    theme.id === "classic" ? takenAt : `${theme.name.toUpperCase()} · ${takenAt}`,
    STRIP.w / 2,
    STRIP.h - 45
  );

  if (animate) {
    strip.classList.remove("printing");
    void strip.offsetWidth;
    strip.classList.add("printing");
  }
}

/* ---------- Buttons ---------- */
startBtn.addEventListener("click", () => {
  // Audio may only start after a click
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  audioCtx.resume();
  runBooth();
});

function chipGroup(id, attr, onPick) {
  $(id).addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    $(id).querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
    onPick(btn.dataset[attr]);
    drawStrip();
  });
}
chipGroup("filterChips", "filter", (v) => (filter = v));
chipGroup("frameChips", "frame", (v) => (frameName = v));

$("retakeBtn").addEventListener("click", () => {
  review.hidden = true;
  stage.hidden = false;
  startBtn.disabled = false;
  thumbs.forEach((t) => (t.style.backgroundImage = ""));
});

$("downloadBtn").addEventListener("click", () => {
  strip.toBlob((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "boothmap-strip.jpg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }, "image/jpeg", 0.85);
});

$("postBtn").addEventListener("click", () => {
  // TODO: upload strip.toBlob(...) to Supabase Storage, save lat/lng, go to map.html
  alert("Posting to the map comes next!");
});

function setTheme(delta) {
  themeIndex = (themeIndex + delta + THEMES.length) % THEMES.length;
  $("themeName").textContent = THEMES[themeIndex].name;
  $("frameChips").hidden = THEMES[themeIndex].id !== "classic"; // themes bring their own colours
  drawStrip();
}
$("themePrev").addEventListener("click", () => setTheme(-1));
$("themeNext").addEventListener("click", () => setTheme(1));

// Left/right arrow keys work too
document.addEventListener("keydown", (e) => {
  if (review.hidden) return;
  if (e.key === "ArrowLeft") setTheme(-1);
  if (e.key === "ArrowRight") setTheme(1);
});

startCamera();
