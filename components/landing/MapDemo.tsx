"use client";

import { useState } from "react";

type Pin = {
  id: string;
  who: string;
  initial: string;
  me: boolean;
  left: string;
  top: string;
  place: string;
  ago: string;
  date: string;
  week: boolean;
  caption: string;
  reactions: [number, number, number];
};

const PINS: Pin[] = [
  { id: "p1", who: "you", initial: "M", me: true, left: "26%", top: "30%", place: "Lindholmen", ago: "2 hours ago", date: "03.10.26", week: true, caption: "hackathon hour 3, still optimistic", reactions: [4, 1, 2] },
  { id: "p2", who: "ellie", initial: "E", me: false, left: "58%", top: "66%", place: "Haga", ago: "yesterday", date: "02.10.26", week: true, caption: "kanelbulle the size of my head", reactions: [6, 3, 1] },
  { id: "p3", who: "jonas", initial: "J", me: false, left: "30%", top: "84%", place: "Slottsskogen", ago: "4 days ago", date: "29.09.26", week: true, caption: "picnic, ft. one brave seagull", reactions: [2, 5, 0] },
  { id: "p4", who: "you", initial: "M", me: true, left: "74%", top: "30%", place: "Centralen", ago: "2 weeks ago", date: "19.09.26", week: false, caption: "missed the tram, took a strip instead", reactions: [3, 0, 4] },
  { id: "p5", who: "sam", initial: "S", me: false, left: "86%", top: "80%", place: "Järntorget", ago: "3 weeks ago", date: "12.09.26", week: false, caption: "first booth strip of the group", reactions: [8, 2, 2] },
];

const FILTERS = ["All", "Me", "ellie", "jonas", "This week"] as const;
type Filter = (typeof FILTERS)[number];

const GLYPHS = ["♥", "★", "☺"] as const;

const ring = (me: boolean) => (me ? "var(--accent)" : "var(--friend)");

function matches(pin: Pin, filter: Filter) {
  if (filter === "All") return true;
  if (filter === "Me") return pin.me;
  if (filter === "This week") return pin.week;
  return pin.who === filter;
}

// Hand-drawn streets and the river behind the pins.
function MapSketch() {
  return (
    <>
      <div
        className="absolute"
        style={{
          left: "-10%",
          top: "44%",
          width: "125%",
          height: "18%",
          borderTop: "3px solid var(--ink)",
          borderBottom: "3px solid var(--ink)",
          transform: "rotate(-14deg)",
          background:
            "repeating-linear-gradient(135deg,transparent 0 10px,rgba(20,20,20,.16) 10px 11.5px)",
          borderRadius: "50% 30% 60% 40% / 30% 40% 20% 30%",
        }}
      />
      <div
        className="absolute font-hand text-sm text-muted"
        style={{ left: "60%", top: "40%", transform: "rotate(-14deg)" }}
      >
        göta älv
      </div>
      <Line left="-5%" top="72%" width="110%" rotate={3} />
      <Line left="-5%" top="20%" width="110%" rotate={-3} />
      <Line left="44%" top="55%" height="60%" rotate={8} />
      <Line left="76%" top="52%" height="60%" rotate={-10} />
      <Line left="28%" top="-5%" height="46%" rotate={-12} />
      <div
        className="absolute"
        style={{
          left: "12%",
          top: "80%",
          width: "22%",
          height: "16%",
          border: "2.5px solid var(--ink)",
          borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
          background:
            "repeating-linear-gradient(45deg,transparent 0 6px,rgba(20,20,20,.12) 6px 7.5px)",
        }}
      />
    </>
  );
}

function Line({
  left,
  top,
  width = "2.5px",
  height = "2.5px",
  rotate,
}: {
  left: string;
  top: string;
  width?: string;
  height?: string;
  rotate: number;
}) {
  return (
    <div
      className="absolute bg-ink"
      style={{ left, top, width, height, transform: `rotate(${rotate}deg)` }}
    />
  );
}

export default function MapDemo() {
  const [selectedId, setSelectedId] = useState("p2");
  const [filter, setFilter] = useState<Filter>("All");
  const [mine, setMine] = useState<Record<string, boolean>>({});

  const selected = PINS.find((p) => p.id === selectedId)!;

  function pickFilter(next: Filter) {
    setFilter(next);
    // Keep the detail card in sync: if the open pin is filtered out, jump to
    // the first one that matches.
    if (!matches(selected, next)) {
      const first = PINS.find((p) => matches(p, next));
      if (first) setSelectedId(first.id);
    }
  }

  return (
    <div className="flex w-full max-w-[1120px] flex-wrap items-stretch gap-7">
      <div className="flex flex-[1_1_560px] flex-col gap-3.5">
        <div className="flex flex-wrap gap-2.5">
          {FILTERS.map((label) => {
            const active = label === filter;
            return (
              <button
                key={label}
                type="button"
                onClick={() => pickFilter(label)}
                aria-pressed={active}
                className="cursor-pointer rounded-full border-[2.5px] border-ink px-[18px] py-2 text-[15px]"
                style={{
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--paper)" : "var(--ink)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div
          className="relative min-h-[440px] flex-1 overflow-hidden border-[3.5px] border-ink bg-paper"
          style={{ borderRadius: "200px 10px 180px 10px / 10px 180px 10px 200px" }}
        >
          <MapSketch />
          {PINS.map((p) => {
            const size = p.id === selectedId ? 62 : 46;
            return (
              <div
                key={p.id}
                className="absolute flex flex-col items-center gap-1 transition-opacity"
                style={{
                  left: p.left,
                  top: p.top,
                  transform: "translate(-50%,-50%)",
                  opacity: matches(p, filter) ? 1 : 0.15,
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  aria-label={`${p.who} at ${p.place}`}
                  className="map-pin hatch cursor-pointer rounded-full p-0"
                  style={{
                    width: size,
                    height: size,
                    border: `5px solid ${ring(p.me)}`,
                    boxShadow: "0 0 0 2.5px var(--ink)",
                  }}
                />
                <span className="bg-paper px-1 font-hand text-sm leading-[1.2]">
                  {p.place}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="wobble-b flex max-w-full flex-[1_1_300px] items-start gap-[22px] border-[3px] border-ink p-[26px]">
        <div
          className="flex flex-[0_0_96px] flex-col gap-1.5 border-[2.5px] border-ink bg-white p-1.5"
          style={{
            transform: "rotate(-3deg)",
            boxShadow: "4px 5px 0 rgba(20,20,20,.08)",
          }}
        >
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="hatch-white flex h-[66px] items-end border-[1.5px] border-ink p-[3px] font-mono text-[8px] text-muted"
            >
              frame {n}
            </div>
          ))}
          <div className="text-center font-mono text-[8px] text-ink">
            {selected.date}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full font-hand text-[15px]"
              style={{ border: `3.5px solid ${ring(selected.me)}` }}
            >
              {selected.initial}
            </span>
            <div className="flex flex-col">
              <strong className="text-[17px] font-medium">{selected.who}</strong>
              <span className="text-[13px] text-muted">{selected.ago}</span>
            </div>
          </div>
          <div className="font-hand text-xl leading-[1.35] text-pretty">
            “{selected.caption}”
          </div>
          <div className="text-sm text-body">near {selected.place}</div>
          <div className="mt-1 flex flex-wrap gap-2">
            {GLYPHS.map((glyph, i) => {
              const key = selected.id + i;
              const on = !!mine[key];
              return (
                <button
                  key={glyph}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setMine((m) => ({ ...m, [key]: !m[key] }))}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border-[2.5px] border-ink px-3.5 py-1.5 text-[15px] text-ink"
                  style={{ background: on ? "#FFE3E8" : "transparent" }}
                >
                  <span>{glyph}</span>
                  <span>{selected.reactions[i] + (on ? 1 : 0)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
