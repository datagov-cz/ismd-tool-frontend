import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ISMD - Připravujeme',
  description:
    'Nástroj pro tvorbu a správu sémantických slovníků v rámci Informačního systému pro modelování dat se připravuje k veřejnému spuštění.',
};

export default function ComingSoonPage() {
  return (
    <main className="min-h-[calc(100vh-12rem)] bg-page-background flex items-center justify-center px-5 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl desktop:text-5xl font-medium text-blue mb-6">
          Připravujeme
        </h1>
        <p className="text-lg desktop:text-xl text-dark-primary leading-relaxed mb-4">
          Nástroj pro tvorbu a správu sémantických slovníků v rámci Informačního
          systému pro modelování dat dokončujeme. Veřejně dostupný bude v
          nejbližší době.
        </p>
        <p className="text-base text-dark-secondary">Děkujeme za trpělivost.</p>
      </div>
    </main>
  );
}
