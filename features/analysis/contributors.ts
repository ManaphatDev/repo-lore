import type { ContributorProfile, ContributorRole } from '@/types/analysis';
import { percent } from '@/lib/format';
import { classifyCommit, type CommitLabel } from './helpers';
import type { AnalysisContext } from './context';

type Evidence = Record<CommitLabel, number> & { total: number };

const SIGNAL_TO_ROLE: Partial<Record<CommitLabel, ContributorRole>> = {
  feature: 'The Feature Builder',
  fix: 'The Bug Hunter',
  maintenance: 'The Maintainer',
  docs: 'The Community Champion',
};

function emptyEvidence(): Evidence {
  return {
    feature: 0,
    fix: 0,
    docs: 0,
    test: 0,
    maintenance: 0,
    other: 0,
    total: 0,
  };
}

function dominant(e: Evidence): CommitLabel {
  const order: CommitLabel[] = ['feature', 'fix', 'maintenance', 'docs', 'test'];
  let best: CommitLabel = 'other';
  let bestCount = 0;
  for (const label of order) {
    if (e[label] > bestCount) {
      bestCount = e[label];
      best = label;
    }
  }
  return best;
}

export function profileContributors(
  ctx: AnalysisContext,
): ContributorProfile[] {
  const list = ctx.bundle.contributors.filter(
    (c) => c.type !== 'Bot' && !/\[bot\]$/i.test(c.login),
  );
  if (list.length === 0) return [];

  const total = list.reduce((s, c) => s + c.contributions, 0) || 1;

  // Recent-commit evidence per author (best-effort; window is the last ~100).
  const evidence = new Map<string, Evidence>();
  for (const commit of ctx.bundle.commits) {
    const login = commit.author?.login;
    if (!login) continue;
    const e = evidence.get(login) ?? emptyEvidence();
    e[classifyCommit(commit.commit.message)] += 1;
    e.total += 1;
    evidence.set(login, e);
  }

  const top = list.slice(0, Math.min(6, list.length));
  const assigned = new Map<string, ContributorRole>();
  const available = new Set<ContributorRole>([
    'The Feature Builder',
    'The Bug Hunter',
    'The Maintainer',
    'The Community Champion',
  ]);

  // #1 contributor is always The Architect.
  if (top[0]) assigned.set(top[0].login, 'The Architect');

  // Evidence-driven role assignment for the rest.
  for (const c of top.slice(1)) {
    const e = evidence.get(c.login);
    if (e && e.total >= 3) {
      const role = SIGNAL_TO_ROLE[dominant(e)];
      if (role && available.has(role)) {
        assigned.set(c.login, role);
        available.delete(role);
      }
    }
  }

  // Fill remaining roles by contribution rank.
  const rankOrder: ContributorRole[] = [
    'The Feature Builder',
    'The Bug Hunter',
    'The Maintainer',
    'The Community Champion',
  ];
  for (const c of top.slice(1)) {
    if (assigned.has(c.login)) continue;
    const next = rankOrder.find((r) => available.has(r));
    if (next) {
      assigned.set(c.login, next);
      available.delete(next);
    } else {
      assigned.set(c.login, 'The Contributor');
    }
  }

  return list.slice(0, 8).map((c, i) => {
    const role = assigned.get(c.login) ?? 'The Contributor';
    const share = percent(c.contributions, total);
    return {
      login: c.login,
      avatar: c.avatar_url,
      url: c.html_url,
      contributions: c.contributions,
      share,
      role,
      rationale: rationale(role, share, c.contributions, evidence.get(c.login), i),
    };
  });
}

function rationale(
  role: ContributorRole,
  share: number,
  contributions: number,
  e: Evidence | undefined,
  rank: number,
): string {
  const commits = `${contributions.toLocaleString()} commits (${share}% of ranked work)`;
  switch (role) {
    case 'The Architect':
      return `Authored more of this codebase than anyone — ${commits}. The load-bearing hand behind its structure.`;
    case 'The Feature Builder':
      return e && e.feature > 0
        ? `Ships capability: a large share of their recent commits introduce new features. ${commits}.`
        : `A primary author of new functionality, with ${commits}.`;
    case 'The Bug Hunter':
      return e && e.fix > 0
        ? `Tracks down and squashes defects — fixes dominate their recent commits. ${commits}.`
        : `Keeps the codebase honest, focusing on fixes and corrections. ${commits}.`;
    case 'The Maintainer':
      return e && e.maintenance > 0
        ? `Tends the machinery — refactors, dependency bumps and release chores. ${commits}.`
        : `Keeps the project's plumbing in order with steady upkeep. ${commits}.`;
    case 'The Community Champion':
      return `Connects the project to its people, with ${commits} and visible engagement beyond the core.`;
    default:
      return rank === 0
        ? `A central contributor with ${commits}.`
        : `A valued contributor to the project, with ${commits}.`;
  }
}
