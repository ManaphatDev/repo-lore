import type { GitHubContributor } from '@/types/github';
import type { ContributorConcentration } from '@/types/analysis';

function isHuman(c: GitHubContributor): boolean {
  return c.type !== 'Bot' && !/\[bot\]$/i.test(c.login);
}

/**
 * How evenly contribution is spread among the humans doing the work. Gini is
 * the standard sample coefficient (0 = perfectly even, →1 = one person does
 * everything); core = contributors above the mean, casual = the rest.
 */
export function computeContributorConcentration(
  contributors: GitHubContributor[],
): ContributorConcentration {
  const values = contributors
    .filter(isHuman)
    .map((c) => c.contributions)
    .filter((n) => n > 0)
    .sort((a, b) => a - b);

  const n = values.length;
  const total = values.reduce((s, v) => s + v, 0);
  if (n === 0 || total === 0) {
    return { gini: 0, top1Share: 0, coreCount: 0, casualCount: 0 };
  }

  // G = (2 * Σ i·x_i) / (n · Σ x_i) − (n + 1) / n, x ascending, i = 1..n.
  let weighted = 0;
  for (let i = 0; i < n; i++) weighted += (i + 1) * values[i]!;
  const gini = (2 * weighted) / (n * total) - (n + 1) / n;

  const mean = total / n;
  const coreCount = values.filter((v) => v > mean).length;

  return {
    gini: Math.max(0, Math.min(1, gini)),
    top1Share: values[n - 1]! / total,
    coreCount,
    casualCount: n - coreCount,
  };
}
