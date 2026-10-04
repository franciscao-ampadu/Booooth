const SIZES = {
  sm: "h-9 w-9 border-2 text-sm",
  md: "h-11 w-11 border-[3px] text-base",
  lg: "h-16 w-16 border-4 text-2xl",
} as const;

/** Round avatar with a coloured ring (pink = me, blue = friends); falls back to the initial. */
export default function Avatar({
  url,
  name,
  ring = "friend",
  size = "md",
}: {
  url: string | null;
  name: string;
  ring?: "me" | "friend";
  size?: keyof typeof SIZES;
}) {
  const classes = `${SIZES[size]} ${ring === "me" ? "border-accent" : "border-friend"} shrink-0 rounded-full`;

  if (url) {
    return (
      // Google avatar URLs and signed URLs, so no next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" referrerPolicy="no-referrer" className={`${classes} object-cover`} />
    );
  }
  return (
    <span
      aria-hidden
      className={`${classes} flex items-center justify-center bg-cream font-heading font-semibold text-ink-warm uppercase`}
    >
      {name.charAt(0)}
    </span>
  );
}
