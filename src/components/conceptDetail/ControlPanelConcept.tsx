'use client';

import { useState } from 'react';
import { GovButton, GovDropdown, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCommentBoxStore } from '@/store/commentBoxStore';
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
  slug: string;
  iri?: string;
}

export const ControlPanelConcept = ({
  isPublished,
  conceptID,
  name,
  commentsCount,
  loggedIn,
  owner,
  source,
  slug,
  iri,
}: Props) => {
  const [openDelete, setOpenDelete] = useState(false);
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');
  const tConcept = useTranslations('ConceptDetail.Main.ControlPanel');

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

  return (
    <div className="flex flex-col gap-2 justify-between h-full">
      {((loggedIn && source === 'ISMD') || owner) && (
        <div className="flex gap-8">
          {owner && (
            <GovButton
              type="solid"
              color="primary"
              size="s"
              href={`${process.env.NEXT_PUBLIC_BASE_PATH}/concept/${slug}/edit`}
            >
              <GovIcon
                name="pencil-square"
                slot="icon-start"
                type="components"
              />
              {tConcept('EditConcept')}
            </GovButton>
          )}
          {loggedIn && source === 'ISMD' && (
            <GovButton
              type="outlined"
              color="primary"
              size="s"
              onGovClick={() => setIsCommentBoxOpen(true)}
            >
              <GovIcon
                name="pencil-square"
                slot="icon-start"
                type="components"
              />
              {tConcept('ConceptComments')}{' '}
              <span className="font-normal">[{commentsCount}]</span>
            </GovButton>
          )}
        </div>
      )}

      <div className="self-end">
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
            {source === 'NKD' ? t('CopyLink') : undefined}
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
