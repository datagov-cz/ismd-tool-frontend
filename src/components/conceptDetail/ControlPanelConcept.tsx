'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCommentBoxStore } from '@/store/commentBoxStore';
import { useCreateConceptBoxStore } from '@/store/createConceptBoxStore';
import { ControlPanelButton } from '../dictionaryDetail/ControlPanelButton';
import { DeleteDialog } from '../dictionaryDetail/DeleteDialog';

interface Props {
  isPublished: boolean;
  conceptID: number;
  name: string;
}

export const ControlPanelConcept = ({
  isPublished,
  conceptID,
  name,
}: Props) => {
  const [openDelete, setOpenDelete] = useState(false);
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');

  const setIsCommentBoxOpen = useCommentBoxStore((state) => state.setIsOpen);
  const setIsConceptBoxOpen = useCreateConceptBoxStore(
    (state) => state.setIsOpen,
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast(t('LinkCopied'), { type: 'success' });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast(t('LinkCopyFailed'), { type: 'error' });
    }
  };

  return (
    <div className="sticky right-0 top-10 flex flex-col gap-2 h-fit">
      <ControlPanelButton
        iconName="gear"
        ariaLabel={t('GetLink')}
        onClick={() => setIsConceptBoxOpen(true)}
        className="mb-10"
      />
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
      {!isPublished && (
        <ControlPanelButton
          iconName="trash"
          danger
          ariaLabel={t('Delete')}
          onClick={() => setOpenDelete(true)}
        />
      )}
      <DeleteDialog
        open={openDelete}
        id={conceptID}
        onClose={() => setOpenDelete(false)}
        name={name}
        type="CONCEPT"
      />
    </div>
  );
};
