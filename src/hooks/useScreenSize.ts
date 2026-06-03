import { useEffect, useState } from 'react';

export const useScreenSize = () => {
  const [size, setSize] = useState<'s' | 'm' | 'l'>('l');

  useEffect(() => {
    const getSize = (): 's' | 'm' | 'l' => {
      if (window.matchMedia('(min-width: 1024px)').matches) return 'l';
      if (window.matchMedia('(min-width: 640px)').matches) return 'm';
      return 's';
    };

    setSize(getSize());

    const mqM = window.matchMedia('(min-width: 640px)');
    const mqL = window.matchMedia('(min-width: 1024px)');
    const handler = () => setSize(getSize());

    mqM.addEventListener('change', handler);
    mqL.addEventListener('change', handler);
    return () => {
      mqM.removeEventListener('change', handler);
      mqL.removeEventListener('change', handler);
    };
  }, []);

  return size;
};
