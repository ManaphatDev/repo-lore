import { describe, expect, it } from 'vitest';

import { computeContributorConcentration } from '@/features/analysis/community';
import { makeContributor } from './fixtures';

describe('computeContributorConcentration', () => {
  it('is even (low Gini) when contributions are equal', () => {
    const c = computeContributorConcentration([
      makeContributor('a', 50),
      makeContributor('b', 50),
      makeContributor('c', 50),
      makeContributor('d', 50),
    ]);
    expect(c.gini).toBeCloseTo(0, 6);
    expect(c.top1Share).toBeCloseTo(0.25, 6);
  });

  it('reads as concentrated when one person dominates', () => {
    const even = computeContributorConcentration([
      makeContributor('a', 25),
      makeContributor('b', 25),
      makeContributor('c', 25),
      makeContributor('d', 25),
    ]);
    const skewed = computeContributorConcentration([
      makeContributor('a', 970),
      makeContributor('b', 10),
      makeContributor('c', 10),
      makeContributor('d', 10),
    ]);
    expect(skewed.gini).toBeGreaterThan(even.gini);
    expect(skewed.top1Share).toBeCloseTo(0.97, 6);
  });

  it('excludes bots', () => {
    const c = computeContributorConcentration([
      makeContributor('human', 100),
      makeContributor('renovate', 999, { type: 'Bot' }),
      makeContributor('dependabot[bot]', 999),
    ]);
    expect(c.top1Share).toBe(1); // only the human counts
  });

  it('handles an empty list', () => {
    expect(computeContributorConcentration([])).toEqual({
      gini: 0,
      top1Share: 0,
      coreCount: 0,
      casualCount: 0,
    });
  });
});
