// Drawing the photobooth strip on a <canvas>: 4 shots, a frame colour or a
// theme, filters and stickers. Ported from the team's javascript/booth.js.

export const FRAME_W = 520;
export const FRAME_H = 390; // one photo (4:3)

const MARGIN = 60;
const GAP = 32;
const BOTTOM = 170;
export const STRIP_W = FRAME_W + 2 * MARGIN;
export const STRIP_H = MARGIN + 4 * FRAME_H + 3 * GAP + BOTTOM;

export type FilterName = "none" | "bw" | "vintage";
export type FrameName = "white" | "pink" | "blue" | "ink";

export const FILTERS: { id: FilterName; label: string }[] = [
  { id: "none", label: "Colour" },
  { id: "bw", label: "B&W" },
  { id: "vintage", label: "Vintage" },
];

export const FRAMES: Record<FrameName, { label: string; bg: string; text: string }> = {
  white: { label: "White", bg: "#ffffff", text: "#141414" },
  pink: { label: "Pink", bg: "#ff4d6d", text: "#ffffff" },
  blue: { label: "Blue", bg: "#3a86ff", text: "#ffffff" },
  ink: { label: "Black", bg: "#141414", text: "#ffffff" },
};

export type Theme = {
  id: string;
  name: string;
  title?: string;
  bg?: string;
  text?: string;
  emoji?: string[];
  paintBg?: (ctx: CanvasRenderingContext2D) => void;
};

export const THEMES: Theme[] = [
  { id: "classic", name: "Classic" },

  { id: "hearts", name: "Hearts", bg: "#ffd0dc", text: "#b0124f", emoji: ["💗", "❤️", "💕", "💘"] },

  { id: "autumn", name: "Autumn", bg: "#f3c98b", text: "#7a3b12", emoji: ["🍂", "🍁", "🍄", "🌰"] },

  {
    id: "football",
    name: "Football",
    title: "MATCHDAY",
    bg: "#2e7d32",
    text: "#ffffff",
    emoji: ["⚽", "🥅", "🏆", "🟨", "🟥", "👟"],
    paintBg(ctx) {
      // mown-grass stripes
      for (let y = 0, i = 0; y < STRIP_H; y += 94, i++) {
        ctx.fillStyle = i % 2 ? "#2e7d32" : "#3a9440";
        ctx.fillRect(0, y, STRIP_W, 94);
      }
      // white pitch line around the edge
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, STRIP_W - 16, STRIP_H - 16);
    },
  },

  { id: "halloween", name: "Halloween", bg: "#1b1326", text: "#ff8a1f", emoji: ["🎃", "👻", "🦇", "🕷️"] },

  {
    id: "kanelbulle",
    name: "Kanelbulle",
    title: "FIKA TIME",
    bg: "#f6e6cc",
    text: "#6b3a1e",
    emoji: ["BUN", "☕", "🤎"],
    paintBg(ctx) {
      // dashed bakery-box border
      ctx.strokeStyle = "#b07a4a";
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.strokeRect(8, 8, STRIP_W - 16, STRIP_H - 16);
      ctx.setLineDash([]);
    },
  },

  { id: "space", name: "Space", bg: "#0c1033", text: "#ffe66d", emoji: ["🚀", "⭐", "🌙", "✨"] },
];

/** Grab one 4:3, mirrored frame from the live video. */
export function captureFrame(video: HTMLVideoElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = FRAME_W;
  c.height = FRAME_H;
  const ctx = c.getContext("2d")!;

  // Centre-crop the video to 4:3
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  let sw = vw;
  let sh = vh;
  let sx = 0;
  let sy = 0;
  if (vw / vh > 4 / 3) {
    sw = (vh * 4) / 3;
    sx = (vw - sw) / 2;
  } else {
    sh = (vw * 3) / 4;
    sy = (vh - sh) / 2;
  }

  // Mirror so the photo matches the preview
  ctx.translate(FRAME_W, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, FRAME_W, FRAME_H);
  return c;
}

/* ---------- Filters (pixel maths) ---------- */
function applyFilter(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, name: FilterName) {
  if (name === "none") return;
  const img = ctx.getImageData(x, y, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    if (name === "bw") {
      const v = 0.299 * r + 0.587 * g + 0.114 * b;
      d[i] = d[i + 1] = d[i + 2] = Math.min(255, Math.max(0, (v - 128) * 1.15 + 128));
    } else if (name === "vintage") {
      const nr = r * 0.393 + g * 0.769 + b * 0.189;
      const ng = r * 0.349 + g * 0.686 + b * 0.168;
      const nb = r * 0.272 + g * 0.534 + b * 0.131;
      d[i] = Math.min(255, nr * 0.85 + 30);
      d[i + 1] = Math.min(255, ng * 0.85 + 25);
      d[i + 2] = Math.min(255, nb * 0.85 + 20);
    }
  }
  ctx.putImageData(img, x, y);
}

// A little cinnamon bun, drawn in code (there's no emoji for it)
function drawBun(ctx: CanvasRenderingContext2D, r: number) {
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
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // pearl sugar
  ctx.fillStyle = "#fff";
  for (const [dx, dy] of [[-9, -10], [10, -7], [-11, 7], [8, 11], [0, -14]]) {
    ctx.beginPath();
    ctx.arc(dx, dy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Stickers on all four borders (fixed pattern, so it doesn't flicker)
function drawStickers(ctx: CanvasRenderingContext2D, items: string[]) {
  const m = MARGIN;
  const spots: [number, number][] = [];
  for (let y = m; y <= STRIP_H - BOTTOM; y += 66) {
    spots.push([m / 2, y], [STRIP_W - m / 2, y]); // left + right
  }
  for (let i = 0; i < 5; i++) {
    const x = m + 52 + i * 104;
    spots.push([x, m / 2], [x, STRIP_H - BOTTOM + 28]); // top + bottom
  }

  ctx.font = '34px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  spots.forEach(([x, y], n) => {
    const item = items[(n + Math.floor(n / 2)) % items.length];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(((((n * 37) % 31) - 15) * Math.PI) / 180);
    if (item === "BUN") drawBun(ctx, 17);
    else ctx.fillText(item, 0, 0);
    ctx.restore();
  });
  ctx.textBaseline = "alphabetic";
}

/** Paint the whole strip onto `canvas`. `handFont` is the CSS font-family for the caption. */
export function drawStrip(
  canvas: HTMLCanvasElement,
  shots: HTMLCanvasElement[],
  opts: { theme: Theme; frame: FrameName; filter: FilterName; takenAt: string; handFont: string },
) {
  canvas.width = STRIP_W;
  canvas.height = STRIP_H;
  const ctx = canvas.getContext("2d")!;
  const { theme } = opts;
  const colours = theme.id === "classic" ? FRAMES[opts.frame] : { bg: theme.bg!, text: theme.text! };

  ctx.fillStyle = colours.bg;
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);
  theme.paintBg?.(ctx); // theme-specific background

  shots.forEach((shot, i) => {
    const x = MARGIN;
    const y = MARGIN + i * (FRAME_H + GAP);
    ctx.drawImage(shot, x, y);
    applyFilter(ctx, x, y, FRAME_W, FRAME_H, opts.filter);
  });

  if (theme.emoji) drawStickers(ctx, theme.emoji);

  ctx.fillStyle = colours.text;
  ctx.textAlign = "center";
  ctx.font = `40px ${opts.handFont}`;
  ctx.fillText(theme.title ?? "BOOTHMAP", STRIP_W / 2, STRIP_H - 85);
  ctx.font = `26px ${opts.handFont}`;
  ctx.fillText(
    theme.id === "classic" ? opts.takenAt : `${theme.name.toUpperCase()} · ${opts.takenAt}`,
    STRIP_W / 2,
    STRIP_H - 45,
  );
}

/** "4 OCT 2026" */
export function stripDate(date = new Date()): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
}
