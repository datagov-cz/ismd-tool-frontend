import { useEffect } from 'react';
import { useScrollLock } from 'usehooks-ts';

export const usePageScrollLock = (isOpen: boolean) => {
  const { isLocked, lock, unlock } = useScrollLock({
    autoLock: false,
    lockTarget: 'html',
    widthReflow: false,
  });

  useEffect(() => {
    if (isOpen === isLocked) {
      return;
    }

    if (isOpen) {
      lock();
    } else {
      unlock();
    }
  }, [isOpen, isLocked, lock, unlock]);
};
