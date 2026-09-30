import { GovChip } from '@gov-design-system-ce/react';
import clsx from 'clsx';

interface LanguageSwitcherProps {
  item: {
    [key: string]: unknown;
  };
  hideCs?: boolean;
  showCsTag?: boolean;
}

const toValues = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [value];

export const LanguageSwitcher = ({
  item,
  hideCs,
  showCsTag = false,
}: LanguageSwitcherProps) => {
  if (Object.keys(item).length === 0) return;
  return (
    <div className="flex justify-between w-full gap-4">
      <div className="flex flex-col w-full">
        {Object.keys(item)
          .sort((a, b) => (a === 'cs' ? -1 : b === 'cs' ? 1 : 0))
          .filter((lang) => (hideCs ? lang !== 'cs' : true))
          .map((lang) => (
            <div
              key={lang}
              className="flex gap-2 border-b last:border-0 w-full pb-2 pt-2 last:pb-0 first:pt-0 border-border-default relative"
            >
              {(showCsTag ?? lang !== 'cs') && (
                <GovChip
                  color="primary"
                  size="xs"
                  type="outlined"
                  className="h-fit cursor-pointer! absolute -left-10 border-0!"
                >
                  {lang.toLocaleUpperCase()}
                </GovChip>
              )}
              <div className="flex flex-col w-full">
                {toValues(item[lang]).map((value, index) => (
                  <p
                    key={index}
                    className={clsx(
                      'font-sm text-md',
                      lang !== 'cs' && 'opacity-60',
                    )}
                  >
                    {String(value)}
                  </p>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
