import type { DnaScore } from '@/types/analysis';
import { clamp, daysBetween, formatNumber, plural, round } from '@/lib/format';
import type { AnalysisContext } from './context';

const pct = (ratio: number) => Math.round(ratio * 100);

function adj(score: number, hi: string, mid: string, lo: string): string {
  return score >= 70 ? hi : score >= 45 ? mid : lo;
}

export function computeDna(ctx: AnalysisContext): DnaScore[] {
  return [
    innovation(ctx),
    stability(ctx),
    community(ctx),
    growth(ctx),
    maintenance(ctx),
    documentation(ctx),
    testing(ctx),
  ];
}

function innovation(ctx: AnalysisContext): DnaScore {
  const featureRatio = ctx.commits.ratios.feature;
  const latest = ctx.sortedReleases.at(-1);
  const daysSinceRelease = latest?.published_at
    ? daysBetween(latest.published_at, ctx.now)
    : null;
  const releaseBoost =
    daysSinceRelease == null
      ? 2
      : daysSinceRelease < 90
        ? 18
        : daysSinceRelease < 270
          ? 11
          : 5;

  const score = clamp(
    round(
      24 +
        featureRatio * 58 +
        Math.min(ctx.releaseCount, 20) * 1.4 +
        Math.min(ctx.repo.topics.length, 8) * 2 +
        releaseBoost,
    ),
  );

  const lead = adj(
    score,
    'The project pushes new ground often',
    'A healthy stream of new capability lands alongside upkeep',
    'Development leans toward refinement over new invention',
  );

  return {
    category: 'Innovation',
    score,
    explanation: `${lead} — ${pct(featureRatio)}% of recent commits introduce features, across ${ctx.releaseCount} ${plural(ctx.releaseCount, 'release')}${
      daysSinceRelease != null
        ? ` (latest ${daysSinceRelease < 90 ? 'within the last quarter' : 'some time ago'})`
        : ''
    }.`,
  };
}

function stability(ctx: AnalysisContext): DnaScore {
  const ageScore = (Math.min(ctx.ageYears, 8) / 8) * 36;
  const releaseScore =
    ctx.releaseCount > 0
      ? Math.min(ctx.releaseCount, 20) + (ctx.releaseCadenceDays != null ? 10 : 0)
      : 0;
  const fixBalance = (1 - Math.min(ctx.commits.ratios.fix, 0.6)) * 14;
  const licenseScore = ctx.repo.license ? 6 : 0;
  // Reaching 1.0 signals an API contract; heavy pre-release churn signals flux.
  const versionComp =
    (ctx.versioning.reachedV1 ? 6 : 0) - ctx.versioning.prereleaseRatio * 8;

  const score = clamp(
    round(
      18 +
        ageScore +
        releaseScore +
        fixBalance +
        licenseScore +
        versionComp -
        (ctx.repo.archived ? 18 : 0),
    ),
  );

  const lead = adj(
    score,
    'A mature, well-anchored codebase',
    'A reasonably settled project still finding its rhythm',
    'An early or fast-moving codebase where things still shift',
  );

  return {
    category: 'Stability',
    score,
    explanation: `${lead} — ${round(ctx.ageYears, 1)} ${plural(Math.round(ctx.ageYears), 'year')} old with ${ctx.releaseCount} tagged ${plural(ctx.releaseCount, 'release')}${
      ctx.releaseCadenceDays != null
        ? ` shipped roughly every ${ctx.releaseCadenceDays} days`
        : ''
    }${ctx.versioning.reachedV1 ? ', and past its 1.0 milestone' : ', still pre-1.0'}.`,
  };
}

function community(ctx: AnalysisContext): DnaScore {
  const contribComp = (Math.min(ctx.contributorsTotal, 150) / 150) * 45;
  const busComp = Math.min(ctx.busFactor, 10) * 3;
  const popComp = Math.min(25, Math.log10(ctx.stars + ctx.forks + 1) * 6);
  // Evenly-spread effort is a healthier community than a one-person show.
  const evenComp = (1 - ctx.concentration.gini) * 6;

  const score = clamp(round(contribComp + busComp + popComp + evenComp));

  const lead = adj(
    score,
    'A broad, active community surrounds the project',
    'A committed group of contributors keeps it moving',
    'A small, focused circle drives the work',
  );

  return {
    category: 'Community',
    score,
    explanation: `${lead} — ${ctx.contributorsTotal}${ctx.contributorsTotal >= 100 ? '+' : ''} ${plural(
      ctx.contributorsTotal,
      'contributor',
    )}, ${formatNumber(ctx.forks)} forks, and the top ${ctx.busFactor} ${plural(
      ctx.busFactor,
      'author',
    )} accounting for over half of all commits.`,
  };
}

function growth(ctx: AnalysisContext): DnaScore {
  const starsPerYear = ctx.stars / Math.max(ctx.ageYears, 0.1);
  const starComp = Math.min(45, Math.log10(starsPerYear + 1) * 12);
  const velocityComp = Math.min(28, ctx.commits.perWeek * 1.1);
  const recencyComp =
    ctx.daysSincePush < 7
      ? 22
      : ctx.daysSincePush < 30
        ? 16
        : ctx.daysSincePush < 90
          ? 9
          : 3;
  // Direction of travel within the recent window.
  const trendComp =
    ctx.rhythm.trend === 'accelerating' ? 6 : ctx.rhythm.trend === 'cooling' ? -4 : 0;

  const score = clamp(round(starComp + velocityComp + recencyComp + trendComp));

  const lead = adj(
    score,
    'Momentum is strong and compounding',
    'Steady, sustained forward motion',
    'Growth has cooled into a slower cadence',
  );

  return {
    category: 'Growth',
    score,
    explanation: `${lead} — about ${formatNumber(Math.round(starsPerYear))} stars/year and ~${round(
      ctx.commits.perWeek,
      1,
    )} commits/week in the recent window (${ctx.rhythm.trend}), last pushed ${
      ctx.daysSincePush < 1 ? 'today' : `${ctx.daysSincePush} ${plural(ctx.daysSincePush, 'day')} ago`
    }.`,
  };
}

function maintenance(ctx: AnalysisContext): DnaScore {
  const recencyComp =
    ctx.daysSincePush < 7
      ? 30
      : ctx.daysSincePush < 30
        ? 24
        : ctx.daysSincePush < 90
          ? 15
          : ctx.daysSincePush < 365
            ? 7
            : 2;
  const maintComp = ctx.commits.ratios.maintenance * 22;
  const closeRatio = ctx.health.issueCloseRate ?? 0.5;
  const issueComp = closeRatio * 22;
  // Reward projects that actually merge the PRs they receive.
  const mergeRate = ctx.health.prMergeRate;
  const prComp = (mergeRate ?? 0.5) * 10;

  const score = clamp(
    round(
      recencyComp +
        maintComp +
        issueComp +
        prComp +
        (ctx.repo.archived ? -30 : 6),
    ),
  );

  const lead = ctx.repo.archived
    ? 'The repository is archived and no longer actively maintained'
    : adj(
        score,
        'Actively and attentively maintained',
        'Maintained at a measured, dependable pace',
        'Maintenance activity has slowed',
      );

  const mergeNote =
    mergeRate != null
      ? `, and ${Math.round(mergeRate * 100)}% of decided pull requests merged`
      : '';

  return {
    category: 'Maintenance',
    score,
    explanation: `${lead} — last activity ${
      ctx.daysSincePush < 1 ? 'today' : `${ctx.daysSincePush} ${plural(ctx.daysSincePush, 'day')} ago`
    }, with ${Math.round(closeRatio * 100)}% of recently surfaced issues already closed${mergeNote}.`,
  };
}

function documentation(ctx: AnalysisContext): DnaScore {
  const releasesWithNotes = ctx.sortedReleases.filter(
    (r) => (r.body ?? '').trim().length > 20,
  ).length;
  const notesRatio =
    ctx.releaseCount > 0 ? releasesWithNotes / ctx.releaseCount : 0;

  const score = clamp(
    round(
      8 +
        (ctx.repo.description ? 14 : 0) +
        (ctx.repo.homepage ? 12 : 0) +
        (ctx.repo.license ? 12 : 0) +
        Math.min(ctx.repo.topics.length, 8) * 2 +
        ctx.commits.ratios.docs * 40 +
        notesRatio * 14,
    ),
  );

  const signals: string[] = [];
  if (ctx.repo.description) signals.push('a description');
  if (ctx.repo.homepage) signals.push('a documentation site');
  if (ctx.repo.license) signals.push('a license');
  if (ctx.repo.topics.length) signals.push(`${ctx.repo.topics.length} topics`);

  const lead = adj(
    score,
    'Well documented and easy to approach',
    'Documented enough to get started',
    'Documentation signals are sparse',
  );

  return {
    category: 'Documentation',
    score,
    explanation: `${lead} — ${
      signals.length ? `the project advertises ${signals.join(', ')}` : 'few metadata signals are present'
    }${releasesWithNotes ? `, and ${releasesWithNotes} releases ship written notes` : ''}.`,
  };
}

function testing(ctx: AnalysisContext): DnaScore {
  const ciRe = /\b(ci|workflow|actions|travis|jenkins|pipeline|coverage|lint|e2e)\b/i;
  const ciHits = ctx.bundle.commits.filter((c) =>
    ciRe.test(c.commit.message.split('\n')[0] ?? ''),
  ).length;
  const ciRatio = ctx.bundle.commits.length
    ? ciHits / ctx.bundle.commits.length
    : 0;

  const score = clamp(
    round(14 + ctx.commits.ratios.test * 58 + ciRatio * 20),
  );

  const lead = adj(
    score,
    'Testing and automation are visibly part of the workflow',
    'Some testing and CI signals appear in the history',
    'Few explicit testing signals surface in recent commits',
  );

  return {
    category: 'Testing',
    score,
    explanation: `${lead} — ${pct(ctx.commits.ratios.test)}% of recent commits mention tests and ${ciHits} reference CI or automation (inferred from commit messages).`,
  };
}
