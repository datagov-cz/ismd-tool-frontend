'use client';

import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import { useMounted } from '@/hooks/useMounted';

const OPTIONS = [
  {
    value: 'light',
    label: 'ThemeSwitchAria.Light',
    thumb: 'translate-x-0',
  },
  {
    value: 'system',
    label: 'ThemeSwitchAria.System',
    thumb: 'translate-x-6',
  },
  {
    value: 'dark',
    label: 'ThemeSwitchAria.Dark',
    thumb: 'translate-x-12',
  },
] as const;

const SystemIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="size-3"
  >
    <rect x="1.5" y="2.5" width="13" height="8.5" rx="1.5" />
    <path d="M5.5 14h5M8 11v3" />
  </svg>
);

export const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const t = useTranslations('Header');
  const active = mounted
    ? OPTIONS.find(({ value }) => value === theme)
    : undefined;

  return (
    <div
      role="radiogroup"
      aria-label={t('ThemeSwitchLabel')}
      className="relative flex p-px rounded-3xl bg-blue-subtle"
    >
      <div
        aria-hidden="true"
        className={`absolute top-px left-px size-6 rounded-full bg-surface shadow-toggle transition-transform duration-300 ${
          active ? active.thumb : 'invisible'
        }`}
      />
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={active?.value === value}
          aria-label={t(label)}
          title={t(label)}
          onClick={() => setTheme(value)}
          className="relative size-6 flex items-center justify-center rounded-full outline-0 focus-visible:outline-1 cursor-pointer"
        >
          {value === 'system' ? (
            <SystemIcon />
          ) : (
            <GovIcon
              name={value === 'dark' ? 'moon' : 'sun'}
              color="default"
              className="!size-3"
            />
          )}
        </button>
      ))}
    </div>
  );
};
