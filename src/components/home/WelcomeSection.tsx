import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { SearchInput } from '../searchInput/SearchInput';

export const WelcomeSection = () => {
  const t = useTranslations('Home');

  return (
    <div className="max-w-171 mx-auto flex flex-col items-center gap-y-6 text-center p-10">
      <h2 className="text-xl font-bold">{t('WelcomeSection.Title')}</h2>
      <p className="text-lg">{t('WelcomeSection.Description')}</p>
      <SearchInput className="max-w-150" />
      <div className="flex flex-col gap">
        <Link
          href="/dictionary/list-all"
          className="underline text-sm text-foreground"
        >
          {t('WelcomeSection.BrowseDictionaries')}
        </Link>
        <Link href="/dataset" className="underline text-sm text-foreground">
          {t('WelcomeSection.BrowseDataSets')}
        </Link>
      </div>
    </div>
  );
};
