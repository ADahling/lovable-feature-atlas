/**
 * Clamp a string to `max` chars on a word boundary, appending "…" when
 * truncated. Prevents the mid-word ellipsis native line-clamp produces
 * ("Granola,…"). Safe for empty / null input.
 */
export function truncateAtWord(input: string | null | undefined, max: number): string {
  const s = (input ?? "").trim();
  if (s.length <= max) return s;
  const slice = s.slice(0, max);
  const cut = slice.replace(/[\s,;:—\-–]*\S*$/u, "");
  const base = (cut.length >= Math.floor(max * 0.6) ? cut : slice).replace(/[\s,;:—\-–]+$/u, "");
  return base + "…";
}
