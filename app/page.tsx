import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import MapDemo from "@/components/landing/MapDemo";

const RING_ME = "var(--accent)";
const RING_FRIEND = "var(--friend)";

const HERO_PINS = [
  { left: "24%", top: "30%", me: true },
  { left: "56%", top: "40%", me: false },
  { left: "82%", top: "24%", me: false },
  { left: "40%", top: "82%", me: false },
];

function Line({ style }: { style: CSSProperties }) {
  return <div className="absolute bg-ink" style={style} />;
}

function SectionHeading({
  kicker,
  kickerTilt,
  children,
}: {
  kicker: string;
  kickerTilt: number;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className="font-hand text-xl"
        style={{ transform: `rotate(${kickerTilt}deg)` }}
      >
        {kicker}
      </div>
      <h2 className="m-0 font-display text-[clamp(30px,5vw,52px)] font-normal tracking-[.03em]">
        {children}
      </h2>
    </div>
  );
}

function Hero() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-5 pt-14 pb-8">
      {/* Booth sign */}
      <div
        className="w-[min(760px,92%)] border-[3px] border-ink bg-paper p-2"
        style={{ borderRadius: "180px 8px 160px 8px / 8px 160px 8px 180px" }}
      >
        <div
          className="border-[3px] border-ink px-3 py-[18px] text-center"
          style={{ borderRadius: "8px 160px 8px 180px / 160px 8px 180px 8px" }}
        >
          <h1 className="m-0 font-display text-[clamp(44px,9vw,104px)] leading-none font-normal tracking-[0.04em]">
            BOOTHMAP
          </h1>
        </div>
      </div>
      {/* Sign hangers */}
      <div className="flex h-[26px] w-[min(560px,70%)] justify-between">
        {[0, 1].map((side) => (
          <div key={side} className="flex gap-[7px]">
            <div className="w-[3px] bg-ink" />
            <div className="w-[3px] bg-ink" />
            <div className="w-[3px] bg-ink" />
          </div>
        ))}
      </div>

      {/* Booth */}
      <div
        className="w-[min(1120px,100%)] overflow-hidden border-[3.5px] border-ink bg-paper"
        style={{ borderRadius: "220px 10px 200px 10px / 10px 200px 10px 220px" }}
      >
        <div className="flex h-[46px] items-center justify-center border-b-[3px] border-ink px-4 text-center font-hand text-[15px]">
          friends · places · four frames at a time
        </div>
        <div className="flex flex-wrap">
          {/* Left panel: mini map + strip */}
          <div className="relative -m-[1.5px] flex min-h-[520px] flex-[1_1_440px] flex-col gap-[22px] border-[3px] border-ink px-6 pt-10 pb-7 sm:px-9">
            <div
              className="border-[3px] border-ink p-2.5"
              style={{ borderRadius: "120px 6px 110px 6px / 6px 110px 6px 120px" }}
            >
              <div className="wobble-inner-a relative aspect-[16/10] overflow-hidden border-[3px] border-ink bg-paper">
                <div
                  className="absolute"
                  style={{
                    left: "-10%",
                    top: "52%",
                    width: "130%",
                    height: "22%",
                    borderTop: "3px solid var(--ink)",
                    borderBottom: "3px solid var(--ink)",
                    transform: "rotate(-9deg)",
                    background:
                      "repeating-linear-gradient(135deg,transparent 0 9px,rgba(20,20,20,.18) 9px 10.5px)",
                    borderRadius: "60% 40% 50% 30% / 20% 30% 20% 40%",
                  }}
                />
                <Line style={{ left: 0, top: "28%", width: "100%", height: 2.5, transform: "rotate(4deg)" }} />
                <Line style={{ left: "38%", top: "-5%", width: 2.5, height: "62%", transform: "rotate(12deg)" }} />
                <Line style={{ left: "70%", top: "-5%", width: 2.5, height: "60%", transform: "rotate(-6deg)" }} />
                <Line style={{ left: "20%", top: "78%", width: 2.5, height: "40%", transform: "rotate(-14deg)" }} />
                {HERO_PINS.map((p) => (
                  <div
                    key={`${p.left}-${p.top}`}
                    className="hatch absolute -mt-[17px] -ml-[17px] h-[34px] w-[34px] rounded-full"
                    style={{
                      left: p.left,
                      top: p.top,
                      border: `3.5px solid ${p.me ? RING_ME : RING_FRIEND}`,
                      boxShadow: "0 0 0 2px var(--ink)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-5">
              {/* Strip printing out of the slot */}
              <div className="flex flex-col items-center">
                <div
                  className="h-3.5 w-[78px] border-[3px] border-ink bg-ink"
                  style={{ borderRadius: "3px 8px 3px 6px / 6px 3px 8px 3px" }}
                />
                <div
                  className="flex w-[60px] flex-col gap-[5px] border-[3px] border-t-0 border-ink bg-white px-1.5 pt-1.5 pb-2"
                  style={{ transform: "rotate(-1.5deg)" }}
                >
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="hatch-white h-[34px] border-2 border-ink" />
                  ))}
                </div>
              </div>
              <div className="-mt-2 flex flex-col items-end gap-0.5">
                <svg
                  width="40"
                  height="44"
                  viewBox="0 0 40 44"
                  fill="none"
                  stroke="#141414"
                  strokeWidth="3"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M12 40 C34 32 34 14 16 5" />
                  <path d="M16 5 L24 4" />
                  <path d="M16 5 L19 12" />
                </svg>
                <div
                  className="text-right font-hand text-[22px] leading-[1.15]"
                  style={{ transform: "rotate(-3deg)" }}
                >
                  where we&apos;ve
                  <br />
                  all been
                </div>
              </div>
            </div>
            <p className="m-0 mt-auto max-w-[34ch] text-[15px] text-pretty text-body">
              A photobooth in your pocket — and a map of every moment with your
              friends.
            </p>
          </div>

          {/* Middle panel: curtain + CTA */}
          <div className="relative -m-[1.5px] min-h-[520px] flex-[1_1_300px] overflow-hidden border-[3px] border-ink">
            <div className="absolute flex" style={{ inset: "0 6% 18% 6%" }} aria-hidden>
              {[
                "0 30px 0 60px / 0 50% 0 50%",
                "0 60px 0 20px / 0 50% 0 50%",
                "0 20px 0 50px / 0 50% 0 50%",
                "0 50px 0 30px / 0 50% 0 50%",
                "0 30px 0 60px / 0 50% 0 50%",
              ].map((r, i) => (
                <div
                  key={i}
                  className="flex-1 border-r-[3px] border-ink"
                  style={{ borderRadius: r }}
                />
              ))}
              <div className="flex-1" />
            </div>
            <div
              className="absolute right-[6%] left-[6%] h-[3px] bg-ink"
              style={{ top: "82%", transform: "rotate(-1deg)" }}
            />
            <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3">
              <a href="#how" className="btn-booth gap-3 px-[34px] py-5 text-[30px]">
                step inside <span className="text-[28px]">→</span>
              </a>
              <div className="bg-paper px-1.5 font-hand text-base">
                it&apos;s free. bring friends.
              </div>
            </div>
          </div>

          {/* Right panel: how-to + legend */}
          <div className="-m-[1.5px] flex flex-[1_1_210px] flex-col gap-5 border-[3px] border-ink px-[22px] py-10">
            <div
              className="flex flex-col gap-3.5 border-[3px] border-ink px-3.5 py-4"
              style={{ borderRadius: "6px 80px 6px 90px / 80px 6px 90px 6px" }}
            >
              <div className="text-center font-display text-[13px] tracking-[.14em]">
                HOW TO
              </div>
              {["sit, smile ×4", "strip pins to where you are", "friends see it on their map"].map(
                (step, i) => (
                  <div key={step} className="flex items-baseline gap-2.5">
                    <span className="font-hand text-[22px]">{i + 1}</span>
                    <span className="text-sm">{step}</span>
                  </div>
                ),
              )}
            </div>
            <div className="mt-auto flex flex-col gap-2">
              <Legend ring={RING_ME} label="you" />
              <Legend ring={RING_FRIEND} label="friends" />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-wrap justify-center gap-7 pt-[26px] text-[17px]">
        <a href="#how">How it works</a>
        <a href="#map">The map</a>
        <a href="#privacy">Privacy</a>
        <a href="#start">Get started</a>
      </nav>
    </section>
  );
}

function Legend({ ring, label }: { ring: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-body">
      <span
        className="h-3.5 w-3.5 rounded-full"
        style={{ border: `3.5px solid ${ring}` }}
      />
      {label}
    </div>
  );
}

function StepCard({
  shape,
  n,
  title,
  body,
  children,
}: {
  shape: string;
  n: number;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className={`${shape} flex flex-col gap-[18px] border-[3px] border-ink p-7`}>
      {children}
      <div className="flex items-baseline gap-3">
        <span className="font-hand text-[28px]">{n}</span>
        <h3 className="m-0 text-[22px] font-medium">{title}</h3>
      </div>
      <p className="m-0 text-base leading-normal text-pretty text-body">{body}</p>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="flex flex-col items-center gap-12 px-5 py-24">
      <SectionHeading kicker="the core loop" kickerTilt={-2}>
        Pose. Pin. Share.
      </SectionHeading>
      <div className="grid w-[min(1120px,100%)] grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-7">
        <StepCard
          shape="wobble-a"
          n={1}
          title="Take a booth strip"
          body="Tap the big button. Countdown, flash, four shots — stitched into one strip that prints out like the real thing."
        >
          <div
            className="flex h-[180px] items-center justify-center gap-[18px] border-[3px] border-ink font-display text-7xl"
            style={{ borderRadius: "6px 100px 6px 110px / 100px 6px 110px 6px" }}
          >
            <span>3</span>
            <span className="text-[#B8B3AA]">2</span>
            <span className="text-[#DAD6CF]">1</span>
          </div>
        </StepCard>

        <StepCard
          shape="wobble-b"
          n={2}
          title="It pins where you are"
          body="Add a caption, pick a filter, post. The strip drops onto the map at the spot it was taken."
        >
          <div className="wobble-inner-b relative h-[180px] overflow-hidden border-[3px] border-ink">
            <Line style={{ left: "-5%", top: "60%", width: "110%", height: 2.5, transform: "rotate(-6deg)" }} />
            <Line style={{ left: "30%", top: "-5%", width: 2.5, height: "110%", transform: "rotate(10deg)" }} />
            <div
              className="hatch absolute -mt-[26px] -ml-[26px] h-[52px] w-[52px] rounded-full"
              style={{
                left: "52%",
                top: "40%",
                border: `5px solid ${RING_ME}`,
                boxShadow: "0 0 0 2.5px var(--ink)",
              }}
            />
            <div className="absolute font-hand text-[15px]" style={{ left: "62%", top: "58%" }}>
              near Lindholmen
            </div>
          </div>
        </StepCard>

        <StepCard
          shape="wobble-c"
          n={3}
          title="Friends see it live"
          body="It pops onto their map — no refresh. They react, or go take their own."
        >
          <div
            className="flex h-[180px] items-center justify-center gap-4 border-[3px] border-ink"
            style={{ borderRadius: "6px 110px 6px 100px / 110px 6px 100px 6px" }}
          >
            <div
              className="flex w-[46px] flex-col gap-1 border-[2.5px] border-ink bg-white p-1"
              style={{ transform: "rotate(-6deg)" }}
            >
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="hatch-white h-[26px] border-[1.5px] border-ink" />
              ))}
            </div>
            <div className="flex flex-col gap-2.5 font-hand text-[17px]">
              {["ellie ♥", "jonas ★", "sam ☺"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ border: `3.5px solid ${RING_FRIEND}` }}
                  />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </StepCard>
      </div>
    </section>
  );
}

function MapSection() {
  return (
    <section id="map" className="flex flex-col items-center gap-9 px-5 pt-[72px] pb-24">
      <div className="flex max-w-[620px] flex-col items-center gap-2 text-center">
        <div className="font-hand text-xl" style={{ transform: "rotate(2deg)" }}>
          sorted by place, not time
        </div>
        <h2 className="m-0 font-display text-[clamp(30px,5vw,52px)] font-normal tracking-[.03em]">
          The map is the scrapbook
        </h2>
        <p className="mt-1.5 mb-0 text-[17px] leading-normal text-pretty text-body">
          Every strip lives where it happened. Tap a pin.
        </p>
      </div>
      <MapDemo />
    </section>
  );
}

function Privacy() {
  const points = [
    "Add friends by username — they accept, or they don't.",
    "Blur any pin to the neighbourhood instead of the exact spot.",
    "Camera and location are only used when you take a strip.",
  ];
  return (
    <section id="privacy" className="flex justify-center px-5 py-[72px]">
      <div className="grid w-[min(1120px,100%)] grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-center gap-10">
        <div className="flex flex-col gap-3">
          <div
            className="self-start font-hand text-xl"
            style={{ transform: "rotate(-2deg)" }}
          >
            no strangers
          </div>
          <h2 className="m-0 font-display text-[clamp(30px,5vw,48px)] font-normal tracking-[.03em]">
            Friends only. Always.
          </h2>
          <p className="m-0 max-w-[44ch] text-[17px] leading-[1.55] text-pretty text-body">
            There&apos;s no public feed. Your strips are visible to you and
            people you&apos;ve accepted — nobody else.
          </p>
        </div>
        <ul className="wobble-a m-0 flex list-none flex-col border-[3px] border-ink px-7 py-2.5">
          {points.map((point, i) => (
            <li
              key={point}
              className={`flex gap-4 py-[18px] ${i < points.length - 1 ? "border-b-[2.5px] border-ink" : ""}`}
            >
              <span className="flex-[0_0_28px] font-hand text-xl">✓</span>
              <span className="text-base leading-normal">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function GetStarted() {
  return (
    <section id="start" className="flex flex-col items-center gap-7 px-5 pt-24 pb-10 text-center">
      <h2 className="m-0 font-display text-[clamp(34px,6vw,64px)] font-normal tracking-[.03em]">
        Your seat&apos;s free.
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/login" className="btn-booth px-[30px] py-4 text-[22px]">
          continue with Google
        </Link>
        <Link href="/login" className="btn-outline px-[30px] py-4 text-[22px]">
          email me a link →
        </Link>
      </div>
      <div className="font-hand text-[17px]" style={{ transform: "rotate(-1.5deg)" }}>
        works best on your phone ↓
      </div>
      <footer className="mt-[72px] flex flex-col items-center gap-3.5 text-[15px] text-muted">
        <nav className="flex flex-wrap justify-center gap-7">
          <a href="#privacy">Privacy</a>
          <a href="#how">FAQ</a>
          <a href="#">Team</a>
          <a href="#">Contact</a>
        </nav>
        <span>made at a hackathon · Gothenburg · 2026</span>
      </footer>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <MapSection />
      <Privacy />
      <GetStarted />
    </main>
  );
}
