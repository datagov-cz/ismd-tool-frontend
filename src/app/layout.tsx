export const dynamic = 'force-dynamic';

import '../styles/globals.css';

import { ReactNode } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { getServerSession } from 'next-auth';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

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

  const variables: EnvironmentVariables = {
    ...loadEnvVariables(),
  };

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/popisujeme';

  return (
    <html lang={locale}>
      <body>
        <Script id="gov-ds-config" strategy="beforeInteractive">
          {`window.GOV_DS_CONFIG = { iconsPath: '${basePath}/assets/icons' };`}
        </Script>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers environmentVariables={variables} session={session}>
            <Header session={session} />
            {children}
          </Providers>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
