"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";

// The falling leaves are random, so they're only rendered in the browser
// (server and client HTML would never match otherwise).
const FallingLeaves = dynamic(() => import("./FallingLeaves"), { ssr: false });

// The autumn booth with a curtain: press the orange button, the curtain pulls
// aside, a flash goes off and you're in the photobooth. Ported from enter.html.

const TARGET = "/booth";
const signText: CSSProperties = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "4px" };

export default function EnterBooth() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const used = useRef(false);

  useEffect(() => {
    router.prefetch(TARGET);
  }, [router]);

  function go() {
    if (used.current) return;
    used.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOpen(true); // curtain pulls aside
    setTimeout(() => setFlash(true), reduce ? 0 : 1050);
    setTimeout(() => router.push(TARGET), reduce ? 50 : 1450);
  }

  return (
    <div className="bm-enter">
      <div className="leaves" aria-hidden>
        <FallingLeaves />
      </div>

      <Link href="/home" className="skip-link">
        ← home
      </Link>

      <main className="entrance-page">
        <svg
          className={`booth-svg${open ? " open" : ""}`}
          viewBox="0 0 400 600"
          role="group"
          aria-label="Booooth"
        >
          <defs>
            <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="7" height="7" fill="#f6e2bd" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="#dcb07a" strokeWidth="2.2" />
            </pattern>
            <pattern id="hatchRust" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="7" height="7" fill="#cf6a3c" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="#a8502a" strokeWidth="2.2" />
            </pattern>
            <symbol id="leaf" viewBox="0 0 20 34" overflow="visible">
              <path d="M10 1 C21 9 20 24 10 32 C0 24 -1 9 10 1Z" />
              <path d="M10 7 V34" fill="none" />
            </symbol>
            <clipPath id="slotclip">
              <rect x="258" y="222" width="64" height="130" />
            </clipPath>
          </defs>

          <g className="sway-a">
            {/* floor + shadow */}
            <path className="ink" d="M14 566 L386 568" />
            <path d="M60 570 L372 570 L372 584 L60 584 Z" fill="url(#hatch)" opacity=".8" />

            {/* pumpkin + leaf pile */}
            <path className="ink" style={{ fill: "#e8812f" }} d="M352 548 C352 530 392 530 392 548 C392 566 352 566 352 548 Z" />
            <path className="ink" d="M366 534 C358 546 360 558 366 564 M378 534 C386 546 384 558 378 564 M372 532 V564" strokeWidth="2" />
            <path className="ink" style={{ fill: "#6f8a3a" }} d="M372 532 C372 526 374 523 378 521 C377 526 376 529 374 532 Z" />
            <use className="gl" href="#leaf" x="14" y="538" width="16" height="28" style={{ fill: "#c8643a" }} transform="rotate(-72 22 552)" />
            <use className="gl" href="#leaf" x="34" y="544" width="15" height="26" style={{ fill: "#f2a93b" }} transform="rotate(38 42 557)" />
            <use className="gl" href="#leaf" x="46" y="540" width="14" height="25" style={{ fill: "#b3402a" }} transform="rotate(-18 53 552)" />
            <use className="gl" href="#leaf" x="340" y="548" width="14" height="24" style={{ fill: "#8a5a2b" }} transform="rotate(78 347 560)" />

            {/* body */}
            <path className="ink paper" d="M62 100 L338 98 L341 566 L58 566 Z" style={{ fill: "#e9b872" }} />

            {/* opening */}
            <path className="ink" d="M80 566 V120 H236 V566" />
            <rect className="paper" x="82" y="122" width="152" height="444" stroke="none" style={{ fill: "#f3dfbc" }} />

            {/* inside the booth (shown when open) */}
            <g className="reveal">
              <rect x="82" y="122" width="152" height="444" fill="#ffd79a" stroke="none" />
              <circle className="ink paper" cx="158" cy="250" r="42" />
              <circle className="ink" cx="158" cy="250" r="28" />
              <path className="ink" d="M140 238 Q146 228 158 226" strokeWidth="2.4" />
              <ellipse className="ink paper" cx="158" cy="472" rx="36" ry="8" style={{ fill: "#c8643a" }} />
              <path className="ink" d="M158 480 V554 M138 560 Q158 570 178 560" />
            </g>

            {/* curtain rod + curtain */}
            <path className="ink" d="M76 124 L240 124" />
            <g className="curtain">
              <g className="cl">
                <path className="ink" d="M82 126 H158 V514 H82 Z" style={{ fill: "url(#hatchRust)" }} />
                <path className="ink" d="M101 128 V512 M120 128 V512 M139 128 V512" strokeWidth="2" />
              </g>
              <g className="cr">
                <path className="ink" d="M158 126 H234 V514 H158 Z" style={{ fill: "url(#hatchRust)" }} />
                <path className="ink" d="M177 128 V512 M196 128 V512 M215 128 V512" strokeWidth="2" />
              </g>
            </g>

            {/* control panel */}
            <rect className="ink paper" x="254" y="128" width="68" height="344" rx="6" />
            <rect className="ink" x="262" y="138" width="52" height="62" rx="4" style={{ fill: "url(#hatch)" }} />
            <text className="t-hand" x="288" y="164" fontSize="12" textAnchor="middle" style={signText}>
              4 pics
            </text>
            <text className="t-hand" x="288" y="182" fontSize="12" textAnchor="middle" style={signText}>
              1 strip
            </text>
            <g clipPath="url(#slotclip)">
              <g className="strip">
                <rect className="ink paper" x="277" y="216" width="22" height="64" rx="2" />
                <rect className="ink" x="281" y="222" width="14" height="10" strokeWidth="2" />
                <rect className="ink" x="281" y="236" width="14" height="10" strokeWidth="2" />
                <rect className="ink" x="281" y="250" width="14" height="10" strokeWidth="2" />
                <rect className="ink" x="281" y="264" width="14" height="10" strokeWidth="2" />
              </g>
            </g>
            <rect className="ink paper" x="264" y="212" width="48" height="10" rx="4" />
            <rect className="ink" x="276" y="300" width="24" height="30" rx="3" />
            <circle cx="288" cy="316" r="3" fill="var(--ink)" />

            {/* enter button */}
            <g
              className={`btn${open ? " pressed" : ""}`}
              role="button"
              tabIndex={0}
              aria-label="Enter the photobooth"
              onClick={go}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  go();
                }
              }}
            >
              <circle className="ring" cx="288" cy="394" r="25" />
              <circle className="focus" cx="288" cy="394" r="33" />
              <circle className="ink knob" cx="288" cy="394" r="25" />
              <circle cx="288" cy="394" r="38" fill="transparent" />
            </g>
            <text className="t-hand" x="288" y="452" fontSize="14" textAnchor="middle">
              enter
            </text>

            {/* roof slab + sign */}
            <path className="ink paper" d="M50 86 L350 84 L352 102 L48 104 Z" style={{ fill: "#b9552f" }} />
            <path className="ink paper" d="M104 36 L296 34 L298 84 L102 86 Z" style={{ fill: "#fff0cc" }} />
            <text className="t-sans" x="203" y="70" fontSize="18" letterSpacing="6" textAnchor="middle">
              BOOOOTH
            </text>
            <path
              className="ink sparks"
              d="M92 46 L76 38 M90 60 L70 60 M92 74 L76 82 M308 46 L324 38 M310 60 L330 60 M308 74 L324 82"
              strokeWidth="3"
            />
            <path className="ink sparks b" d="M130 26 L124 12 M200 24 V8 M272 26 L278 12" strokeWidth="3" />
          </g>
        </svg>
      </main>

      <div className={`enter-flash${flash ? " go" : ""}`} aria-hidden />
    </div>
  );
}
