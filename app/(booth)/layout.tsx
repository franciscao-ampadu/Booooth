import "./sketch.css";

// Shared shell for the hand-drawn screens the team designed: login, sign-up,
// the booth entrance and the photobooth itself.
export default function SketchLayout({ children }: { children: React.ReactNode }) {
  return <div className="bm-sketch">{children}</div>;
}
