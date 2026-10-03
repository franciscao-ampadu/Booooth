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
const shutterClick = () => tone(900, 0.12, "square", 120); // swap for an mp3 if you like

