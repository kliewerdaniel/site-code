// Shared date formatter. Post dates are ISO strings from frontmatter;
// every surface on the site must render them identically, e.g. "Oct 12, 2026".
// Fixes the v1 bug where homepage cards printed raw ISO timestamps.
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
