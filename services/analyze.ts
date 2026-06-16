import 'server-only';

import { analyzeRepo } from '@/features/analysis/engine';
import type { AnalyzeResult } from '@/types';
import { fetchRepoData, GitHubServiceError, parseRepoInput } from './github';

/**
 * End-to-end pipeline: parse input → fetch from GitHub → analyze.
 * Always resolves to a discriminated result (never throws).
 */
export async function runAnalysis(input: string): Promise<AnalyzeResult> {
  const ref = parseRepoInput(input);
  if (!ref) {
    return {
      ok: false,
      status: 400,
      code: 'invalid_url',
      message: "That doesn't look like a GitHub repository.",
      hint: 'Use a format like https://github.com/owner/repo or simply owner/repo.',
    };
  }

  try {
    const bundle = await fetchRepoData(ref);
    const analysis = analyzeRepo(bundle);
    return { ok: true, analysis };
  } catch (err) {
    if (err instanceof GitHubServiceError) return err.toResponse();
    return {
      ok: false,
      status: 500,
      code: 'server_error',
      message: 'Something went wrong while analyzing the repository.',
      hint: 'Please try again in a moment.',
    };
  }
}
