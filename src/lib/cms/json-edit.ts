export function parseJsonArray<T>(raw: string | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function updateObjectArrayItem<T extends object>(
  raw: string,
  index: number,
  patch: Partial<T>,
  fallback: T[]
): string {
  const list = parseJsonArray<T>(raw, fallback);
  const next = list.map((item, i) => (i === index ? { ...item, ...patch } : item));
  return JSON.stringify(next, null, 2);
}

export function updateStringArrayItem(
  raw: string,
  index: number,
  value: string,
  fallback: string[] = []
): string {
  const list = parseJsonArray<string>(raw, fallback);
  const next = list.map((item, i) => (i === index ? value : item));
  return JSON.stringify(next, null, 2);
}
