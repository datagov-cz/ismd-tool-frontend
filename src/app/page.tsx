import { getServerSession } from 'next-auth';

import { DraftDictionariesSection } from '@/components/draftDictionaries/DraftDictionariesSection';
import { NewsSlider } from '@/components/home/NewsSlider';
// import { MainControls } from '@/components/home/MainControls';
import { WelcomeSection } from '@/components/home/WelcomeSection';
import { VisitedOntologies } from '@/components/visitedOntologies/VisitedOntologies';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="w-full max-w-desktop mx-auto px-3 xl:px-0 py-6 flex gap-x-4 gap-y-8 flex-col">
      <div className="mx-auto w-full max-w-191.5">
        {session && <DraftDictionariesSection />}
        {!session && <WelcomeSection />}
        <hr className="text-dark-primary/20" />
        {/* <MainControls session={session} /> */}
        <NewsSlider />
        {session && <VisitedOntologies />}
      </div>
    </div>
  );
}
