import { describe, expect, it } from 'vitest';

import {
  analyzeCommits,
  classifyCommit,
  median,
  parseSemver,
} from '@/features/analysis/helpers';
import { makeCommit } from './fixtures';

describe('classifyCommit', () => {
  it('labels conventional commit subjects', () => {
    expect(classifyCommit('feat: add export button')).toBe('feature');
    expect(classifyCommit('fix: crash on empty repo')).toBe('fix');
    expect(classifyCommit('docs: update README')).toBe('docs');
    expect(classifyCommit('test: cover parse-repo')).toBe('test');
    expect(classifyCommit('chore: bump deps')).toBe('maintenance');
    expect(classifyCommit('Merge pull request #5')).toBe('maintenance');
  });

  it('classifies only the subject line', () => {
    expect(classifyCommit('feat: thing\n\nfixes a bug along the way')).toBe('feature');
  });

  it('applies pattern priority (feature before fix)', () => {
    expect(classifyCommit('add fix for the parser')).toBe('feature');
  });

  it('falls back to "other"', () => {
    expect(classifyCommit('Update something unremarkable')).toBe('other');
    expect(classifyCommit('')).toBe('other');
  });
});

describe('parseSemver', () => {
  it('parses tags with and without a patch', () => {
    expect(parseSemver('v1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
    expect(parseSemver('1.2')).toEqual({ major: 1, minor: 2, patch: 0 });
    expect(parseSemver('release-2.0.1')).toEqual({ major: 2, minor: 0, patch: 1 });
  });

  it('returns null when there is no version', () => {
    expect(parseSemver('foo')).toBeNull();
    expect(parseSemver('')).toBeNull();
  });
});

describe('median', () => {
  it('handles odd, even and empty arrays', () => {
    expect(median([])).toBeNull();
    expect(median([5])).toBe(5);
    expect(median([1, 2, 3])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it('does not depend on input order', () => {
    expect(median([3, 1, 2])).toBe(2);
  });
});

describe('analyzeCommits', () => {
  const commits = [
    makeCommit('feat: a', '2023-01-10T00:00:00Z'),
    makeCommit('feat: b', '2023-01-20T00:00:00Z'),
    makeCommit('fix: c', '2023-02-05T00:00:00Z'),
    makeCommit('docs: d', '2023-03-01T00:00:00Z'),
  ];

  it('counts labels and derives ratios that sum to 1', () => {
    const r = analyzeCommits(commits);
    expect(r.total).toBe(4);
    expect(r.labels.feature).toBe(2);
    expect(r.labels.fix).toBe(1);
    expect(r.labels.docs).toBe(1);
    const ratioSum = Object.values(r.ratios).reduce((a, b) => a + b, 0);
    expect(ratioSum).toBeCloseTo(1, 10);
  });

  it('buckets commits by month in ascending order', () => {
    const r = analyzeCommits(commits);
    expect(r.monthly.map((m) => m.key)).toEqual(['2023-01', '2023-02', '2023-03']);
    expect(r.monthly[0]?.count).toBe(2);
    expect(r.busiestMonth?.key).toBe('2023-01');
    expect(r.firstDate).toBe('2023-01-10T00:00:00Z');
    expect(r.lastDate).toBe('2023-03-01T00:00:00Z');
    expect(Number.isFinite(r.perWeek)).toBe(true);
    expect(r.perWeek).toBeGreaterThan(0);
  });

  it('handles an empty commit list without dividing by zero', () => {
    const r = analyzeCommits([]);
    expect(r.total).toBe(0);
    expect(r.perWeek).toBe(0);
    expect(r.busiestMonth).toBeNull();
    expect(r.firstDate).toBeNull();
  });
});
