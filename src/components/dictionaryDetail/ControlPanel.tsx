'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCommentBoxStore } from '@/store/commentBoxStore';

import { ControlPanelButton } from './ControlPanelButton';

export const ControlPanel = () => {
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');

  const setIsCommentBoxOpen = useCommentBoxStore((state) => state.setIsOpen);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast(t('LinkCopied'));
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast(t('LinkCopyFailed'));
    }
  };

  return (
    <div className="absolute right-0 top-0 flex flex-col gap-4">
      <ControlPanelButton
        iconName="link"
        ariaLabel={t('GetLink')}
        onClick={() => handleCopyLink()}
      />
      <ControlPanelButton
        iconName="message"
        ariaLabel={t('Comments')}
        onClick={() => setIsCommentBoxOpen(true)}
      />
      <ControlPanelButton
        iconName="checkmark"
        ariaLabel={t('ValidationPassed')}
      />
      <ControlPanelButton iconName="download" ariaLabel={t('Download')} />
      <ControlPanelButton iconName="trash" ariaLabel={t('Delete')} />
    </div>
  );
};
