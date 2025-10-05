'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { ControlPanelButton } from './ControlPanelButton';

export const ControlPanel = () => {
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');

  const handleCopyLink = async () => {
    console.log('copy link');
    await navigator.clipboard.writeText(window.location.href);
    toast(t('LinkCopied'));
  };

  return (
    <div className="absolute right-0 top-0 flex flex-col gap-4">
      <ControlPanelButton
        iconName="link"
        ariaLabel={t('GetLink')}
        onClick={() => handleCopyLink()}
      />
      <ControlPanelButton iconName="message" ariaLabel={t('Comments')} />
      <ControlPanelButton
        iconName="checkmark"
        ariaLabel={t('ValidationPassed')}
      />
      <ControlPanelButton iconName="download" ariaLabel={t('Download')} />
      <ControlPanelButton iconName="trash" ariaLabel={t('Delete')} />
    </div>
  );
};
