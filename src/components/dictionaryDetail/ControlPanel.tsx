'use client';

import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useGetCurrentUser, UserModel } from '@/api/generated';
import { useCommentBoxStore } from '@/store/commentBoxStore';

import { ControlPanelButton } from './ControlPanelButton';
import { DeleteDialog } from './DeleteDialog';
import { DownloadDialog } from './DownloadDialog';

interface Props {
  isPublished: boolean;
  ontologyID: number;
  name: string;
  user?: UserModel;
  commentsCount?: number;
  slug: string;
}

export const ControlPanel = ({
  isPublished,
  ontologyID,
  name,
  user,
  commentsCount,
  slug,
}: Props) => {
  const [openDownload, setOpenDownload] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');
  const tEdit = useTranslations('DictionaryDetail.EditOntology');
  const { data } = useGetCurrentUser();

  const setIsCommentBoxOpen = useCommentBoxStore((state) => state.setIsOpen);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast(t('LinkCopied'), { type: 'success' });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy link:', error);
      toast(t('LinkCopyFailed'), { type: 'error' });
    }
  };

  const isOwner = user?.userId === data?.data?.userId;

  const isLoggedOut = data?.success !== true;

  return (
    <div className="flex gap-2 h-fit w-full justify-between relative">
      <div className="flex gap-8">
        {isOwner && (
          <GovButton
            nativeType="button"
            color="primary"
            type="solid"
            size="s"
            href={`${process.env.NEXT_PUBLIC_BASE_PATH}/dictionary/${slug}/edit`}
          >
            <GovIcon
              name="pencil-square"
              size="l"
              slot="icon-start"
              type="components"
            />
            {tEdit('Title')}
          </GovButton>
        )}

        {!isLoggedOut && (
          <GovButton
            nativeType="button"
            color="primary"
            type="outlined"
            size="s"
            onGovClick={() => setIsCommentBoxOpen(true)}
          >
            <GovIcon
              name="chat-square-text"
              size="l"
              slot="icon-start"
              type="components"
            />
            {tEdit('Comments')}
            {(commentsCount ?? 0) > 0 && (
              <span className="font-normal">[{commentsCount}]</span>
            )}
          </GovButton>
        )}
      </div>
      <div className="flex">
        <ControlPanelButton
          iconName="download"
          ariaLabel={t('Download')}
          onClick={() => setOpenDownload(true)}
        />
        <ControlPanelButton
          iconName="link"
          ariaLabel={t('GetLink')}
          onClick={() => handleCopyLink()}
        />
        {!isPublished && isOwner && (
          <ControlPanelButton
            iconName="trash"
            ariaLabel={t('Delete')}
            onClick={() => setOpenDelete(true)}
            danger
          />
        )}
      </div>

      <DeleteDialog
        open={openDelete}
        id={ontologyID}
        onClose={() => setOpenDelete(false)}
        name={name}
        type="ONTOLOGY"
      />
      <DownloadDialog
        ontologyID={ontologyID}
        open={openDownload}
        type="ISMD"
        onClose={() => setOpenDownload(false)}
      />
    </div>
  );
};
