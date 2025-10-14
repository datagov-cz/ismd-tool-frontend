import { ReactNode, useEffect } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useOutsideClick } from '@/hooks/useOutsideClick';

interface Props {
  title?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  closeAriaLabel?: string;
  children: ReactNode;
}

export const Sidebox = ({
  title,
  isOpen,
  setIsOpen,
  closeAriaLabel,
  children,
}: Props) => {
  const ref = useOutsideClick(() => setIsOpen(false));

  const t = useTranslations('Shared');

  // TODO: check if we need this from the business perspective
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
        className={`fixed inset-0 z-10 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed top-[72px] desktop:my-10 right-0 h-full desktop:h-[80vh] w-full desktop:w-1/2 bg-white shadow-lg z-30 transform transition-all duration-300 ease-in-out p-4 overflow-y-hidden border-blue border-b border-t border-l border-solid rounded-tl-md rounded-bl-md flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        ref={ref}
      >
        <div className="flex items-center justify-between flex-shrink-0">
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
