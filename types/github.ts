/**
 * Minimal, hand-written shapes for the subset of the GitHub REST API the app
 * consumes. We intentionally only model the fields we read.
 */

export interface GitHubOwner {
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubOwner;
  html_url: string;
  description: string | null;
  homepage: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count?: number;
  network_count?: number;
  size: number;
  language: string | null;
  topics: string[];
  license: { key: string; name: string; spdx_id: string } | null;
  default_branch: string;
  archived: boolean;
}

export interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

export interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; email: string; date: string } | null;
    committer: { name: string; email: string; date: string } | null;
  };
  author: GitHubOwner | null;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string | null;
  html_url: string;
  author: GitHubOwner | null;
}

export interface GitHubPull {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  user: GitHubOwner | null;
  draft?: boolean;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  comments: number;
  user: GitHubOwner | null;
  /** present on issues that are actually pull requests */
  pull_request?: unknown;
  labels: Array<{ name: string; color: string } | string>;
}

export type GitHubLanguages = Record<string, number>;

/** Raw bundle of everything fetched from GitHub for a single repository. */
export interface RepoDataBundle {
  repo: GitHubRepo;
  languages: GitHubLanguages;
  contributors: GitHubContributor[];
  commits: GitHubCommit[];
  releases: GitHubRelease[];
  pulls: GitHubPull[];
  issues: GitHubIssue[];
  fetchedAt: string;
  /** Non-fatal notes, e.g. "commit history truncated" or "stats unavailable". */
  notes: string[];
}
