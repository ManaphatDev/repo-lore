import { describe, expect, it } from 'vitest';

import { computeIssuePrHealth } from '@/features/analysis/health';
import { analyzeRepo } from '@/features/analysis/engine';
import { generateLore } from '@/features/lore/generator';
import { buildReportMarkdown } from '@/lib/report-markdown';
import { dictionaries } from '@/lib/i18n/dictionaries';
import type { DnaCategory } from '@/types/analysis';
import { makeBundle, makeIssue, makePull } from './fixtures';

const maintenanceScore = (bundle: Parameters<typeof analyzeRepo>[0]) =>
  analyzeRepo(bundle).dna.find((d) => d.category === ('Maintenance' as DnaCategory))!
    .score;

describe('computeIssuePrHealth — pull requests', () => {
  it('measures merge rate over decided PRs and median time-to-merge', () => {
    const h = computeIssuePrHealth(
      [
        makePull('closed', true, {
          created_at: '2023-01-01T00:00:00Z',
          merged_at: '2023-01-03T00:00:00Z', // 48h
        }),
        makePull('closed', true, {
          created_at: '2023-01-01T00:00:00Z',
          merged_at: '2023-01-05T00:00:00Z', // 96h
        }),
        makePull('closed', false), // closed without merging
        makePull('open', false),
      ],
      [],
    );

    expect(h.prsConsidered).toBe(4);
    expect(h.mergedPrs).toBe(2);
    expect(h.closedPrs).toBe(3);
    expect(h.prMergeRate).toBeCloseTo(2 / 3, 10);
    expect(h.medianMergeHours).toBe(72); // median of 48 and 96
  });

  it('ignores merge timestamps that precede creation', () => {
    const h = computeIssuePrHealth(
      [
        makePull('closed', true, {
          created_at: '2023-01-05T00:00:00Z',
          merged_at: '2023-01-04T00:00:00Z', // negative — dropped
        }),
        makePull('closed', true, {
          created_at: '2023-01-01T00:00:00Z',
          merged_at: '2023-01-02T00:00:00Z', // 24h
        }),
      ],
      [],
    );
    expect(h.mergedPrs).toBe(2);
    expect(h.medianMergeHours).toBe(24);
  });
});

describe('computeIssuePrHealth — issues', () => {
  it('measures close rate and median time-to-close', () => {
    const h = computeIssuePrHealth(
      [],
      [
        makeIssue('closed', {
          created_at: '2023-01-01T00:00:00Z',
          closed_at: '2023-01-02T00:00:00Z', // 24h
        }),
        makeIssue('closed', {
          created_at: '2023-01-01T00:00:00Z',
          closed_at: '2023-01-04T00:00:00Z', // 72h
        }),
        makeIssue('open'),
      ],
    );

    expect(h.issuesConsidered).toBe(3);
    expect(h.closedIssues).toBe(2);
    expect(h.openIssues).toBe(1);
    expect(h.issueCloseRate).toBeCloseTo(2 / 3, 10);
    expect(h.medianCloseHours).toBe(48);
  });
});

describe('computeIssuePrHealth — empty windows', () => {
  it('returns null rates and latencies with nothing to measure', () => {
    const h = computeIssuePrHealth([], []);
    expect(h).toMatchObject({
      prsConsidered: 0,
      mergedPrs: 0,
      closedPrs: 0,
      prMergeRate: null,
      medianMergeHours: null,
      issuesConsidered: 0,
      issueCloseRate: null,
      medianCloseHours: null,
    });
  });
});

describe('analyzeRepo — health insights', () => {
  it('surfaces PR throughput and issue responsiveness insights', () => {
    const titles = analyzeRepo(makeBundle()).insights.map((i) => i.title);
    expect(titles).toContain('Pull request throughput');
    expect(titles).toContain('Issue responsiveness');
  });

  it('omits them when there is no PR or issue activity', () => {
    const titles = analyzeRepo(makeBundle({ pulls: [], issues: [] })).insights.map(
      (i) => i.title,
    );
    expect(titles).not.toContain('Pull request throughput');
    expect(titles).not.toContain('Issue responsiveness');
  });
});

describe('health surfaced into stats, DNA and export', () => {
  it('promotes the health bag onto RepoStats', () => {
    const bundle = makeBundle();
    const stats = analyzeRepo(bundle).stats;
    expect(stats.health).toEqual(
      computeIssuePrHealth(bundle.pulls, bundle.issues),
    );
  });

  it('rewards a high PR merge rate in the Maintenance score', () => {
    const merged = Array.from({ length: 6 }, () => makePull('closed', true));
    const rejected = Array.from({ length: 6 }, () => makePull('closed', false));
    const high = maintenanceScore(makeBundle({ pulls: merged }));
    const low = maintenanceScore(makeBundle({ pulls: rejected }));
    expect(high).toBeGreaterThan(low);
  });

  it('adds a "Project health" section to the exported Markdown', () => {
    const analysis = analyzeRepo(makeBundle());
    const md = buildReportMarkdown(
      analysis,
      generateLore(analysis, 'documentary'),
      dictionaries.en,
      'https://example.test',
    );
    expect(md).toContain('## Project health');
    expect(md).toContain('PR merge rate');
  });

  it('omits the health section when there is no PR or issue activity', () => {
    const analysis = analyzeRepo(makeBundle({ pulls: [], issues: [] }));
    const md = buildReportMarkdown(
      analysis,
      generateLore(analysis, 'documentary'),
      dictionaries.en,
      'https://example.test',
    );
    expect(md).not.toContain('## Project health');
  });
});
