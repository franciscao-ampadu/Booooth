/**
 * Where to send the user after login. Only same-site paths are allowed, so a
 * crafted ?next= can't bounce people to another domain. By default people walk
 * up to the booth entrance (/enter → /booth), like the original team flow.
 */
export function safeNext(next: unknown, fallback = "/enter"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
