import { useEffect, useState } from 'react';

export function useActiveAnchor(anchor?: string) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!anchor) return;

    const activate = (hash: string) => {
      if (hash !== anchor) return;

      setIsActive(true);
    };

    activate(window.location.hash.replace('#', ''));

    const handleHashChange = () => {
      activate(window.location.hash.replace('#', ''));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [anchor]);

  return isActive;
}
