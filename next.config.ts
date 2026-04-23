import createMDX from '@next/mdx';
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '/popisujeme',
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    mdxRs: true,
  },
  async rewrites() {
    return [
      { source: '/v3/api-docs', destination: '/api/backend/v3/api-docs' },
      {
        source: '/v3/api-docs/:path*',
        destination: '/api/backend/v3/api-docs/:path*',
      },
      { source: '/swagger-ui', destination: '/api/backend/swagger-ui' },
      {
        source: '/swagger-ui/:path*',
        destination: '/api/backend/swagger-ui/:path*',
      },
      { source: '/api-docs', destination: '/api/backend/api-docs' },
      {
        source: '/api-docs/:path*',
        destination: '/api/backend/api-docs/:path*',
      },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withMDX(nextConfig));
