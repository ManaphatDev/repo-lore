/** Pure GitHub repo reference parsing — safe to import on client or server. */

export interface RepoRef {
  owner: string;
  repo: string;
}

const RESERVED = new Set([
  'orgs',
  'sponsors',
  'topics',
  'collections',
  'trending',
  'marketplace',
  'features',
  'about',
  'pricing',
  'settings',
  'notifications',
  'login',
  'join',
]);

/**
 * Accepts any of:
 *   https://github.com/facebook/react
 *   github.com/facebook/react.git
 *   facebook/react
 *   git@github.com:facebook/react.git
 */
export function parseRepoInput(input: string): RepoRef | null {
  if (!input) return null;
  let value = input.trim();

  const ssh = value.match(/git@github\.com:([^/]+)\/(.+)/i);
  if (ssh) return normalizeRef(ssh[1]!, ssh[2]!);

  value = value
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/^github\.com\//i, '');

  const parts = value.split('/').filter(Boolean);
  if (parts.length < 2) return null;

  const [owner, repo] = parts;
  if (!owner || !repo) return null;
  if (RESERVED.has(owner.toLowerCase())) return null;

  return normalizeRef(owner, repo);
}

function normalizeRef(owner: string, repo: string): RepoRef | null {
  const cleanOwner = owner.trim();
  const cleanRepo = repo
    .replace(/\.git$/i, '')
    .replace(/[#?].*$/, '')
    .trim();
  const valid = /^[A-Za-z0-9-._]+$/;
  if (!valid.test(cleanOwner) || !valid.test(cleanRepo)) return null;
  return { owner: cleanOwner, repo: cleanRepo };
}

export function toSlug(ref: RepoRef): string {
  return `${ref.owner}/${ref.repo}`;
}
