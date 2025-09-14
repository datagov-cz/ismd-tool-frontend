import { useHintboxStore } from '@/store/hintboxStore';
import { useTranslations } from 'next-intl';
import { Sidebox } from '../shared/Sidebox';

export const HintSidebox = () => {
  const isHintboxOpen = useHintboxStore((state) => state.isOpen);
  const setIsHintboxOpen = useHintboxStore((state) => state.setIsOpen);

  const t = useTranslations('Header.Hintbox');

  return (
    <Sidebox
      title={t('Title')}
      isOpen={isHintboxOpen}
      setIsOpen={setIsHintboxOpen}
      closeAriaLabel={t('CloseAria')}
    >
      asdasd
    </Sidebox>
  );
};
