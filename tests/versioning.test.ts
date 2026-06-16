import { describe, expect, it } from 'vitest';

import { computeVersioning } from '@/features/analysis/versioning';
import { makeRelease } from './fixtures';

describe('computeVersioning', () => {
  it('counts bumps between consecutive semver tags', () => {
    const v = computeVersioning([
      makeRelease('v0.9.0', '2023-01-01T00:00:00Z'),
      makeRelease('v1.0.0', '2023-02-01T00:00:00Z'), // major
      makeRelease('v1.1.0', '2023-03-01T00:00:00Z'), // minor
      makeRelease('v1.1.1', '2023-04-01T00:00:00Z'), // patch
    ]);
    expect(v.reachedV1).toBe(true);
    expect(v.majorBumps).toBe(1);
    expect(v.minorBumps).toBe(1);
    expect(v.patchBumps).toBe(1);
    expect(v.latestVersion).toBe('v1.1.1');
  });

  it('stays pre-1.0 and ignores unparseable tags', () => {
    const v = computeVersioning([
      makeRelease('nightly', '2023-01-01T00:00:00Z'),
      makeRelease('v0.1.0', '2023-02-01T00:00:00Z'),
      makeRelease('v0.2.0', '2023-03-01T00:00:00Z'),
    ]);
    expect(v.reachedV1).toBe(false);
    expect(v.minorBumps).toBe(1);
    expect(v.latestVersion).toBe('v0.2.0');
  });

  it('measures the pre-release ratio', () => {
    const v = computeVersioning([
      makeRelease('v1.0.0', '2023-01-01T00:00:00Z'),
      makeRelease('v1.1.0-rc.1', '2023-02-01T00:00:00Z', { prerelease: true }),
    ]);
    expect(v.prereleaseRatio).toBeCloseTo(0.5, 10);
  });

  it('handles an empty release list', () => {
    expect(computeVersioning([])).toMatchObject({
      releaseCount: 0,
      reachedV1: false,
      latestVersion: null,
    });
  });
});
