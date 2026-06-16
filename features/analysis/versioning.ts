import type { GitHubRelease } from '@/types/github';
import type { VersioningProfile } from '@/types/analysis';
import { parseSemver } from './helpers';

/**
 * Infer the project's versioning shape from its (chronologically ordered)
 * releases. Bumps are counted between consecutive semver-parseable tags; tags
 * that don't parse, or that move backwards (e.g. a back-ported patch), are
 * ignored rather than counted.
 */
export function computeVersioning(releases: GitHubRelease[]): VersioningProfile {
  const parsed = releases
    .map((r) => ({ tag: r.tag_name, sv: parseSemver(r.tag_name) }))
    .filter((x): x is { tag: string; sv: NonNullable<typeof x.sv> } => x.sv !== null);

  let majorBumps = 0;
  let minorBumps = 0;
  let patchBumps = 0;
  for (let i = 1; i < parsed.length; i++) {
    const prev = parsed[i - 1]!.sv;
    const cur = parsed[i]!.sv;
    if (cur.major > prev.major) majorBumps += 1;
    else if (cur.major === prev.major && cur.minor > prev.minor) minorBumps += 1;
    else if (
      cur.major === prev.major &&
      cur.minor === prev.minor &&
      cur.patch > prev.patch
    )
      patchBumps += 1;
  }

  const prereleases = releases.filter((r) => r.prerelease).length;

  return {
    releaseCount: releases.length,
    reachedV1: parsed.some((v) => v.sv.major >= 1),
    latestVersion: parsed.length ? parsed[parsed.length - 1]!.tag : null,
    majorBumps,
    minorBumps,
    patchBumps,
    prereleaseRatio: releases.length ? prereleases / releases.length : 0,
  };
}
