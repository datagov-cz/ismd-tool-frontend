export const dynamic = 'force-dynamic';

import '../styles/globals.css';

import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import Script from 'next/script';
import { getServerSession } from 'next-auth';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import type { EnvironmentVariables } from '@/components/contexts/Environment';
import { Footer } from '@/components/footer/Footer';
import { Header } from '@/components/header/Header';
import { authOptions } from '@/lib/auth';
import { GATED_REQUEST_HEADER } from '@/lib/site-status';
import { parseTheme, THEME_COOKIE } from '@/lib/theme';

import Providers from './providers';

export const metadata: Metadata = {
  title: 'ISMD - Nástroj',
  description: 'Informační systém pro modelování dat - Nástroj',
};

const loadEnvVariables = () => {
  return {
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? undefined,
    environment: process.env.environment ?? 'development',
  };
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const session = await getServerSession(authOptions);
  const requestHeaders = await headers();
  const isGated = requestHeaders.get(GATED_REQUEST_HEADER) === '1';
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  const variables: EnvironmentVariables = {
    ...loadEnvVariables(),
  };

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/popisujeme';

  return (
    <html lang={locale} data-theme={theme}>
      <body>
        <Script id="gov-ds-config" strategy="beforeInteractive">
          {`window.GOV_DS_CONFIG = { iconsPath: '${basePath}/assets/icons' };`}
        </Script>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers
            environmentVariables={variables}
            session={session}
            initialTheme={theme}
          >
            <Header session={session} isGated={isGated} />
            {children}
          </Providers>
          <Footer isGated={isGated} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
