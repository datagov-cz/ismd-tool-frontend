export type Theme = 'light' | 'dark';

export const THEME_COOKIE = 'theme';
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const parseTheme = (value: string | null | undefined): Theme => {
  if (value === 'dark') {
    return 'dark';
  }

  return 'light';
};
