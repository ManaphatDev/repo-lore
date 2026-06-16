import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Repository Lore',
    short_name: 'Repo Lore',
    description:
      'Turn any GitHub repository into a narrated, timeline-based story.',
    start_url: '/',
    display: 'standalone',
    background_color: '#15110c',
    theme_color: '#15110c',
    icons: [{ src: '/logo.png', sizes: 'any', type: 'image/png' }],
  };
}
