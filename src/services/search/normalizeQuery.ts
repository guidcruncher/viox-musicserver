export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ") // collapse multiple spaces
}
