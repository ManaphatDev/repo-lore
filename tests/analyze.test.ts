import { afterEach, describe, expect, it, vi } from 'vitest';

import { runAnalysis } from '@/services/analyze';
import { makeCommit, makeContributor, makeRepo } from './fixtures';

/** Minimal Response stand-in covering the fields the GitHub client reads. */
function res(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
  } as unknown as Response;
}

afterEach(() => vi.unstubAllGlobals());

describe('runAnalysis — error contract (never throws)', () => {
  it('rejects unparseable input as invalid_url without fetching', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const r = await runAnalysis('not-a-repo');
    expect(r).toMatchObject({ ok: false, code: 'invalid_url', status: 400 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps 404 to not_found', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => res(404, {})));
    expect(await runAnalysis('owner/repo')).toMatchObject({
      ok: false,
      code: 'not_found',
    });
  });

  it('maps an exhausted rate limit to rate_limited', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => res(403, {}, { 'x-ratelimit-remaining': '0' })),
    );
    expect(await runAnalysis('owner/repo')).toMatchObject({
      ok: false,
      code: 'rate_limited',
    });
  });

  it('maps an empty repository to empty_repository', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => res(200, makeRepo({ size: 0 }))));
    expect(await runAnalysis('owner/repo')).toMatchObject({
      ok: false,
      code: 'empty_repository',
    });
  });

  it('maps a fetch failure to network_error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      }),
    );
    expect(await runAnalysis('owner/repo')).toMatchObject({
      ok: false,
      code: 'network_error',
    });
  });

  it('maps an unexpected status to server_error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => res(500, {})));
    expect(await runAnalysis('owner/repo')).toMatchObject({
      ok: false,
      code: 'server_error',
    });
  });

  it('resolves to ok with a full analysis on success', async () => {
    const repo = makeRepo();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/languages')) return res(200, { TypeScript: 100 });
        if (url.includes('/contributors'))
          return res(200, [makeContributor('alice', 50)]);
        if (url.includes('/commits'))
          return res(200, [makeCommit('feat: x', new Date().toISOString())]);
        if (url.includes('/releases')) return res(200, []);
        if (url.includes('/pulls')) return res(200, []);
        if (url.includes('/issues')) return res(200, []);
        return res(200, repo); // base /repos/owner/repo
      }),
    );
    const r = await runAnalysis('owner/repo');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.analysis.identity.name).toBe(repo.name);
  });
});
