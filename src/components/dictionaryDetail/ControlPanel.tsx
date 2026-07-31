'use client';

import { useState } from 'react';
import { GovButton, GovDropdown, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { UserModel } from '@/api/generated';
import { useCommentBoxStore } from '@/store/commentBoxStore';
import { useCurrentUser } from '../contexts/CurrentUserProvider';

import { ControlPanelButton } from './ControlPanelButton';
import { DeleteDialog } from './DeleteDialog';
import { DownloadDialog } from './DownloadDialog';

interface Props {
  ontologyID: number;
  name: string;
  user?: UserModel;
  commentsCount?: number;
  slug: string;
  iri?: string;
}

export const ControlPanel = ({
  ontologyID,
  name,
  user,
  commentsCount,
  slug,
  iri,
}: Props) => {
  const [openDownload, setOpenDownload] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');
  const tEdit = useTranslations('DictionaryDetail.EditOntology');
  const { user: currentUser, isAdmin } = useCurrentUser();

  const setIsCommentBoxOpen = useCommentBoxStore((state) => state.setIsOpen);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(t('LinkCopied'), { type: 'success' });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy link:', error);
      toast(t('LinkCopyFailed'), { type: 'error' });
    }
  };

  const isOwner = user?.userId === currentUser?.userId;
  const isEditAllowed = isOwner || isAdmin;
  const isLoggedIn = !!currentUser?.userId;

  return (
    <div className="flex flex-col gap-2 h-full justify-between w-full relative">
      <div className="flex gap-2 flex-col items-end">
        <div className="flex justify-between w-full gap-x-2">
          {isEditAllowed && (
            <GovButton
              nativeType="button"
              color="primary"
              type="outlined"
              size="s"
              aria-label={tEdit('Title')}
              href={`${process.env.NEXT_PUBLIC_BASE_PATH}/dictionary/${slug}/edit`}
            >
              <GovIcon
                name="pencil-square"
                size="l"
                slot="icon-start"
                type="components"
              />
              <span className="hidden desktop:inline">{tEdit('Title')}</span>
            </GovButton>
          )}

          {isLoggedIn && (
            <GovButton
              nativeType="button"
              color="primary"
              type="outlined"
              size="s"
              aria-label={tEdit('Comments')}
              onGovClick={() => setIsCommentBoxOpen(true)}
            >
              <GovIcon
                name="chat-square-text"
                size="l"
                slot="icon-start"
                type="components"
              />
              <span className="hidden desktop:inline">{tEdit('Comments')}</span>
              {(commentsCount ?? 0) > 0 && (
                <span className="font-normal">[{commentsCount}]</span>
              )}
            </GovButton>
          )}
        </div>

        {isEditAllowed && (
          <GovButton
            nativeType="button"
            color="primary"
            type="outlined"
            size="s"
            expanded
            disabled
          >
            <GovIcon
              name="diagram-3"
              size="l"
              slot="icon-start"
              type="components"
            />
            {t('CreateDiagram')}
          </GovButton>
        )}
      </div>
      <div className="flex justify-end">
        <ControlPanelButton
          iconName="download"
          ariaLabel={t('Download')}
          onClick={() => setOpenDownload(true)}
        />
        <GovDropdown id="copy-link-ismd" position="left">
          <GovButton
            color={'primary'}
            type="base"
            size="m"
            className="h-8! [&_button]:h-8!"
          >
            <GovIcon
              name="link"
              size="m"
              aria-label={t('GetLink')}
              className="text-white"
            />
          </GovButton>
          <ul slot="list">
            {iri && (
              <GovButton
                color="primary"
                type="base"
                size="s"
                onGovClick={() => copyToClipboard(iri)}
                className="w-full! [&_button]:w-full! max-w-none!"
              >
                {t('CopyIRI')}
              </GovButton>
            )}
            <GovButton
              color="primary"
              type="base"
              size="s"
              onGovClick={() => copyToClipboard(window.location.href)}
              className="w-full! [&_button]:w-full! max-w-none!"
            >
              {t('CopyURL')}
            </GovButton>
          </ul>
        </GovDropdown>

        {isEditAllowed && (
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
        slug={slug}
      />
      <DownloadDialog
        ontologyID={ontologyID}
        open={openDownload}
        type="ISMD"
        onClose={() => setOpenDownload(false)}
        ontologyName={name.replace(/\s+/g, '_').toLowerCase()}
      />
    </div>
  );
};
