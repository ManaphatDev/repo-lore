import { describe, expect, it } from 'vitest';

import {
  clamp,
  daysBetween,
  formatNumber,
  humanDuration,
  percent,
  plural,
  round,
} from '@/lib/format';

describe('formatNumber', () => {
  it('formats thousands and millions compactly', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(1_000)).toBe('1k');
    expect(formatNumber(1_500)).toBe('1.5k');
    expect(formatNumber(12_300)).toBe('12.3k');
    expect(formatNumber(1_000_000)).toBe('1M');
    expect(formatNumber(2_500_000)).toBe('2.5M');
  });

  it('returns "0" for non-finite values', () => {
    expect(formatNumber(Number.NaN)).toBe('0');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('0');
  });
});

describe('humanDuration', () => {
  it('describes spans from days to years', () => {
    expect(humanDuration(0)).toBe('today');
    expect(humanDuration(1)).toBe('1 day');
    expect(humanDuration(5)).toBe('5 days');
    expect(humanDuration(30)).toBe('1 month');
    expect(humanDuration(730)).toBe('2 years');
  });

  it('supports a Thai locale', () => {
    expect(humanDuration(0, 'th')).toBe('วันนี้');
    expect(humanDuration(5, 'th')).toBe('5 วัน');
  });
});

describe('daysBetween', () => {
  it('counts whole days between two ISO dates', () => {
    expect(daysBetween('2020-01-01T00:00:00Z', '2020-01-11T00:00:00Z')).toBe(10);
    expect(daysBetween('2020-01-11T00:00:00Z', '2020-01-01T00:00:00Z')).toBe(-10);
  });
});

describe('small math helpers', () => {
  it('plural', () => {
    expect(plural(1, 'commit')).toBe('commit');
    expect(plural(0, 'commit')).toBe('commits');
    expect(plural(2, 'commit')).toBe('commits');
  });

  it('clamp keeps values inside bounds', () => {
    expect(clamp(150)).toBe(100);
    expect(clamp(-5)).toBe(0);
    expect(clamp(50)).toBe(50);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('round respects decimal places', () => {
    expect(round(1.5)).toBe(2);
    expect(round(2.345, 1)).toBe(2.3);
    expect(round(1.2345, 2)).toBe(1.23);
  });

  it('percent is bounded to 0..100', () => {
    expect(percent(1, 4)).toBe(25);
    expect(percent(1, 0)).toBe(0);
    expect(percent(5, 4)).toBe(100);
  });
});
