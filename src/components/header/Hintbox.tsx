import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useHintboxStore } from '@/store/hintboxStore';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

export const Hintbox = () => {
  const isHintboxOpen = useHintboxStore((state) => state.isOpen);
  const setIsHintboxOpen = useHintboxStore((state) => state.setIsOpen);

  const t = useTranslations('Header.Hintbox');

  const ref = useOutsideClick(() => setIsHintboxOpen(false));

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-10 transition-opacity duration-300 backdrop-blur-xs ${
          isHintboxOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsHintboxOpen(false)}
      />

      <aside
        className={`fixed top-[72px] my-10 right-0 h-full desktop:h-[80vh] w-96 desktop:w-1/2 bg-white shadow-lg z-30 transform transition-all duration-300 ease-in-out p-4 ${
          isHintboxOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        ref={ref}
      >
        <GovButton
          onGovClick={() => setIsHintboxOpen(false)}
          aria-label={t('CloseAria')}
          className="absolute top-2 right-2"
        >
          <GovIcon
            name="x-lg"
            color="black"
            size="m"
            className="[&>svg>path]:fill-black dark:[&>svg>path]:fill-white"
          />
        </GovButton>
      </aside>
    </>
  );
};
