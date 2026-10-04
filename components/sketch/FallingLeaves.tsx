"use client";

import { useState } from "react";

const LEAF_COLOURS = ["#c8643a", "#f2a93b", "#b3402a", "#8a5a2b", "#e8812f"];

function makeLeaves() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return [];
  return Array.from({ length: 12 }, () => {
    const duration = 14 + Math.random() * 10;
    return {
      left: Math.random() * 96,
      duration,
      delay: Math.random() * duration,
      width: 20 + Math.random() * 14,
      sway: 2.5 + Math.random() * 2.5,
    };
  });
}

/** A few autumn leaves drifting down behind the booth (uses the #leaf symbol in EnterBooth's SVG). */
export default function FallingLeaves() {
  const [leaves] = useState(makeLeaves);
  return leaves.map((leaf, i) => (
    <span
      key={i}
      className="leaf"
      style={{
        left: `${leaf.left}%`,
        animationDuration: `${leaf.duration}s`,
        animationDelay: `-${leaf.delay}s`,
      }}
    >
      <svg
        className="fl"
        viewBox="0 0 20 34"
        width={leaf.width}
        height={leaf.width * 1.7}
        style={{ fill: LEAF_COLOURS[i % LEAF_COLOURS.length], animationDuration: `${leaf.sway}s` }}
      >
        <use href="#leaf" width="20" height="34" />
      </svg>
    </span>
  ));
}
