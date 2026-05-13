'use client';

import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
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
  commentsCount: number;
  loggedIn?: boolean;
  source?: 'NKD' | 'ISMD';
  owner: boolean;
}

export const ControlPanelConcept = ({
  isPublished,
  conceptID,
  name,
  commentsCount,
  loggedIn,
  owner,
  source,
}: Props) => {
  const [openDelete, setOpenDelete] = useState(false);
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');

  const setIsCommentBoxOpen = useCommentBoxStore((state) => state.setIsOpen);
  const setOpenBoxId = useCreateConceptBoxStore((state) => state.setOpenBoxId);

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
    <div className="flex flex-col gap-2 justify-between h-full">
      <div className="flex gap-8">
        {owner && (
          <GovButton
            type="solid"
            color="primary"
            size="s"
            onGovClick={() => setOpenBoxId('update')}
          >
            <GovIcon name="pencil-square" slot="icon-start" type="components" />
            Upravit pojem
          </GovButton>
        )}
        {loggedIn && source === 'ISMD' && (
          <GovButton
            type="outlined"
            color="primary"
            size="s"
            onGovClick={() => setIsCommentBoxOpen(true)}
          >
            <GovIcon name="pencil-square" slot="icon-start" type="components" />
            Komentáře k pojmu{' '}
            <span className="font-normal">[{commentsCount}]</span>
          </GovButton>
        )}
      </div>
      <div className="self-end">
        <ControlPanelButton
          iconName="link"
          ariaLabel={t('GetLink')}
          onClick={() => handleCopyLink()}
        />
        {!isPublished && owner && (
          <ControlPanelButton
            iconName="trash"
            danger
            ariaLabel={t('Delete')}
            onClick={() => setOpenDelete(true)}
          />
        )}
      </div>
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
