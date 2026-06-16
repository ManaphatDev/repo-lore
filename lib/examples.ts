export interface ExampleRepo {
  slug: string;
  name: string;
  owner: string;
  blurb: string;
  language: string;
  accent: 'gold' | 'verdigris' | 'oxblood';
}

export const EXAMPLE_REPOS: ExampleRepo[] = [
  {
    slug: 'facebook/react',
    name: 'react',
    owner: 'facebook',
    blurb:
      'A library that began as an internal experiment and reshaped how the web is built.',
    language: 'JavaScript',
    accent: 'gold',
  },
  {
    slug: 'vercel/next.js',
    name: 'next.js',
    owner: 'vercel',
    blurb:
      'The framework that turned React into a full-stack platform, release by release.',
    language: 'TypeScript',
    accent: 'verdigris',
  },
  {
    slug: 'microsoft/vscode',
    name: 'vscode',
    owner: 'microsoft',
    blurb:
      'An editor born in a few months that grew into the workshop of millions.',
    language: 'TypeScript',
    accent: 'oxblood',
  },
];

export const QUICK_PICKS = [
  'facebook/react',
  'vercel/next.js',
  'microsoft/vscode',
  'torvalds/linux',
];
