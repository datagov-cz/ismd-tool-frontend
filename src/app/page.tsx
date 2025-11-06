'use client';

import { DraftDictionariesSection } from '@/components/draftDictionaries/DraftDictionariesSection';
import { MainControls } from '@/components/home/MainControls';
import { NewsSidebar } from '@/components/home/NewsSidebar';
import { WelcomeSection } from '@/components/home/WelcomeSection';
import { VisitedOntologies } from '@/components/visitedOntologies/VisitedOntologies';
import { useUserStore } from '@/store/userStore';

export default function Home() {
  const user = useUserStore((state) => state.user);

  return (
    <div className="w-full max-w-desktop mx-auto px-3 xl:px-0 py-6 flex gap-x-4 gap-y-8 flex-col lg:flex-row">
      <NewsSidebar />
      <div className="mx-auto">
        {/* TODO: use user's draft dictionaries when available */}
        {user && <DraftDictionariesSection />}
        <MainControls />
        {!user && (
          <>
            <div className="h-[1px] my-8 bg-dark-border" />
            <WelcomeSection />
          </>
        )}
        {user && <VisitedOntologies />}
      </div>
    </div>
  );
}
