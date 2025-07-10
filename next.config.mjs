import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    backendUrl: process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:8080',
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
