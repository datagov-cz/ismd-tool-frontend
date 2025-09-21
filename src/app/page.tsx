'use client';

import { useTranslations } from 'next-intl';

import { MainControls } from '@/components/home/MainControls';
import { NewsSidebar } from '@/components/home/NewsSidebar';
import { WelcomeSection } from '@/components/home/WelcomeSection';
import { useUserStore } from '@/store/userStore';

export default function Home() {
  const t = useTranslations('Home');

  const user = useUserStore((state) => state.user);

  return (
    <div className="w-full max-w-desktop mx-auto px-3 xl:px-0 py-6 flex gap-x-4 gap-y-8 flex-col lg:flex-row">
      <NewsSidebar />
      <div className="mx-auto">
        <MainControls />
        {!user && (
          <>
            <div className="h-[1px] my-8 bg-dark-border" />
            <WelcomeSection />
          </>
        )}
        {user && (
          <div className="mt-8 space-y-5">
            <h3 className="text-xl font-medium">{t('LastVisited.Title')}</h3>
          </div>
        )}
      </div>
    </div>
  );
}
