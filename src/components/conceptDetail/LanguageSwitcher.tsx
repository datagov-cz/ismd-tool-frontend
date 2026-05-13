import { GovChip } from '@gov-design-system-ce/react';
import clsx from 'clsx';

interface LanguageSwitcherProps {
  item: {
    [key: string]: unknown;
  };
}

export const LanguageSwitcher = ({ item }: LanguageSwitcherProps) => {
  if (Object.keys(item).length === 0) return;
  return (
    <div className="flex justify-between w-full gap-4">
      <div className="flex flex-col w-full">
        {Object.keys(item).map((lang) => (
          <div
            key={lang}
            className="flex gap-2 border-b last:border-0 w-full pb-2 pt-2 last:pb-0 first:pt-0 border-border-subtlest relative"
          >
            {lang !== 'cs' && (
              <GovChip
                key={lang}
                color="primary"
                size="xs"
                type="outlined"
                className="h-fit cursor-pointer! absolute -left-10 border-0!"
              >
                {lang.toLocaleUpperCase()}
              </GovChip>
            )}
            <p
              className={clsx('font-sm text-md', lang !== 'cs' && 'opacity-60')}
            >
              {String(item[lang])}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
