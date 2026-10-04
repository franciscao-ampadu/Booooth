"use client";

export type PhotoFilter = "all" | "me" | "friends";

const OPTIONS: { value: PhotoFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "me", label: "Me" },
  { value: "friends", label: "Friends" },
];

export default function FilterChips({
  value,
  onChange,
}: {
  value: PhotoFilter;
  onChange: (next: PhotoFilter) => void;
}) {
  return (
    <div role="group" aria-label="Show photos from" className="flex gap-1">
      {OPTIONS.map((o) => {
        const active = o.value === value;
        return (
          // 44px tap target around a 36px pill.
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className="group flex h-11 cursor-pointer items-center"
          >
            <span
              className={`flex h-9 items-center rounded-full border px-4 text-sm font-medium shadow-sm transition-colors ${
                active
                  ? "border-accent bg-accent text-ink-warm"
                  : "border-line bg-cream text-ink-warm group-hover:border-ink-warm"
              }`}
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
