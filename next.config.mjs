import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  publicRuntimeConfig: {
    backendUrl: process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:8080',
  },
  experimental: {
    mdxRs: true,
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withMDX(nextConfig));
