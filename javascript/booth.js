// Booth logic goes here: camera, countdown, 4 shots, strip.
// Photobooth: camera (getUserMedia) → 4 shots → vertical strip on a <canvas>.

const FRAME_W = 520, FRAME_H = 390;                 // one photo (4:3)
const STRIP = { w: 600, margin: 40, gap: 24, bottom: 150 };
STRIP.h = STRIP.margin + 4 * FRAME_H + 3 * STRIP.gap + STRIP.bottom;

const FRAMES = {
  white: { bg: "#ffffff", text: "#141414" },
  pink:  { bg: "#ff4d6d", text: "#ffffff" },
  blue:  { bg: "#3a86ff", text: "#ffffff" },
  ink:   { bg: "#141414", text: "#ffffff" },
};

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

