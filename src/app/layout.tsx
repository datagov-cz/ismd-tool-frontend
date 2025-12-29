export const dynamic = 'force-dynamic';
// TODO: Fix useTranslation not gracefully handling missing localizations.
// It breaks npm run build, specifically the optimization for static pages
// Even more specifically, Layout is a server component, because it's an async function,
// but it needs to be rendered dynamically because of the client components it uses
import '../styles/globals.css';

import { ReactNode } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { getServerSession } from 'next-auth';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';

import type { EnvironmentVariables } from '@/components/contexts/Environment';
import { Footer } from '@/components/footer/Footer';
import { Header } from '@/components/header/Header';
import { authOptions } from '@/lib/auth';

import Providers from './providers';

export const metadata: Metadata = {
  title: 'ISMD - Nástroj',
  description: 'Informační systém pro modelování dat - Nástroj',
};

const loadEnvVariables = () => {
  // define any variables to be loaded on the node server to be passed to the client
  return {
    NEXT_PUBLIC_BE_URL: process.env.NEXT_PUBLIC_BE_URL ?? undefined,
    environment: process.env.environment ?? 'development',
  };
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();
  const session = await getServerSession(authOptions);

  const variables: EnvironmentVariables = {
    ...loadEnvVariables(),
  };

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/popisujeme';

  return (
    <html lang={locale}>
      <NextIntlClientProvider>
        <body>
          <Script id="gov-ds-config" strategy="beforeInteractive">
            {`window.GOV_DS_CONFIG = { iconsPath: '${basePath}/assets/icons' };`}
          </Script>
          <Providers environmentVariables={variables} session={session}>
            <Header session={session} />
            {children}
          </Providers>
          <Footer />
        </body>
      </NextIntlClientProvider>
    </html>
  );
}
