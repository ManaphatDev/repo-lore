import type { GitHubCommit } from '@/types/github';
import { daysBetween } from '@/lib/format';

export type CommitLabel =
  | 'feature'
  | 'fix'
  | 'docs'
  | 'test'
  | 'maintenance'
  | 'other';

const PATTERNS: Array<[CommitLabel, RegExp]> = [
  ['feature', /\b(feat|feature|add(s|ed|ing)?|implement|introduc|support|new|create)\b/i],
  ['fix', /\b(fix(es|ed)?|bug|patch|hotfix|regress|crash|broke|revert|resolve)\b/i],
  ['docs', /\b(docs?|documentation|readme|changelog|comment|typo)\b/i],
  ['test', /\b(test(s|ing)?|spec|coverage|e2e|unit)\b/i],
  ['maintenance', /\b(chore|refactor|clean|bump|deps?|dependenc|ci|build|lint|format|style|merge|release|version)\b/i],
];

/** Assign a single primary label to a commit message (first line only). */
export function classifyCommit(message: string): CommitLabel {
  const subject = (message || '').split('\n')[0] ?? '';
  for (const [label, re] of PATTERNS) {
    if (re.test(subject)) return label;
  }
  return 'other';
}

export interface CommitAnalysis {
  total: number;
  labels: Record<CommitLabel, number>;
  ratios: Record<CommitLabel, number>;
  monthly: Array<{ key: string; date: Date; count: number }>;
  firstDate: string | null;
  lastDate: string | null;
  perWeek: number;
  busiestMonth: { key: string; date: Date; count: number } | null;
}

function commitDate(c: GitHubCommit): string | null {
  return c.commit.author?.date ?? c.commit.committer?.date ?? null;
}

export function analyzeCommits(commits: GitHubCommit[]): CommitAnalysis {
  const labels: Record<CommitLabel, number> = {
    feature: 0,
    fix: 0,
    docs: 0,
    test: 0,
    maintenance: 0,
    other: 0,
  };

  const monthMap = new Map<string, { date: Date; count: number }>();
  let first: string | null = null;
  let last: string | null = null;

  for (const c of commits) {
    labels[classifyCommit(c.commit.message)] += 1;
    const iso = commitDate(c);
    if (!iso) continue;
    if (!last || iso > last) last = iso;
    if (!first || iso < first) first = iso;
    const d = new Date(iso);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const bucket = monthMap.get(key);
    if (bucket) bucket.count += 1;
    else
      monthMap.set(key, {
        date: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)),
        count: 1,
      });
  }

  const total = commits.length || 1;
  const ratios = Object.fromEntries(
    Object.entries(labels).map(([k, v]) => [k, v / total]),
  ) as Record<CommitLabel, number>;

  const monthly = [...monthMap.entries()]
    .map(([key, v]) => ({ key, date: v.date, count: v.count }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const spanDays =
    first && last ? Math.max(1, daysBetween(first, last)) : 1;
  const perWeek = (commits.length / spanDays) * 7;

  const busiestMonth =
    monthly.length > 0
      ? monthly.reduce((a, b) => (b.count > a.count ? b : a))
      : null;

  return {
    total: commits.length,
    labels,
    ratios,
    monthly,
    firstDate: first,
    lastDate: last,
    perWeek: Number.isFinite(perWeek) ? perWeek : 0,
    busiestMonth,
  };
}

export interface SemVer {
  major: number;
  minor: number;
  patch: number;
}

export function parseSemver(tag: string): SemVer | null {
  const m = (tag || '').match(/v?(\d+)\.(\d+)(?:\.(\d+))?/);
  if (!m) return null;
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3] ?? 0),
  };
}

/** Median of a numeric array. */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
}
