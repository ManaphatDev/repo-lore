export * from './github';
export * from './analysis';

/** Discriminated result returned by the GitHub service + API route. */
export type AnalyzeError = {
  ok: false;
  status: number;
  code:
    | 'invalid_url'
    | 'not_found'
    | 'rate_limited'
    | 'empty_repository'
    | 'network_error'
    | 'server_error';
  message: string;
  hint?: string;
};

import type { RepoAnalysis } from './analysis';

export type AnalyzeSuccess = {
  ok: true;
  analysis: RepoAnalysis;
};

export type AnalyzeResult = AnalyzeSuccess | AnalyzeError;
