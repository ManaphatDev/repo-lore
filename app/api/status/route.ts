import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RateLimitResponse {
  resources?: {
    core?: { limit: number; remaining: number; reset: number; used: number };
  };
  rate?: { limit: number; remaining: number; reset: number; used: number };
}

/**
 * GET /api/status
 * Live diagnostics: GitHub API reachability + rate limit + token validity,
 * and whether the optional OpenAI prose enhancement is configured.
 * Uses GitHub's /rate_limit endpoint, which does NOT consume the rate budget.
 */
export async function GET() {
  const tokenConfigured = Boolean(process.env.GITHUB_TOKEN);
  const aiAvailable = Boolean(
    process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL,
  );
  const aiModel = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const aiBase = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'repository-lore-generator',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  let github: {
    reachable: boolean;
    tokenConfigured: boolean;
    tokenValid: boolean;
    authenticated: boolean;
    limit: number;
    remaining: number;
    used: number;
    resetAt: string | null;
    resetInSeconds: number | null;
    message: string;
  };

  try {
    const res = await fetch('https://api.github.com/rate_limit', {
      headers,
      cache: 'no-store',
    });

    if (res.status === 401) {
      github = {
        reachable: true,
        tokenConfigured,
        tokenValid: false,
        authenticated: false,
        limit: 0,
        remaining: 0,
        used: 0,
        resetAt: null,
        resetInSeconds: null,
        message: 'GitHub rejected the token (401). Check that GITHUB_TOKEN is valid.',
      };
    } else if (!res.ok) {
      github = {
        reachable: true,
        tokenConfigured,
        tokenValid: false,
        authenticated: false,
        limit: 0,
        remaining: 0,
        used: 0,
        resetAt: null,
        resetInSeconds: null,
        message: `GitHub responded with status ${res.status}.`,
      };
    } else {
      const data = (await res.json()) as RateLimitResponse;
      const core = data.resources?.core ?? data.rate;
      const limit = core?.limit ?? 0;
      const remaining = core?.remaining ?? 0;
      const used = core?.used ?? 0;
      const reset = core?.reset ?? null;
      const authenticated = limit > 60;
      github = {
        reachable: true,
        tokenConfigured,
        tokenValid: tokenConfigured && authenticated,
        authenticated,
        limit,
        remaining,
        used,
        resetAt: reset ? new Date(reset * 1000).toISOString() : null,
        resetInSeconds: reset
          ? Math.max(0, Math.round(reset - Date.now() / 1000))
          : null,
        message: authenticated
          ? 'Authenticated — 5,000 requests/hour.'
          : 'Anonymous — 60 requests/hour. Add a GITHUB_TOKEN to raise the limit.',
      };
    }
  } catch {
    github = {
      reachable: false,
      tokenConfigured,
      tokenValid: false,
      authenticated: false,
      limit: 0,
      remaining: 0,
      used: 0,
      resetAt: null,
      resetInSeconds: null,
      message: 'Could not reach the GitHub API.',
    };
  }

  return NextResponse.json(
    {
      ok: github.reachable,
      checkedAt: new Date().toISOString(),
      github,
      ai: {
        available: aiAvailable,
        model: aiAvailable ? aiModel : null,
        endpoint: aiAvailable ? aiBase : null,
      },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
