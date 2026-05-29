import createMDX from '@next/mdx';
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/popisujeme';

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath,
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    mdxRs: true,
  },
  async rewrites() {
    return [
      // NOTE: the root /favicon.ico 404 (browsers probe the origin root,
      // ignoring basePath) is intentionally NOT handled here. A basePath:false
      // rewrite back into the basePath is rejected by Next (requires an
      // absolute external URL), and in prod the root request never reaches Next
      // anyway — the client nginx edge / AppGW default-redirect-to-/validujeme
      // own it. Accepted tech debt.
      // Swagger / OpenAPI paths route through /api/backend so the proxy can
      // strip Spring Boot's X-Frame-Options: DENY (would otherwise block the
      // iframe). The handler skips auth for these paths so swagger works even
      // when Keycloak is not running.
      { source: '/v3/api-docs', destination: '/api/backend/v3/api-docs' },
      {
        source: '/v3/api-docs/:path*',
        destination: '/api/backend/v3/api-docs/:path*',
      },
      {
        source: '/swagger-ui/:path*',
        destination: '/api/backend/swagger-ui/:path*',
      },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withMDX(nextConfig));
