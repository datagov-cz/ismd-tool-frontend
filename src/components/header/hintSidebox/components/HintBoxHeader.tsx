import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { Searchbar } from '../../../shared/Searchbar';
import { Panel } from '../hooks/useHintNav';

interface HintboxHeaderProps {
  panel: Panel;
  searchQuery: string;
  selectedFileTitle: string;
  onSearchChange: (_q: string) => void;
  onGoHome: () => void;
  onClose: () => void;
}

export function HintboxHeader({
  panel,
  searchQuery,
  selectedFileTitle,
  onSearchChange,
  onGoHome,
  onClose,
}: HintboxHeaderProps) {
  const t = useTranslations('Header.Hintbox');

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 shrink-0">
        <GovIcon name="question-square" type="components" />
        <span className="font-semibold text-gray-800 text-xl">{t('ISMD')}</span>

        <Searchbar
          placeholder={t('SearchPlaceholder')}
          hasSearchIcon
          size="s"
          onChange={onSearchChange}
        />

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Zavřít"
          >
            <GovIcon name="x-lg" type="components" />
          </button>
        </div>
      </div>

      {panel !== 'home' && (
        <div className="flex items-center gap-1 px-4 py-1.5 shrink-0 text-xs text-gray-400">
          <button
            onClick={onGoHome}
            className={clsx(
              'text-blue-primary hover:no-underline transition-colors underline',
            )}
          >
            {t('Title')}
          </button>

          {panel === 'search' && (
            <>
              <GovIcon name="chevron-right" type="components" size="xs" />
              <button
                onClick={() => onSearchChange(searchQuery)}
                className={clsx(
                  'font-bold text-dark-secondary transition-colors',
                )}
              >
                {t('Search')}
              </button>
            </>
          )}

          {panel === 'detail' && (
            <>
              <GovIcon name="chevron-right" type="components" size="xs" />
              <span
                className={clsx(
                  'font-bold text-dark-secondary transition-colors',
                )}
              >
                {selectedFileTitle}
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
}
