import type { GitHubRelease, GitHubRepo, RepoDataBundle } from '@/types/github';
import type { CommitAnalysis } from './helpers';
import type {
  ContributorConcentration,
  DevRhythm,
  IssuePrHealth,
  VersioningProfile,
} from '@/types/analysis';

/** Pre-computed bundle of metrics shared by every analysis sub-module. */
export interface AnalysisContext {
  bundle: RepoDataBundle;
  repo: GitHubRepo;
  commits: CommitAnalysis;
  now: Date;

  ageDays: number;
  ageYears: number;
  daysSincePush: number;

  contributorsTotal: number;
  contributionsTotal: number;
  busFactor: number;

  totalLanguageBytes: number;
  topLanguageShare: number;

  releaseCount: number;
  releaseCadenceDays: number | null;
  sortedReleases: GitHubRelease[]; // ascending by published date

  openPulls: number;
  mergedPullsRecent: number;
  openIssuesRecent: number;
  closedIssuesRecent: number;
  health: IssuePrHealth;
  versioning: VersioningProfile;
  concentration: ContributorConcentration;
  rhythm: DevRhythm;

  stars: number;
  forks: number;
  watchers: number;
}
