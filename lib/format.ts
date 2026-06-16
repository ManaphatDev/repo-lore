/** Pure formatting + small math helpers shared by the engine and the UI. */

type Lang = 'en' | 'th';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTHS_TH = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '0';
  const abs = Math.abs(n);
  if (abs >= 1_000_000)
    return `${trim(n / 1_000_000)}M`;
  if (abs >= 1_000) return `${trim(n / 1_000)}k`;
  return `${Math.round(n)}`;
}

function trim(n: number): string {
  return n
    .toFixed(1)
    .replace(/\.0$/, '')
    .replace(/(\.\d)0$/, '$1');
}

export function formatDate(iso: string | null | undefined, lang: Lang = 'en'): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  if (lang === 'th')
    return `${d.getUTCDate()} ${MONTHS_TH[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function monthYear(iso: string | Date | null | undefined, lang: Lang = 'en'): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '—';
  const months = lang === 'th' ? MONTHS_TH : MONTHS;
  return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function yearOf(iso: string): number {
  return new Date(iso).getUTCFullYear();
}

export function daysBetween(a: string | Date, b: string | Date): number {
  const t1 = (typeof a === 'string' ? new Date(a) : a).getTime();
  const t2 = (typeof b === 'string' ? new Date(b) : b).getTime();
  return Math.round((t2 - t1) / 86_400_000);
}

export function humanDuration(days: number, lang: Lang = 'en'): string {
  if (days < 1) return lang === 'th' ? 'วันนี้' : 'today';
  if (days < 30)
    return lang === 'th' ? `${days} วัน` : `${days} ${plural(days, 'day')}`;
  if (days < 365) {
    const m = Math.round(days / 30);
    return lang === 'th' ? `${m} เดือน` : `${m} ${plural(m, 'month')}`;
  }
  const years = days / 365;
  const rounded = Math.round(years * 10) / 10;
  const value = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
  return lang === 'th'
    ? `${value} ปี`
    : `${value} ${plural(Math.round(years), 'year')}`;
}

/** Compact label for a duration given in hours: "under an hour" / "7 hours" / "3 days". */
export function humanHours(hours: number): string {
  if (hours < 1) return 'under an hour';
  if (hours < 36) {
    const h = Math.round(hours);
    return `${h} ${plural(h, 'hour')}`;
  }
  const d = Math.round(hours / 24);
  return `${d} ${plural(d, 'day')}`;
}

export function relativeTime(iso: string, lang: Lang = 'en'): string {
  const days = daysBetween(iso, new Date());
  if (days <= 0) return lang === 'th' ? 'วันนี้' : 'today';
  if (days === 1) return lang === 'th' ? 'เมื่อวาน' : 'yesterday';
  return lang === 'th'
    ? `${humanDuration(days, 'th')}ที่แล้ว`
    : `${humanDuration(days)} ago`;
}

export function plural(n: number, word: string): string {
  return n === 1 ? word : `${word}s`;
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export function round(n: number, dp = 0): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

export function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return clamp(round((part / whole) * 100, 1), 0, 100);
}
