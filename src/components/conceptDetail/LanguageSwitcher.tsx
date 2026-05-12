'use client';
import { useState } from 'react';
import { GovChip } from '@gov-design-system-ce/react';

interface LanguageSwitcherProps {
  item: {
    [key: string]: unknown;
  };
}

export const LanguageSwitcher = ({ item }: LanguageSwitcherProps) => {
  console.log(item, 'test');
  const [language, setLanguage] = useState(
    Object.keys(item).includes('cs') ? 'cs' : Object.keys(item)[0],
  );
  if (Object.keys(item).length === 0) return;
  return (
    <div className="flex justify-between w-full gap-4">
      <div className="flex gap-0.5">
        {Object.keys(item)
          .sort()
          .map((item) => (
            <GovChip
              key={item}
              color="primary"
              size="xs"
              type={item === language ? 'solid' : 'outlined'}
              className="h-fit cursor-pointer!"
              onGovClick={() => setLanguage(item)}
            >
              <span className="cursor-pointer">{item.toLocaleUpperCase()}</span>
            </GovChip>
          ))}
      </div>
      <p className="font-sm text-md">{String(item[language])}</p>
    </div>
  );
};
