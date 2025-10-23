'use client';

import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCommentBoxStore } from '@/store/commentBoxStore';

import { ControlPanelButton } from './ControlPanelButton';

type ValidationResult = 'valid' | 'invalid';

interface Props {
  validationResult?: ValidationResult;
  isDraft?: boolean;
}

export const ControlPanel = ({ validationResult, isDraft }: Props) => {
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
      {validationResult === 'valid' && (
        <GovIcon
          name="checkmark"
          size="xl"
          aria-label={t('ValidationPassed')}
        />
      )}
      {validationResult === 'invalid' && (
        <GovIcon
          name="crossmark"
          size="xl"
          aria-label={t('ValidationFailed')}
        />
      )}
      <ControlPanelButton iconName="download" ariaLabel={t('Download')} />
      {isDraft && (
        <ControlPanelButton iconName="trash" ariaLabel={t('Delete')} />
      )}
      <ControlPanelButton
        iconName="plus"
        ariaLabel={t('Add')}
        className="mt-12"
      />
    </div>
  );
};
