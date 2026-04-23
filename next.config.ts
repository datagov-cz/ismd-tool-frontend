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
    const beUrl = process.env.BE_URL ?? '';
    return [
      { source: '/v3/api-docs', destination: `${beUrl}/v3/api-docs` },
      {
        source: '/v3/api-docs/:path*',
        destination: `${beUrl}/v3/api-docs/:path*`,
      },
      { source: '/swagger-ui', destination: `${beUrl}/swagger-ui` },
      {
        source: '/swagger-ui/:path*',
        destination: `${beUrl}/swagger-ui/:path*`,
      },
      { source: '/api-docs', destination: `${beUrl}/api-docs` },
      { source: '/api-docs/:path*', destination: `${beUrl}/api-docs/:path*` },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withMDX(nextConfig));
