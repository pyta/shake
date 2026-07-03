export function parseSocketLimit(limit: unknown): number | null {
  if (limit == null) return null;
  if (typeof limit === 'number' && Number.isFinite(limit)) return limit;
  return null;
}
