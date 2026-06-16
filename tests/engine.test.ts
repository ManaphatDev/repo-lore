import { describe, expect, it } from 'vitest';

import { analyzeRepo } from '@/features/analysis/engine';
import type { DnaCategory } from '@/types/analysis';
import {
  daysAgo,
  makeBundle,
  makeCommit,
  makeContributor,
  makeRelease,
  makeRepo,
} from './fixtures';

describe('analyzeRepo — shape', () => {
  const a = analyzeRepo(makeBundle());

  it('produces all seven DNA traits with scores in 0..100', () => {
    const categories = a.dna.map((d) => d.category);
    expect(categories).toEqual([
      'Innovation',
      'Stability',
      'Community',
      'Growth',
      'Maintenance',
      'Documentation',
      'Testing',
    ]);
    for (const d of a.dna) {
      expect(d.score).toBeGreaterThanOrEqual(0);
      expect(d.score).toBeLessThanOrEqual(100);
      expect(d.explanation.length).toBeGreaterThan(0);
    }
  });

  it('maps repo metadata onto identity', () => {
    expect(a.identity.owner).toBe('octocat');
    expect(a.identity.name).toBe('demo');
    expect(a.identity.stars).toBe(1_000);
    expect(a.identity.license).toBe('MIT');
  });

  it('reports recent commit count and a leading-language share', () => {
    expect(a.stats.recentCommits).toBe(6);
    expect(a.stats.topLanguageShare).toBe(80); // TS 8000 / 10000
    expect(a.generatedAt).toBe(new Date(a.generatedAt).toISOString());
  });
});

describe('analyzeRepo — bus factor', () => {
  it('is 1 when a single contributor dominates', () => {
    const a = analyzeRepo(
      makeBundle({
        contributors: [
          makeContributor('alice', 120),
          makeContributor('bob', 60),
          makeContributor('carol', 30),
          makeContributor('dave', 10),
        ],
      }),
    );
    expect(a.stats.busFactor).toBe(1);
  });

  it('grows when contributions are spread evenly', () => {
    const a = analyzeRepo(
      makeBundle({
        contributors: [
          makeContributor('a', 50),
          makeContributor('b', 50),
          makeContributor('c', 50),
          makeContributor('d', 50),
        ],
      }),
    );
    expect(a.stats.busFactor).toBe(3); // need >50% => 3 of 4 equal authors
  });

  it('excludes bots from contributor totals and bus factor', () => {
    const a = analyzeRepo(
      makeBundle({
        contributors: [
          makeContributor('alice', 100),
          makeContributor('renovate', 999, { type: 'Bot' }),
          makeContributor('dependabot[bot]', 999),
        ],
      }),
    );
    expect(a.stats.totalContributors).toBe(1);
    expect(a.stats.busFactor).toBe(1);
  });
});

describe('analyzeRepo — releases and maturity', () => {
  it('computes a median release cadence', () => {
    // Default releases are spaced 10 days apart.
    const a = analyzeRepo(makeBundle());
    expect(a.stats.totalReleases).toBe(4);
    expect(a.stats.releaseCadenceDays).toBe(10);
  });

  it('has no cadence when there are fewer than two releases', () => {
    const a = analyzeRepo(makeBundle({ releases: [] }));
    expect(a.stats.releaseCadenceDays).toBeNull();
  });

  it('marks an archived repository as a Steward', () => {
    const a = analyzeRepo(makeBundle({ repo: makeRepo({ archived: true }) }));
    expect(a.maturity.stage).toBe('Steward');
  });
});

describe('analyzeRepo — DNA responds to signals', () => {
  const scoreOf = (bundle: Parameters<typeof analyzeRepo>[0], cat: DnaCategory) =>
    analyzeRepo(bundle).dna.find((d) => d.category === cat)!.score;

  it('archiving lowers Maintenance', () => {
    const active = scoreOf(makeBundle(), 'Maintenance');
    const archived = scoreOf(
      makeBundle({ repo: makeRepo({ archived: true }) }),
      'Maintenance',
    );
    expect(archived).toBeLessThan(active);
  });

  it('more contributors raise Community', () => {
    const small = scoreOf(
      makeBundle({ contributors: [makeContributor('solo', 100)] }),
      'Community',
    );
    const large = scoreOf(
      makeBundle({
        contributors: Array.from({ length: 80 }, (_, i) =>
          makeContributor(`dev${i}`, 100 - i),
        ),
      }),
      'Community',
    );
    expect(large).toBeGreaterThan(small);
  });

  it('richer metadata raises Documentation', () => {
    const rich = scoreOf(makeBundle(), 'Documentation');
    const bare = scoreOf(
      makeBundle({
        repo: makeRepo({
          description: null,
          homepage: null,
          license: null,
          topics: [],
        }),
        releases: [],
      }),
      'Documentation',
    );
    expect(rich).toBeGreaterThan(bare);
  });

  it('reaching 1.0 raises Stability', () => {
    const v1 = scoreOf(
      makeBundle({
        releases: [
          makeRelease('v1.0.0', daysAgo(60)),
          makeRelease('v1.1.0', daysAgo(30)),
        ],
      }),
      'Stability',
    );
    const v0 = scoreOf(
      makeBundle({
        releases: [
          makeRelease('v0.1.0', daysAgo(60)),
          makeRelease('v0.2.0', daysAgo(30)),
        ],
      }),
      'Stability',
    );
    expect(v1).toBeGreaterThan(v0);
  });

  it('an accelerating commit trend raises Growth', () => {
    const accel = scoreOf(
      makeBundle({
        commits: [
          makeCommit('a', daysAgo(60)),
          makeCommit('b', daysAgo(3)),
          makeCommit('c', daysAgo(2)),
          makeCommit('d', daysAgo(1)),
        ],
      }),
      'Growth',
    );
    const cooling = scoreOf(
      makeBundle({
        commits: [
          makeCommit('a', daysAgo(60)),
          makeCommit('b', daysAgo(59)),
          makeCommit('c', daysAgo(58)),
          makeCommit('d', daysAgo(1)),
        ],
      }),
      'Growth',
    );
    expect(accel).toBeGreaterThan(cooling);
  });
});

describe('analyzeRepo — new dimension insights', () => {
  it('surfaces versioning, concentration and rhythm insights', () => {
    const titles = analyzeRepo(makeBundle()).insights.map((i) => i.title);
    expect(titles).toContain('Versioning');
    expect(titles).toContain('Contributor concentration');
    expect(titles).toContain('Development rhythm');
  });
});
