import { NewsSidebar } from '@/components/home/NewsSidebar';
import { MainControls } from '@/components/home/MainControls';
import { WelcomeSection } from '@/components/home/WelcomeSection';

export default function Home() {
  return (
    <div className="w-full max-w-desktop mx-auto px-3 xl:px-0 py-6 flex gap-x-4 gap-y-8 flex-col lg:flex-row">
      <NewsSidebar />
      <div className="mx-auto">
        <MainControls />
        <div className="h-[1px] my-8 bg-dark-border" />
        <WelcomeSection />
      </div>
    </div>
  );
}
