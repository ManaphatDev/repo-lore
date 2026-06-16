/** Domain model produced by the analysis engine and consumed by the UI. */

export interface RepoIdentity {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  ownerAvatar: string;
  ownerUrl: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  topics: string[];
  license: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  ageDays: number;
  ageLabel: string;
  archived: boolean;
}

export type DnaCategory =
  | 'Innovation'
  | 'Stability'
  | 'Community'
  | 'Growth'
  | 'Maintenance'
  | 'Documentation'
  | 'Testing';

export interface DnaScore {
  category: DnaCategory;
  score: number; // 0-100
  explanation: string;
}

export type TimelineKind =
  | 'genesis'
  | 'release'
  | 'milestone'
  | 'burst'
  | 'community'
  | 'maintenance'
  | 'present';

export interface TimelineEvent {
  id: string;
  date: string; // ISO
  label: string; // e.g. "Mar 2023"
  title: string;
  description: string;
  kind: TimelineKind;
  meta?: string;
}

export type ContributorRole =
  | 'The Architect'
  | 'The Feature Builder'
  | 'The Bug Hunter'
  | 'The Maintainer'
  | 'The Community Champion'
  | 'The Contributor';

export interface ContributorProfile {
  login: string;
  avatar: string;
  url: string;
  contributions: number;
  share: number; // percentage of total commits among ranked contributors
  role: ContributorRole;
  rationale: string;
}

export type MaturityStage =
  | 'Genesis'
  | 'Foundation'
  | 'Expansion'
  | 'Maturity'
  | 'Steward';

export interface MaturityAssessment {
  stage: MaturityStage;
  index: number; // 0-100
  summary: string;
}

export interface ChartSeries {
  commitActivity: Array<{ period: string; commits: number }>;
  contributorRanking: Array<{ name: string; commits: number }>;
  releaseTimeline: Array<{
    date: string;
    label: string;
    index: number;
    tag: string;
    prerelease: boolean;
  }>;
  languageDistribution: Array<{ name: string; value: number; share: number }>;
  growthMomentum: Array<{ period: string; momentum: number }>;
  commitHeatmap: Array<{ date: string; count: number }>;
}

/**
 * Responsiveness + throughput signals from the recent PR/issue windows (capped
 * at 100 by the GitHub API). Rates are 0..1; latencies are medians in hours, or
 * null when there is nothing to measure.
 */
export interface IssuePrHealth {
  prsConsidered: number;
  mergedPrs: number;
  closedPrs: number;
  prMergeRate: number | null;
  medianMergeHours: number | null;
  issuesConsidered: number;
  closedIssues: number;
  openIssues: number;
  issueCloseRate: number | null;
  medianCloseHours: number | null;
}

/** Semantic-versioning shape inferred from the release history. */
export interface VersioningProfile {
  releaseCount: number;
  reachedV1: boolean;
  latestVersion: string | null;
  majorBumps: number;
  minorBumps: number;
  patchBumps: number;
  prereleaseRatio: number; // 0..1
}

/** How concentrated contribution is among the people doing the work. */
export interface ContributorConcentration {
  gini: number; // 0 (perfectly even) .. 1 (one person)
  top1Share: number; // 0..1
  coreCount: number; // contributors above the mean
  casualCount: number; // contributors at or below the mean
}

/** Cadence + working-pattern signals from the recent commit window. */
export interface DevRhythm {
  weekendRatio: number; // 0..1 of commits on Sat/Sun
  trend: 'accelerating' | 'steady' | 'cooling';
  trendRatio: number; // recent-half commits / older-half commits
  longestStreakDays: number; // consecutive active calendar days
}

export interface RepoStats {
  totalContributors: number;
  totalReleases: number;
  recentCommits: number;
  openPulls: number;
  mergedPullsRecent: number;
  openIssuesRecent: number;
  closedIssuesRecent: number;
  commitsPerWeek: number;
  busFactor: number; // contributors accounting for >50% of work
  topLanguageShare: number;
  releaseCadenceDays: number | null;
  health: IssuePrHealth;
  versioning: VersioningProfile;
  concentration: ContributorConcentration;
  rhythm: DevRhythm;
}

export interface RepoInsight {
  icon: string; // lucide icon name
  title: string;
  detail: string;
  tone: 'gold' | 'verdigris' | 'oxblood' | 'muted';
}

/** Everything the UI needs. Fully serializable (server -> client). */
export interface RepoAnalysis {
  identity: RepoIdentity;
  stats: RepoStats;
  dna: DnaScore[];
  timeline: TimelineEvent[];
  contributors: ContributorProfile[];
  maturity: MaturityAssessment;
  charts: ChartSeries;
  insights: RepoInsight[];
  notes: string[];
  generatedAt: string;
}

/** ----- Lore (narrative) types ----- */

export type NarrativeMode =
  | 'documentary'
  | 'fantasy'
  | 'scifi'
  | 'corporate'
  | 'meme';

export interface LoreChapter {
  number: number;
  title: string;
  subtitle: string;
  paragraphs: string[];
}

export interface Lore {
  mode: NarrativeMode;
  title: string;
  logline: string;
  chapters: LoreChapter[];
}
