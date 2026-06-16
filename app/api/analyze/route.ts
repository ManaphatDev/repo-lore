import { NextResponse, type NextRequest } from 'next/server';

import { runAnalysis } from '@/services/analyze';

export const runtime = 'nodejs';
// Cache identical analyses for 10 minutes at the edge.
export const revalidate = 600;

/**
 * GET /api/analyze?repo=facebook/react
 * Returns the full RepoAnalysis as JSON. Fully stateless — nothing is stored.
 */
export async function GET(req: NextRequest) {
  const repo =
    req.nextUrl.searchParams.get('repo') ??
    req.nextUrl.searchParams.get('url') ??
    '';

  if (!repo.trim()) {
    return NextResponse.json(
      {
        ok: false,
        status: 400,
        code: 'invalid_url',
        message: 'Provide a repository via the ?repo= query parameter.',
      },
      { status: 400 },
    );
  }

  const result = await runAnalysis(repo);
  return NextResponse.json(result, {
    status: result.ok ? 200 : result.status,
    headers: {
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
    },
  });
}
