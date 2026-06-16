import 'server-only';

import type {
  GitHubCommit,
  GitHubContributor,
  GitHubIssue,
  GitHubLanguages,
  GitHubPull,
  GitHubRelease,
  GitHubRepo,
  RepoDataBundle,
} from '@/types/github';
import type { AnalyzeError } from '@/types';
import { parseRepoInput, type RepoRef } from '@/lib/parse-repo';

export { parseRepoInput, type RepoRef } from '@/lib/parse-repo';

export interface TrendingRepo {
  slug: string;
  owner: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
}

const API = 'https://api.github.com';

/** Error carrying a code that maps cleanly onto the API/UI error contract. */
export class GitHubServiceError extends Error {
  constructor(
    public code: AnalyzeError['code'],
    message: string,
    public status = 500,
    public hint?: string,
  ) {
    super(message);
    this.name = 'GitHubServiceError';
  }

  toResponse(): AnalyzeError {
    return {
      ok: false,
      status: this.status,
      code: this.code,
      message: this.message,
      hint: this.hint,
    };
  }
}

// ---------------------------------------------------------------------------
// Low-level fetch
// ---------------------------------------------------------------------------

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'repository-lore-generator',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

interface FetchOptions {
  /** Treat these statuses as "soft empty" — return null instead of throwing. */
  softStatuses?: number[];
  revalidate?: number;
}

async function gh<T>(path: string, opts: FetchOptions = {}): Promise<T | null> {
  const { softStatuses = [], revalidate = 600 } = opts;
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      headers: headers(),
      next: { revalidate, tags: ['github'] },
    });
  } catch {
    throw new GitHubServiceError(
      'network_error',
      'Could not reach GitHub. Check your connection and try again.',
      502,
    );
  }

  if (res.ok) {
    if (res.status === 204) return null;
    return (await res.json()) as T;
  }

  if (softStatuses.includes(res.status)) return null;

  if (res.status === 404) {
    throw new GitHubServiceError(
      'not_found',
      'That repository does not exist or is private.',
      404,
      'Double-check the owner and repository name — only public repositories can be analyzed.',
    );
  }

  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining === '0' || res.status === 429) {
      const reset = res.headers.get('x-ratelimit-reset');
      const resetIn = reset
        ? Math.max(0, Math.round(Number(reset) * 1000 - Date.now()) / 60000)
        : null;
      throw new GitHubServiceError(
        'rate_limited',
        'GitHub API rate limit reached.',
        429,
        process.env.GITHUB_TOKEN
          ? `Try again${resetIn ? ` in about ${Math.ceil(resetIn)} min` : ' shortly'}.`
          : 'Add a GITHUB_TOKEN environment variable to raise the limit from 60 to 5,000 requests/hour.',
      );
    }
    throw new GitHubServiceError(
      'server_error',
      'GitHub refused the request (403). The token may be invalid.',
      403,
    );
  }

  throw new GitHubServiceError(
    'server_error',
    `GitHub responded with an unexpected status (${res.status}).`,
    502,
  );
}

// ---------------------------------------------------------------------------
// High-level orchestration
// ---------------------------------------------------------------------------

const PER_PAGE = 100;

export async function fetchTrendingRepos(limit = 6): Promise<TrendingRepo[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const q = encodeURIComponent(`stars:>1000 pushed:>${since}`);
  type SearchResult = {
    items: Array<{
      full_name: string;
      owner: { login: string };
      name: string;
      description: string | null;
      language: string | null;
      stargazers_count: number;
    }>;
  };
  const data = await gh<SearchResult>(
    `/search/repositories?q=${q}&sort=stars&order=desc&per_page=${limit}`,
    { revalidate: 21600 },
  ).catch(() => null);

  if (!data?.items?.length) return [];
  return data.items.map((r) => ({
    slug: r.full_name,
    owner: r.owner.login,
    name: r.name,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
  }));
}

export async function fetchRepoData(ref: RepoRef): Promise<RepoDataBundle> {
  const base = `/repos/${ref.owner}/${ref.repo}`;
  const notes: string[] = [];

  // The repository itself is the only hard requirement.
  const repo = await gh<GitHubRepo>(base);
  if (!repo) {
    throw new GitHubServiceError('not_found', 'Repository not found.', 404);
  }
  if (repo.size === 0) {
    throw new GitHubServiceError(
      'empty_repository',
      'This repository is empty — there is no history to narrate yet.',
      422,
      'Pick a repository that has at least a few commits.',
    );
  }

  // Everything else is best-effort and parallelized.
  const [languages, contributors, commits, releases, pulls, issues] =
    await Promise.all([
      gh<GitHubLanguages>(`${base}/languages`).catch(() => null),
      gh<GitHubContributor[]>(
        `${base}/contributors?per_page=${PER_PAGE}&anon=0`,
        { softStatuses: [403, 204] },
      ).catch(() => null),
      gh<GitHubCommit[]>(`${base}/commits?per_page=${PER_PAGE}`, {
        softStatuses: [409, 403],
      }).catch(() => null),
      gh<GitHubRelease[]>(`${base}/releases?per_page=${PER_PAGE}`).catch(
        () => null,
      ),
      gh<GitHubPull[]>(
        `${base}/pulls?state=all&per_page=${PER_PAGE}&sort=updated&direction=desc`,
      ).catch(() => null),
      gh<GitHubIssue[]>(
        `${base}/issues?state=all&per_page=${PER_PAGE}&sort=created&direction=desc`,
      ).catch(() => null),
    ]);

  if (!contributors?.length)
    notes.push('Contributor statistics were unavailable or still computing.');
  if (!commits?.length)
    notes.push('Recent commit history could not be retrieved.');
  if ((commits?.length ?? 0) >= PER_PAGE)
    notes.push(
      `Analysis is based on the ${PER_PAGE} most recent commits (GitHub API window).`,
    );

  // Issues endpoint returns PRs too; strip them out.
  const realIssues = (issues ?? []).filter((i) => !i.pull_request);

  if (!commits?.length && !contributors?.length) {
    throw new GitHubServiceError(
      'empty_repository',
      'No commit or contributor activity was found for this repository.',
      422,
    );
  }

  return {
    repo,
    languages: languages ?? {},
    contributors: contributors ?? [],
    commits: commits ?? [],
    releases: (releases ?? []).filter((r) => !r.draft),
    pulls: pulls ?? [],
    issues: realIssues,
    fetchedAt: new Date().toISOString(),
    notes,
  };
}
