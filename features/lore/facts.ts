import type { ContributorRole, RepoAnalysis } from '@/types/analysis';
import { formatNumber, humanHours } from '@/lib/format';

/** Plain-language facts distilled from an analysis, ready for narration. */
export interface LoreFacts {
  name: string;
  owner: string;
  language: string;
  topLangs: string[];
  createdYear: number;
  ageLabel: string;
  ageYears: number;
  stars: string;
  starsRaw: number;
  forks: string;
  contributors: number;
  contributorsLabel: string;
  busFactor: number;
  architect: string | null;
  featureBuilder: string | null;
  bugHunter: string | null;
  maintainer: string | null;
  champion: string | null;
  releaseCount: number;
  firstRelease: string | null;
  latestRelease: string | null;
  cadenceDays: number | null;
  commitsPerWeek: number;
  mergeRatePct: number | null;
  mergeLatencyLabel: string | null;
  issueResponsivenessPct: number | null;
  reachedStable: boolean;
  rhythmTrend: 'accelerating' | 'steady' | 'cooling';
  weekendPct: number;
  maturityStage: string;
  maturitySummary: string;
  dominantActivity: 'new features' | 'maintenance and fixes';
  busiestMonth: string | null;
  topics: string[];
  license: string | null;
  archived: boolean;
  daysSincePush: number;
  description: string | null;
  scores: Record<string, number>;
}

export function buildFacts(a: RepoAnalysis): LoreFacts {
  const role = (r: ContributorRole) =>
    a.contributors.find((c) => c.role === r)?.login ?? null;

  const topLangs = a.charts.languageDistribution
    .filter((l) => l.name !== 'Other')
    .slice(0, 3)
    .map((l) => l.name);

  const releases = a.charts.releaseTimeline;
  const busiest =
    a.charts.commitActivity.length > 0
      ? a.charts.commitActivity.reduce((x, y) =>
          y.commits > x.commits ? y : x,
        )
      : null;

  const scores = Object.fromEntries(a.dna.map((d) => [d.category, d.score]));

  return {
    name: a.identity.name,
    owner: a.identity.owner,
    language: a.identity.language ?? topLangs[0] ?? 'code',
    topLangs: topLangs.length ? topLangs : a.identity.language ? [a.identity.language] : [],
    createdYear: new Date(a.identity.createdAt).getUTCFullYear(),
    ageLabel: a.identity.ageLabel,
    ageYears: Math.round((a.identity.ageDays / 365) * 10) / 10,
    stars: formatNumber(a.identity.stars),
    starsRaw: a.identity.stars,
    forks: formatNumber(a.identity.forks),
    contributors: a.stats.totalContributors,
    contributorsLabel: `${a.stats.totalContributors}${a.stats.totalContributors >= 100 ? '+' : ''}`,
    busFactor: a.stats.busFactor,
    architect: role('The Architect'),
    featureBuilder: role('The Feature Builder'),
    bugHunter: role('The Bug Hunter'),
    maintainer: role('The Maintainer'),
    champion: role('The Community Champion'),
    releaseCount: a.stats.totalReleases,
    firstRelease: releases[0]?.tag ?? null,
    latestRelease: releases[releases.length - 1]?.tag ?? null,
    cadenceDays: a.stats.releaseCadenceDays,
    commitsPerWeek: a.stats.commitsPerWeek,
    mergeRatePct:
      a.stats.health.prMergeRate != null
        ? Math.round(a.stats.health.prMergeRate * 100)
        : null,
    mergeLatencyLabel:
      a.stats.health.medianMergeHours != null
        ? humanHours(a.stats.health.medianMergeHours)
        : null,
    issueResponsivenessPct:
      a.stats.health.issueCloseRate != null
        ? Math.round(a.stats.health.issueCloseRate * 100)
        : null,
    reachedStable: a.stats.versioning.reachedV1,
    rhythmTrend: a.stats.rhythm.trend,
    weekendPct: Math.round(a.stats.rhythm.weekendRatio * 100),
    maturityStage: a.maturity.stage,
    maturitySummary: a.maturity.summary,
    dominantActivity:
      (scores['Innovation'] ?? 0) >= (scores['Maintenance'] ?? 0)
        ? 'new features'
        : 'maintenance and fixes',
    busiestMonth: busiest?.period ?? null,
    topics: a.identity.topics.slice(0, 4),
    license: a.identity.license,
    archived: a.identity.archived,
    daysSincePush: Math.max(
      0,
      Math.round(
        (Date.now() - new Date(a.identity.pushedAt).getTime()) / 86_400_000,
      ),
    ),
    description: a.identity.description,
    scores,
  };
}

/** "alice, bob and carol" */
export function nameList(names: Array<string | null>): string {
  const list = [...new Set(names.filter(Boolean))] as string[];
  if (list.length === 0) return 'a handful of dedicated developers';
  if (list.length === 1) return list[0]!;
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}
