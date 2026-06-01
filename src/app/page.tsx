import clsx from 'clsx';
import { getServerSession } from 'next-auth';

import { DraftDictionariesSection } from '@/components/draftDictionaries/DraftDictionariesSection';
import { MainControls } from '@/components/home/MainControls';
import { NewsSlider } from '@/components/home/NewsSlider';
import { WelcomeSection } from '@/components/home/WelcomeSection';
import { VisitedOntologies } from '@/components/visitedOntologies/VisitedOntologies';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="w-full max-w-desktop mx-auto px-3 xl:px-0 py-6 flex gap-x-4 gap-y-8 flex-col">
      <div
        className={clsx(
          'mx-auto w-full flex flex-col items-center',
          session ? 'max-w-250' : 'max-w-191.5',
        )}
      >
        {session && <MainControls />}
        {session && <DraftDictionariesSection />}
        {!session && <WelcomeSection />}
        {session && <VisitedOntologies />}
        <hr className="text-dark-primary/20" />
        <NewsSlider />
      </div>
    </div>
  );
}
