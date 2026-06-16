import type { RepoDataBundle, GitHubRelease } from '@/types/github';
import type {
  MaturityAssessment,
  MaturityStage,
  RepoAnalysis,
  RepoIdentity,
  RepoInsight,
  RepoStats,
  DnaScore,
} from '@/types/analysis';
import {
  clamp,
  daysBetween,
  formatNumber,
  humanDuration,
  humanHours,
  plural,
  round,
} from '@/lib/format';
import { analyzeCommits, median } from './helpers';
import { computeIssuePrHealth } from './health';
import { computeVersioning } from './versioning';
import { computeContributorConcentration } from './community';
import { computeDevRhythm } from './rhythm';
import { computeDna } from './dna';
import { buildTimeline } from './timeline';
import { profileContributors } from './contributors';
import { buildCharts } from './charts';
import type { AnalysisContext } from './context';

export function analyzeRepo(bundle: RepoDataBundle): RepoAnalysis {
  const repo = bundle.repo;
  const now = new Date();
  const commits = analyzeCommits(bundle.commits);

  const realContributors = bundle.contributors.filter(
    (c) => c.type !== 'Bot' && !/\[bot\]$/i.test(c.login),
  );
  const contributorsTotal = realContributors.length;
  const contributionsTotal =
    realContributors.reduce((s, c) => s + c.contributions, 0) || 0;

  // Bus factor: how many top contributors author > 50% of all commits.
  const ranked = [...realContributors].sort(
    (a, b) => b.contributions - a.contributions,
  );
  let cum = 0;
  let busFactor = 0;
  for (const c of ranked) {
    cum += c.contributions;
    busFactor += 1;
    if (cum > contributionsTotal * 0.5) break;
  }
  busFactor = Math.max(1, busFactor);

  const sortedReleases: GitHubRelease[] = [...bundle.releases]
    .filter((r) => r.published_at || r.created_at)
    .sort(
      (a, b) =>
        new Date(a.published_at ?? a.created_at).getTime() -
        new Date(b.published_at ?? b.created_at).getTime(),
    );

  const gaps: number[] = [];
  for (let i = 1; i < sortedReleases.length; i++) {
    gaps.push(
      daysBetween(
        sortedReleases[i - 1]!.published_at ?? sortedReleases[i - 1]!.created_at,
        sortedReleases[i]!.published_at ?? sortedReleases[i]!.created_at,
      ),
    );
  }
  const cadence = median(gaps);
  const releaseCadenceDays = cadence != null ? Math.max(1, Math.round(cadence)) : null;

  const totalLanguageBytes = Object.values(bundle.languages).reduce(
    (s, v) => s + v,
    0,
  );
  const maxLang = Math.max(0, ...Object.values(bundle.languages));
  const topLanguageShare =
    totalLanguageBytes > 0 ? (maxLang / totalLanguageBytes) * 100 : 0;

  const ctx: AnalysisContext = {
    bundle,
    repo,
    commits,
    now,
    ageDays: Math.max(1, daysBetween(repo.created_at, now)),
    ageYears: Math.max(0.01, daysBetween(repo.created_at, now) / 365),
    daysSincePush: Math.max(0, daysBetween(repo.pushed_at, now)),
    contributorsTotal,
    contributionsTotal,
    busFactor,
    totalLanguageBytes,
    topLanguageShare,
    releaseCount: sortedReleases.length,
    releaseCadenceDays,
    sortedReleases,
    openPulls: bundle.pulls.filter((p) => p.state === 'open').length,
    mergedPullsRecent: bundle.pulls.filter((p) => p.merged_at).length,
    openIssuesRecent: bundle.issues.filter((i) => i.state === 'open').length,
    closedIssuesRecent: bundle.issues.filter((i) => i.state === 'closed').length,
    health: computeIssuePrHealth(bundle.pulls, bundle.issues),
    versioning: computeVersioning(sortedReleases),
    concentration: computeContributorConcentration(bundle.contributors),
    rhythm: computeDevRhythm(bundle.commits),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.subscribers_count ?? repo.watchers_count,
  };

  const dna = computeDna(ctx);

  return {
    identity: buildIdentity(ctx),
    stats: buildStats(ctx),
    dna,
    timeline: buildTimeline(ctx),
    contributors: profileContributors(ctx),
    maturity: assessMaturity(ctx, dna),
    charts: buildCharts(ctx),
    insights: buildInsights(ctx),
    notes: bundle.notes,
    generatedAt: now.toISOString(),
  };
}

function buildIdentity(ctx: AnalysisContext): RepoIdentity {
  const repo = ctx.repo;
  return {
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    url: repo.html_url,
    ownerAvatar: repo.owner.avatar_url,
    ownerUrl: repo.owner.html_url,
    description: repo.description,
    homepage: repo.homepage,
    language: repo.language,
    topics: repo.topics ?? [],
    license: repo.license?.spdx_id ?? repo.license?.name ?? null,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: ctx.watchers,
    openIssues: repo.open_issues_count,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
    ageDays: ctx.ageDays,
    ageLabel: humanDuration(ctx.ageDays),
    archived: repo.archived,
  };
}

function buildStats(ctx: AnalysisContext): RepoStats {
  return {
    totalContributors: ctx.contributorsTotal,
    totalReleases: ctx.releaseCount,
    recentCommits: ctx.bundle.commits.length,
    openPulls: ctx.openPulls,
    mergedPullsRecent: ctx.mergedPullsRecent,
    openIssuesRecent: ctx.openIssuesRecent,
    closedIssuesRecent: ctx.closedIssuesRecent,
    commitsPerWeek: round(ctx.commits.perWeek, 1),
    busFactor: ctx.busFactor,
    topLanguageShare: round(ctx.topLanguageShare, 0),
    releaseCadenceDays: ctx.releaseCadenceDays,
    health: ctx.health,
    versioning: ctx.versioning,
    concentration: ctx.concentration,
    rhythm: ctx.rhythm,
  };
}

function assessMaturity(
  ctx: AnalysisContext,
  dna: DnaScore[],
): MaturityAssessment {
  const ageScore = (Math.min(ctx.ageYears, 6) / 6) * 28;
  const releaseScore = (Math.min(ctx.releaseCount, 25) / 25) * 18;
  const communityDna = dna.find((d) => d.category === 'Community')?.score ?? 0;
  const communityScore = (communityDna / 100) * 26;
  const activityScore =
    (ctx.daysSincePush < 30
      ? 1
      : ctx.daysSincePush < 90
        ? 0.7
        : ctx.daysSincePush < 365
          ? 0.4
          : 0.15) * 28;

  const index = clamp(
    round(ageScore + releaseScore + communityScore + activityScore),
  );

  let stage: MaturityStage;
  if (ctx.repo.archived) stage = 'Steward';
  else if (ctx.ageYears > 4 && ctx.daysSincePush > 120) stage = 'Steward';
  else if (index < 22) stage = 'Genesis';
  else if (index < 42) stage = 'Foundation';
  else if (index < 66) stage = 'Expansion';
  else stage = 'Maturity';

  const summaries: Record<MaturityStage, string> = {
    Genesis:
      'A young project still defining its shape — the foundations are being poured.',
    Foundation:
      'Past its earliest days, the project is building durable structure and its first real audience.',
    Expansion:
      'In full stride — features, contributors and adoption are all climbing together.',
    Maturity:
      'A well-established project: broadly adopted, steadily released, and dependable.',
    Steward: ctx.repo.archived
      ? 'Archived and preserved — an elder project whose active development has concluded.'
      : 'An elder project in careful stewardship, prioritising stability over rapid change.',
  };

  return { stage, index, summary: summaries[stage] };
}

function buildInsights(ctx: AnalysisContext): RepoInsight[] {
  const insights: RepoInsight[] = [];
  const langEntries = Object.entries(ctx.bundle.languages).sort(
    (a, b) => b[1] - a[1],
  );
  const h = ctx.health;

  if (ctx.commits.perWeek > 0) {
    insights.push({
      icon: 'Activity',
      title: 'Development velocity',
      detail: `Roughly ${round(ctx.commits.perWeek, 1)} commits per week across the recent commit window.`,
      tone: 'gold',
    });
  }

  insights.push({
    icon: 'Users',
    title: 'Bus factor',
    detail: `The top ${ctx.busFactor} ${plural(ctx.busFactor, 'contributor')} ${
      ctx.busFactor === 1 ? 'authors' : 'author'
    } over half of all commits${ctx.busFactor <= 2 ? ' — a concentration worth noting' : ''}.`,
    tone: ctx.busFactor <= 2 ? 'oxblood' : 'verdigris',
  });

  if (h.prsConsidered > 0) {
    const rate = h.prMergeRate != null ? `${Math.round(h.prMergeRate * 100)}%` : null;
    const latency =
      h.medianMergeHours != null
        ? `, typically within ${humanHours(h.medianMergeHours)}`
        : '';
    insights.push({
      icon: 'GitPullRequest',
      title: 'Pull request throughput',
      detail: `Merged ${h.mergedPrs} of ${h.prsConsidered} recent ${plural(h.prsConsidered, 'PR')}${
        rate ? ` (${rate} acceptance)` : ''
      }${latency}.`,
      tone: h.prMergeRate != null && h.prMergeRate >= 0.5 ? 'verdigris' : 'muted',
    });
  }

  if (h.issuesConsidered > 0) {
    const closePct = h.issueCloseRate != null ? Math.round(h.issueCloseRate * 100) : 0;
    const latency =
      h.medianCloseHours != null
        ? `, typically within ${humanHours(h.medianCloseHours)}`
        : '';
    insights.push({
      icon: 'Timer',
      title: 'Issue responsiveness',
      detail: `${closePct}% of ${h.issuesConsidered} recently-opened ${plural(
        h.issuesConsidered,
        'issue',
      )} closed${latency}; ${h.openIssues} ${h.openIssues === 1 ? 'remains' : 'remain'} open.`,
      tone: closePct >= 60 ? 'verdigris' : closePct >= 30 ? 'gold' : 'oxblood',
    });
  }

  insights.push({
    icon: 'Star',
    title: 'Reach',
    detail: `${formatNumber(ctx.stars)} stars and ${formatNumber(ctx.forks)} forks to date.`,
    tone: 'gold',
  });

  if (langEntries.length > 0) {
    insights.push({
      icon: 'Code2',
      title: 'Codebase',
      detail: `${langEntries.length} ${plural(langEntries.length, 'language')} detected; ${
        langEntries[0]![0]
      } leads at ${round(ctx.topLanguageShare, 0)}%.`,
      tone: 'muted',
    });
  }

  if (ctx.releaseCadenceDays != null) {
    insights.push({
      icon: 'Tag',
      title: 'Release cadence',
      detail: `${ctx.releaseCount} releases shipped — about one every ${ctx.releaseCadenceDays} days.`,
      tone: 'verdigris',
    });
  } else {
    insights.push({
      icon: 'History',
      title: 'Last activity',
      detail: `Most recent push was ${
        ctx.daysSincePush < 1 ? 'today' : `${ctx.daysSincePush} ${plural(ctx.daysSincePush, 'day')} ago`
      }.`,
      tone: 'muted',
    });
  }

  const ver = ctx.versioning;
  if (ver.releaseCount > 0) {
    insights.push({
      icon: 'GitBranch',
      title: 'Versioning',
      detail: ver.reachedV1
        ? `Past 1.0${ver.latestVersion ? ` (${ver.latestVersion})` : ''} — ${ver.majorBumps} major and ${ver.minorBumps} minor ${plural(ver.minorBumps, 'bump')} on record${ver.prereleaseRatio > 0 ? `, ${Math.round(ver.prereleaseRatio * 100)}% pre-release` : ''}.`
        : `Still pre-1.0${ver.latestVersion ? ` (${ver.latestVersion})` : ''} — APIs may still shift${ver.prereleaseRatio > 0 ? `; ${Math.round(ver.prereleaseRatio * 100)}% of releases are pre-release` : ''}.`,
      tone: ver.reachedV1 ? 'verdigris' : 'muted',
    });
  }

  const con = ctx.concentration;
  if (ctx.contributorsTotal > 1) {
    insights.push({
      icon: 'Network',
      title: 'Contributor concentration',
      detail: `The single largest contributor accounts for ${Math.round(con.top1Share * 100)}% of work (Gini ${con.gini.toFixed(2)}); ${con.coreCount} ${plural(con.coreCount, 'contributor')} sit above the average.`,
      tone: con.gini >= 0.8 ? 'oxblood' : con.gini >= 0.6 ? 'gold' : 'verdigris',
    });
  }

  const rhy = ctx.rhythm;
  if (ctx.commits.total > 0) {
    insights.push({
      icon: 'CalendarClock',
      title: 'Development rhythm',
      detail: `Recent work is ${rhy.trend}${rhy.weekendRatio > 0 ? `, with ${Math.round(rhy.weekendRatio * 100)}% of commits landing on weekends` : ''}${rhy.longestStreakDays > 1 ? ` (longest streak ${rhy.longestStreakDays} days)` : ''}.`,
      tone: rhy.trend === 'accelerating' ? 'gold' : rhy.trend === 'cooling' ? 'muted' : 'verdigris',
    });
  }

  return insights.slice(0, 10);
}
