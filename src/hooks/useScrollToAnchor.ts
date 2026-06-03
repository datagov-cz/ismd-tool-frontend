import { useEffect } from 'react';

export function useScrollToAnchor(ready = true) {
  useEffect(() => {
    if (!ready) return;

    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    document
      .getElementById(hash)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [ready]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      document
        .getElementById(hash)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
}
