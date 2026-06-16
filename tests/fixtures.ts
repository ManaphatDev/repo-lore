/**
 * Builders for the GitHub data shapes the analysis engine consumes.
 *
 * Dates are expressed relative to "now" (`daysAgo` / `yearsAgo`) so that tests
 * which depend on recency (last push, release recency) stay stable over time.
 */

import type {
  GitHubCommit,
  GitHubContributor,
  GitHubIssue,
  GitHubOwner,
  GitHubPull,
  GitHubRelease,
  GitHubRepo,
  RepoDataBundle,
} from '@/types/github';

const DAY = 86_400_000;

export function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAY).toISOString();
}

export function yearsAgo(n: number): string {
  return daysAgo(Math.round(n * 365));
}

export function makeOwner(overrides: Partial<GitHubOwner> = {}): GitHubOwner {
  return {
    login: 'octocat',
    avatar_url: 'https://avatars.example/octocat.png',
    html_url: 'https://github.com/octocat',
    type: 'User',
    ...overrides,
  };
}

export function makeRepo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    id: 1,
    name: 'demo',
    full_name: 'octocat/demo',
    owner: makeOwner(),
    html_url: 'https://github.com/octocat/demo',
    description: 'A demonstration repository.',
    homepage: 'https://demo.example',
    fork: false,
    created_at: yearsAgo(3),
    updated_at: daysAgo(3),
    pushed_at: daysAgo(3),
    stargazers_count: 1_000,
    watchers_count: 1_000,
    forks_count: 200,
    open_issues_count: 12,
    subscribers_count: 40,
    network_count: 200,
    size: 4_096,
    language: 'TypeScript',
    topics: ['cli', 'typescript', 'tooling'],
    license: { key: 'mit', name: 'MIT License', spdx_id: 'MIT' },
    default_branch: 'main',
    archived: false,
    ...overrides,
  };
}

export function makeContributor(
  login: string,
  contributions: number,
  overrides: Partial<GitHubContributor> = {},
): GitHubContributor {
  return {
    login,
    id: login.length,
    avatar_url: `https://avatars.example/${login}.png`,
    html_url: `https://github.com/${login}`,
    contributions,
    type: 'User',
    ...overrides,
  };
}

export function makeCommit(
  message: string,
  date: string,
  overrides: Partial<GitHubCommit> = {},
): GitHubCommit {
  const author = { name: 'octocat', email: 'octo@example.com', date };
  return {
    sha: Math.random().toString(16).slice(2),
    html_url: 'https://github.com/octocat/demo/commit/abc',
    commit: { message, author, committer: author },
    author: makeOwner(),
    ...overrides,
  };
}

export function makeRelease(
  tag: string,
  publishedAt: string | null,
  overrides: Partial<GitHubRelease> = {},
): GitHubRelease {
  return {
    id: tag.length,
    tag_name: tag,
    name: tag,
    body: 'Release notes describing what changed in this version.',
    draft: false,
    prerelease: false,
    created_at: publishedAt ?? daysAgo(1),
    published_at: publishedAt,
    html_url: `https://github.com/octocat/demo/releases/${tag}`,
    author: makeOwner(),
    ...overrides,
  };
}

export function makePull(
  state: 'open' | 'closed',
  merged: boolean,
  overrides: Partial<GitHubPull> = {},
): GitHubPull {
  return {
    id: Math.floor(Math.random() * 1e6),
    number: Math.floor(Math.random() * 1e4),
    title: 'A pull request',
    state,
    created_at: daysAgo(20),
    updated_at: daysAgo(5),
    closed_at: state === 'closed' ? daysAgo(5) : null,
    merged_at: merged ? daysAgo(5) : null,
    user: makeOwner(),
    ...overrides,
  };
}

export function makeIssue(
  state: 'open' | 'closed',
  overrides: Partial<GitHubIssue> = {},
): GitHubIssue {
  return {
    id: Math.floor(Math.random() * 1e6),
    number: Math.floor(Math.random() * 1e4),
    title: 'An issue',
    state,
    created_at: daysAgo(30),
    updated_at: daysAgo(4),
    closed_at: state === 'closed' ? daysAgo(4) : null,
    comments: 2,
    user: makeOwner(),
    labels: ['bug'],
    ...overrides,
  };
}

/** A realistic, well-rounded bundle. Override any slice for a specific test. */
export function makeBundle(overrides: Partial<RepoDataBundle> = {}): RepoDataBundle {
  return {
    repo: makeRepo(),
    languages: { TypeScript: 8_000, JavaScript: 2_000 },
    contributors: [
      makeContributor('alice', 120),
      makeContributor('bob', 60),
      makeContributor('carol', 30),
      makeContributor('dave', 10),
    ],
    commits: [
      makeCommit('feat: add export button', daysAgo(2)),
      makeCommit('feat: support SSH urls', daysAgo(5)),
      makeCommit('fix: crash on empty repo', daysAgo(8)),
      makeCommit('docs: update README', daysAgo(11)),
      makeCommit('test: cover parse-repo', daysAgo(14)),
      makeCommit('chore: bump deps', daysAgo(18)),
    ],
    releases: [
      makeRelease('v1.0.0', daysAgo(40)),
      makeRelease('v1.1.0', daysAgo(30)),
      makeRelease('v1.2.0', daysAgo(20)),
      makeRelease('v1.3.0', daysAgo(10)),
    ],
    pulls: [makePull('open', false), makePull('closed', true), makePull('closed', true)],
    issues: [makeIssue('closed'), makeIssue('closed'), makeIssue('open')],
    fetchedAt: new Date().toISOString(),
    notes: [],
    ...overrides,
  };
}
