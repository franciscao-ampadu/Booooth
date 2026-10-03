/**
 * Where to send the user after login. Only same-site paths are allowed, so a
 * crafted ?next= can't bounce people to another domain.
 */
export function safeNext(next: unknown, fallback = "/home"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
