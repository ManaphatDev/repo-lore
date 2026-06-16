import { describe, expect, it } from 'vitest';

import { computeDevRhythm } from '@/features/analysis/rhythm';
import { makeCommit } from './fixtures';

describe('computeDevRhythm', () => {
  it('detects acceleration when commits cluster late in the window', () => {
    const r = computeDevRhythm([
      makeCommit('a', '2023-01-01T00:00:00Z'),
      makeCommit('b', '2023-03-01T00:00:00Z'),
      makeCommit('c', '2023-03-02T00:00:00Z'),
      makeCommit('d', '2023-03-03T00:00:00Z'),
      makeCommit('e', '2023-03-04T00:00:00Z'),
    ]);
    expect(r.trend).toBe('accelerating');
  });

  it('detects cooling when commits cluster early', () => {
    const r = computeDevRhythm([
      makeCommit('a', '2023-01-01T00:00:00Z'),
      makeCommit('b', '2023-01-02T00:00:00Z'),
      makeCommit('c', '2023-01-03T00:00:00Z'),
      makeCommit('d', '2023-01-04T00:00:00Z'),
      makeCommit('e', '2023-03-01T00:00:00Z'),
    ]);
    expect(r.trend).toBe('cooling');
  });

  it('measures weekend ratio and the longest consecutive streak', () => {
    const r = computeDevRhythm([
      makeCommit('a', '2023-01-07T12:00:00Z'), // Sat
      makeCommit('b', '2023-01-08T12:00:00Z'), // Sun
      makeCommit('c', '2023-01-09T12:00:00Z'), // Mon
      makeCommit('d', '2023-01-10T12:00:00Z'), // Tue
    ]);
    expect(r.weekendRatio).toBeCloseTo(0.5, 6);
    expect(r.longestStreakDays).toBe(4);
  });

  it('handles an empty commit list', () => {
    expect(computeDevRhythm([])).toMatchObject({
      weekendRatio: 0,
      trend: 'steady',
      longestStreakDays: 0,
    });
  });
});
