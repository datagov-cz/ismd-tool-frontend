import { getServerSession } from 'next-auth';

import { DraftDictionariesSection } from '@/components/draftDictionaries/DraftDictionariesSection';
import { MainControls } from '@/components/home/MainControls';
import { NewsSidebar } from '@/components/home/NewsSidebar';
import { WelcomeSection } from '@/components/home/WelcomeSection';
import { VisitedOntologies } from '@/components/visitedOntologies/VisitedOntologies';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="w-full max-w-desktop mx-auto px-3 xl:px-0 py-6 flex gap-x-4 gap-y-8 flex-col lg:flex-row">
      <NewsSidebar />
      <div className="mx-auto w-full">
        {session && <DraftDictionariesSection />}
        <MainControls session={session} />
        {!session && (
          <>
            <div className="h-[1px] my-8 bg-dark-border" />
            <WelcomeSection />
          </>
        )}
        {session && <VisitedOntologies />}
      </div>
    </div>
  );
}
