import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

export const ControlPanel = () => {
  const t = useTranslations('DictionaryDetail.ControlPanel');

  return (
    <div className="absolute right-0 top-0 flex flex-col gap-4">
      <GovIcon name="link" size="2xl" aria-label={t('GetLink')} />
      <GovIcon name="message" size="2xl" aria-label={t('Comments')} />
      <GovIcon name="checkmark" size="2xl" aria-label={t('ValidationPassed')} />
      <GovIcon name="download" size="2xl" aria-label={t('Download')} />
      <GovIcon name="trash" size="2xl" aria-label={t('Delete')} />
    </div>
  );
};
