'use client';

import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useTheme } from '@/components/contexts/ThemeProvider';

export const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('Header');
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t(
        isDark ? 'ThemeSwitchAria.ToLight' : 'ThemeSwitchAria.ToDark',
      )}
      className={`relative w-8 h-4.5 rounded-3xl transition-colors duration-300 outline-0 focus-visible:outline-1 cursor-pointer ${
        isDark ? 'bg-border-primary' : 'bg-blue-subtle'
      }`}
    >
      <div
        className={`absolute top-px w-4 h-4 rounded-full bg-white transition-transform duration-300 flex shadow-toggle items-center justify-center ${
          isDark ? 'translate-x-4' : 'translate-x-px'
        }`}
      >
        <GovIcon name={isDark ? 'moon' : 'sun'} className="!size-3" />
      </div>
    </button>
  );
};
