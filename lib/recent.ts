/** Client-only recent-repo history kept in localStorage. No server involvement. */

const KEY = 'lore_recent';
const MAX = 6;

export function getRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is string => typeof x === 'string').slice(0, MAX);
  } catch {
    return [];
  }
}

export function addRecent(slug: string): void {
  if (typeof window === 'undefined' || !slug) return;
  try {
    const next = [slug, ...getRecent().filter((s) => s !== slug)].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / disabled storage */
  }
}

export function clearRecent(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
