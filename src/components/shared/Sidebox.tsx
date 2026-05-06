import { ReactNode, useEffect } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { useEscapeKey } from '@/hooks/useEscapeKey';

interface Props {
  title?: ReactNode;
  isOpen: boolean;
  setIsOpen: (_open: boolean) => void;
  closeAriaLabel?: string;
  children: ReactNode;
  size?: 's' | 'm' | 'l';
}

export const Sidebox = ({
  title,
  isOpen,
  setIsOpen,
  closeAriaLabel,
  children,
  size = 'l',
}: Props) => {
  useEscapeKey(() => setIsOpen(false));

  const t = useTranslations('Shared');

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-y-hidden');
    } else {
      document.body.classList.remove('overflow-y-hidden');
    }
    return () => document.body.classList.remove('overflow-y-hidden');
  }, [isOpen]);

  return (
    <>
      <div
        className={clsx(
          'fixed top-18 left-0 right-0 bottom-0 z-10 bg-black transition-opacity duration-300 m-0',
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={clsx(
          'fixed top-18 right-0 h-[calc(100vh-4.5rem)] w-full bg-white shadow-lg z-50 transform transition-all duration-300 ease-in-out p-4 overflow-y-hidden border-blue border-b border-t border-l border-solid flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          size === 's' && 'md:w-1/4',
          size === 'm' && 'md:w-1/3',
          size === 'l' && 'md:w-1/2',
        )}
      >
        <div className="flex items-center justify-between shrink-0">
          {title && <h2 className="text-lg font-bold">{title}</h2>}
          <GovButton
            onGovClick={() => setIsOpen(false)}
            aria-label={closeAriaLabel ?? t('CloseAria')}
            className="absolute top-2 right-2"
          >
            <GovIcon
              name="x-lg"
              color="black"
              size="m"
              className="[&>svg>path]:fill-black dark:[&>svg>path]:fill-white"
            />
          </GovButton>
        </div>
        <div className="mt-4 flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </aside>
    </>
  );
};
