'use client';
import { useState } from 'react';
import { GovButton } from '@gov-design-system-ce/react';

export const LanguageSwitcher = ({
  item,
}: {
  item: {
    [key: string]: unknown;
  };
}) => {
  const [language, setLanguage] = useState(
    Object.keys(item).includes('cs') ? 'cs' : Object.keys(item)[0],
  );
  if (Object.keys(item).length === 0) return;
  return (
    <div className="flex justify-between w-full gap-4">
      <p>{String(item[language])}</p>
      <div className="flex gap-0.5">
        {Object.keys(item).map((item) => (
          <GovButton
            color="primary"
            key={item}
            type={item === language ? 'solid' : 'outlined'}
            size="xs"
            onGovClick={() => setLanguage(item)}
          >
            {item}
          </GovButton>
        ))}
      </div>
    </div>
  );
};
