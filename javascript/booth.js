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
