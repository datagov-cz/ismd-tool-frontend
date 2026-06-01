export interface RouteHints {
  pattern: string;
  patternSuffix?: string;
  hints: string[];
}

export const ROUTE_HINTS: RouteHints[] = [
  {
    pattern: '/dictionary/create',
    hints: [
      '/Slovník/Vytvoření slovníku.md',
      '/Slovník/Formaty importu.md',
      '/General/Glosar.md',
    ],
  },
  {
    pattern: '/dictionary',
    patternSuffix: '/edit',
    hints: [
      '/Slovník/Úprava slovíku.md',
      '/Slovník/Struktura slovníku.md',
      '/General/Glosar.md',
    ],
  },
  {
    pattern: '/dictionary/nkd/list',
    hints: ['/Slovník/NKD/Katlog slovníků.md', '/General/Glosar.md'],
  },
  {
    pattern: '/dictionary/nkd',
    hints: [
      '/Slovník/NKD/Publikovaný slovník.md',
      '/Slovník/Struktura slovníku.md',
      '/General/Glosar.md',
    ],
  },
  {
    pattern: '/dictionary/list',
    hints: ['/Slovník/Seznam slovníků.md', '/Slovník/Vytvoření slovníku.md'],
  },
  {
    pattern: '/dictionary',
    hints: [
      '/Slovník/Čtení slovníku.md',
      '/Slovník/Struktura slovníku.md',
      '/General/Glosar.md',
    ],
  },
  {
    pattern: '/concept/create',
    hints: [
      '/Pojem/Vytvoření pojmu.md',
      '/Pojem/Vztahy pojmu.md',
      '/General/Glosar.md',
    ],
  },
  {
    pattern: '/concept',
    patternSuffix: '/edit',
    hints: [
      '/Pojem/Úprava pojmu.md',
      '/Pojem/Vztahy pojmu.md',
      '/General/Glosar.md',
    ],
  },
  {
    pattern: '/concept/nkd',
    hints: ['/Pojem/NKD/Publikovaný pojem.md', '/General/Glosar.md'],
  },
  {
    pattern: '/concept',
    hints: [
      '/Pojem/Detail pojmu.md',
      '/Pojem/Vztahy pojmu.md',
      '/General/Glosar.md',
    ],
  },
  {
    pattern: '/search',
    hints: ['/Hledání/Vyhledávání.md', '/Hledání/Pokročilé vyhledávání.md'],
  },
  {
    pattern: '/',
    hints: ['/General/Úvod nepřihlášen.md', '/General/Glosar.md'],
  },
];

export const HOME_HINTS_LOGGED_IN: string[] = [
  '/General/Úvod přihlášen.md',
  '/Slovník/Seznam slovníků.md',
  '/General/Glosar.md',
];

export function getRecommendedHints(
  pathname: string,
  isLoggedIn = false,
): string[] {
  if (pathname === '/') {
    return isLoggedIn
      ? HOME_HINTS_LOGGED_IN
      : ['/General/Úvod nepřihlášen.md', '/General/Glosar.md'];
  }

  const sorted = [...ROUTE_HINTS].sort(
    (a, b) => b.pattern.length - a.pattern.length,
  );

  const match = sorted.find((r) => {
    if (!pathname.startsWith(r.pattern)) return false;
    if (r.patternSuffix) return pathname.includes(r.patternSuffix);
    return true;
  });

  return match?.hints ?? [];
}
