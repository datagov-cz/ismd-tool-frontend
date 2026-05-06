import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ISMD - Probíhá údržba',
  description: 'Aplikace je dočasně nedostupná z důvodu plánované údržby.',
};

export default function MaintenancePage() {
  return (
    <main className="min-h-[calc(100vh-12rem)] bg-page-background flex items-center justify-center px-5 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl desktop:text-5xl font-medium text-blue mb-6">
          Probíhá údržba
        </h1>
        <p className="text-lg desktop:text-xl text-dark-primary leading-relaxed mb-4">
          Aplikace je dočasně nedostupná z důvodu plánované údržby. Pracujeme na
          obnovení provozu.
        </p>
        <p className="text-base text-dark-secondary">Děkujeme za pochopení.</p>
      </div>
    </main>
  );
}
