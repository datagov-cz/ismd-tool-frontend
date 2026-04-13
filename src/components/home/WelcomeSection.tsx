import Link from 'next/link';

import { SearchInput } from '../searchInput/SearchInput';

export const WelcomeSection = () => {
  return (
    <div className="max-w-171 mx-auto flex flex-col items-center gap-y-6 text-center p-10">
      <h2 className="text-xl font-bold">
        Vítejte v nástroji pro tvorbu správu a tvorbu datových slovníku
      </h2>
      <p className="text-lg">
        Bez přihlášení si můžete procházet publikované slovníky z Národního
        katalogu dat. Pro tvorbu slovníků se musíte přihlásit.
      </p>
      <SearchInput />
      <Link href="/slovniky" className="underline text-sm text-dark-primary">
        Procházet slovníky
      </Link>
    </div>
  );
};
