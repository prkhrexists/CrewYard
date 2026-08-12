/**
 * Shared time-formatting utilities used across AskCard, Profile, Messages, etc.
 */

/**
 * Returns a relative time string: "just now", "5m ago", "3h ago", "2d ago",
 * "4w ago", or a short date for anything older.
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const now  = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000); // seconds

  if (diff < 60)      return "just now";
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)  return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2419200) return `${Math.floor(diff / 604800)}w ago`;
  return formatMonthYear(dateStr);
}

/** Formats a date as "Aug 2024". */
export function formatMonthYear(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}
