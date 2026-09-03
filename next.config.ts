import createMDX from '@next/mdx';
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/popisujeme';

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath,
  pageExtensions: ['ts', 'tsx', 'mdx'],
  // Keep the Azure Monitor OpenTelemetry distro out of the webpack bundle. Its
  // auto-instrumentation hooks Node's module loader (require-in-the-middle),
  // which only works when the package is required from node_modules at runtime
  // rather than bundled. See src/instrumentation.node.ts.
  serverExternalPackages: ['@azure/monitor-opentelemetry'],
  // @gov-design-system-ce/react v4 fetches icons from a hard-coded
  // '/assets/icons' with no configuration hook, which ignores basePath. Swap
  // its fetch helper for one that prefixes the basePath.
  webpack: (config, { webpack }) => {
    // patches/@gov-design-system-ce+react+4.7.0.patch edits files inside
    // node_modules, which webpack otherwise snapshots as immutable and serves
    // from .next/cache until the package version changes. Take that package
    // out of managedPaths so the patch is picked up.
    config.snapshot = {
      ...config.snapshot,
      managedPaths: [/^(.+?[\\/]node_modules[\\/])(?!@gov-design-system-ce)/],
    };
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^\.\.\/utils\/icon$/,
        (resource: { context: string; request: string }) => {
          if (resource.context.includes('@gov-design-system-ce')) {
            resource.request = path.resolve('src/lib/govIconFetch.ts');
          }
        },
      ),
    );
    return config;
  },
  // GovIcon fetches every icon over HTTP at runtime, so without this each
  // navigation re-requests the whole set. The URLs are name-addressed and the
  // set only changes on deploy.
  async headers() {
    return [
      {
        source: '/assets/icons/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ];
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
