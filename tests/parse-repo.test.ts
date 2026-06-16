import { describe, expect, it } from 'vitest';

import { parseRepoInput, toSlug } from '@/lib/parse-repo';

describe('parseRepoInput', () => {
  it('accepts every documented input shape as facebook/react', () => {
    const inputs = [
      'https://github.com/facebook/react',
      'http://github.com/facebook/react',
      'https://www.github.com/facebook/react',
      'github.com/facebook/react',
      'github.com/facebook/react.git',
      'facebook/react',
      'git@github.com:facebook/react.git',
      '  facebook/react  ',
      'https://github.com/facebook/react/tree/main/packages',
      'https://github.com/facebook/react?tab=readme',
      'https://github.com/facebook/react#readme',
    ];
    for (const input of inputs) {
      expect(parseRepoInput(input), input).toEqual({
        owner: 'facebook',
        repo: 'react',
      });
    }
  });

  it('preserves dots, dashes and underscores in names', () => {
    expect(parseRepoInput('vuejs/vue-router')).toEqual({
      owner: 'vuejs',
      repo: 'vue-router',
    });
    expect(parseRepoInput('expressjs/express.js')).toEqual({
      owner: 'expressjs',
      repo: 'express.js',
    });
    expect(parseRepoInput('a_b/c.d-e')).toEqual({ owner: 'a_b', repo: 'c.d-e' });
  });

  it('rejects empty, whitespace and single-segment input', () => {
    expect(parseRepoInput('')).toBeNull();
    expect(parseRepoInput('   ')).toBeNull();
    expect(parseRepoInput('facebook')).toBeNull();
    expect(parseRepoInput('https://github.com/facebook')).toBeNull();
  });

  it('rejects reserved GitHub owner paths', () => {
    expect(parseRepoInput('https://github.com/orgs/facebook')).toBeNull();
    expect(parseRepoInput('settings/profile')).toBeNull();
    expect(parseRepoInput('SPONSORS/foo')).toBeNull(); // case-insensitive
  });

  it('rejects owners/repos with illegal characters', () => {
    expect(parseRepoInput('foo bar/baz')).toBeNull();
    expect(parseRepoInput('foo/bar baz')).toBeNull();
    expect(parseRepoInput('foo/bar@baz')).toBeNull();
  });
});

describe('toSlug', () => {
  it('joins owner and repo with a slash', () => {
    expect(toSlug({ owner: 'facebook', repo: 'react' })).toBe('facebook/react');
  });
});
