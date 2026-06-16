import type { ChartSeries } from '@/types/analysis';
import { monthYear, round } from '@/lib/format';
import type { AnalysisContext } from './context';

const MON = [
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

function shortLabel(d: Date): string {
  return `${MON[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}`;
}

export function buildCharts(ctx: AnalysisContext): ChartSeries {
  const commitActivity = ctx.commits.monthly.map((m) => ({
    period: shortLabel(m.date),
    commits: m.count,
  }));

  const contributorRanking = ctx.bundle.contributors
    .filter((c) => c.type !== 'Bot' && !/\[bot\]$/i.test(c.login))
    .slice(0, 8)
    .map((c) => ({ name: c.login, commits: c.contributions }));

  const releaseTimeline = ctx.sortedReleases.map((r, i) => {
    const d = r.published_at ?? r.created_at;
    return {
      date: d,
      label: monthYear(d),
      index: i + 1,
      tag: r.tag_name,
      prerelease: r.prerelease,
    };
  });

  const langs = Object.entries(ctx.bundle.languages).sort(
    (a, b) => b[1] - a[1],
  );
  const totalBytes = ctx.totalLanguageBytes || 1;
  const languageDistribution = langs.slice(0, 6).map(([name, value]) => ({
    name,
    value,
    share: round((value / totalBytes) * 100, 1),
  }));
  const otherBytes = langs.slice(6).reduce((s, [, v]) => s + v, 0);
  if (otherBytes > 0) {
    languageDistribution.push({
      name: 'Other',
      value: otherBytes,
      share: round((otherBytes / totalBytes) * 100, 1),
    });
  }

  let cumulative = 0;
  const growthMomentum = ctx.commits.monthly.map((m) => {
    cumulative += m.count;
    return { period: shortLabel(m.date), momentum: cumulative };
  });

  const dayMap = new Map<string, number>();
  for (const c of ctx.bundle.commits) {
    const iso = c.commit.author?.date ?? c.commit.committer?.date;
    if (!iso) continue;
    const day = iso.slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const commitHeatmap = [...dayMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    commitActivity,
    contributorRanking,
    releaseTimeline,
    languageDistribution,
    growthMomentum,
    commitHeatmap,
  };
}
