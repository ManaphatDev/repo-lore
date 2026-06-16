/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'github.com' },
    ],
  },
  experimental: {
    // Keep server bundles lean for the analysis/lore engines.
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default nextConfig;
