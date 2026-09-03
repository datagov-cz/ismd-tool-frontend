'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  parseTheme,
  Theme,
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE,
} from '@/lib/theme';

interface ThemeContextType {
  theme: Theme;
  setTheme: (_theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
};

const readThemeCookie = (): string | null => {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
};

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme;
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
  }, []);

  useEffect(() => {
    const legacy = localStorage.getItem(THEME_COOKIE);

    if (legacy !== null) {
      localStorage.removeItem(THEME_COOKIE);
      setTheme(parseTheme(legacy));
      return;
    }

    const cookieTheme = readThemeCookie();

    if (cookieTheme !== null && parseTheme(cookieTheme) !== initialTheme) {
      setTheme(parseTheme(cookieTheme));
    }
  }, [initialTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
