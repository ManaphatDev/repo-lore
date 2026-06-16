import type { GitHubCommit } from '@/types/github';
import type { DevRhythm } from '@/types/analysis';

const DAY = 86_400_000;

function commitDate(c: GitHubCommit): string | null {
  return c.commit.author?.date ?? c.commit.committer?.date ?? null;
}

/**
 * Working-pattern signals from the recent commit window: weekend share, whether
 * the pace is accelerating (recent half vs older half of the window) and the
 * longest run of consecutive active calendar days.
 */
export function computeDevRhythm(commits: GitHubCommit[]): DevRhythm {
  const dates = commits
    .map(commitDate)
    .filter((d): d is string => d !== null)
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  const n = dates.length;
  if (n === 0) {
    return { weekendRatio: 0, trend: 'steady', trendRatio: 1, longestStreakDays: 0 };
  }

  const weekend = dates.filter((d) => {
    const day = d.getUTCDay();
    return day === 0 || day === 6;
  }).length;

  // Split the time span in half; compare how many commits fall in each half so
  // a late cluster reads as accelerating (not just "half the commits each side").
  const first = dates[0]!.getTime();
  const last = dates[n - 1]!.getTime();
  let trendRatio = 1;
  let trend: DevRhythm['trend'] = 'steady';
  if (last > first) {
    const midpoint = first + (last - first) / 2;
    const older = dates.filter((d) => d.getTime() < midpoint).length;
    const recent = n - older;
    trendRatio = older > 0 ? recent / older : recent > 0 ? 2 : 1;
    trend =
      trendRatio >= 1.25 ? 'accelerating' : trendRatio <= 0.8 ? 'cooling' : 'steady';
  }

  // Longest run of consecutive active calendar days (UTC).
  const days = [...new Set(dates.map((d) => d.toISOString().slice(0, 10)))].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = new Date(days[i]!).getTime() - new Date(days[i - 1]!).getTime();
    if (gap === DAY) longest = Math.max(longest, (run += 1));
    else run = 1;
  }

  return {
    weekendRatio: weekend / n,
    trend,
    trendRatio,
    longestStreakDays: longest,
  };
}
