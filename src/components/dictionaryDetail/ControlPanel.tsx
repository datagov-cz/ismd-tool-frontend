'use client';

import { useState } from 'react';
import { GovButton, GovDropdown, GovIcon } from '@gov-design-system-ce/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import {
  getListForOntologyQueryKey,
  useCreateDiagram,
  useListForOntology,
  UserModel,
} from '@/api/generated';
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
  const router = useRouter();
  const queryClient = useQueryClient();
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
  const encodedSlug = encodeURIComponent(slug);
  const diagrams = useListForOntology(encodedSlug, {
    query: { enabled: isEditAllowed },
  });
  const diagramItems = diagrams.data?.data ?? [];
  const createDiagram = useCreateDiagram({
    mutation: {
      onSuccess: async (response) => {
        const diagramId = response.data?.diagramId;

        await queryClient.invalidateQueries({
          queryKey: getListForOntologyQueryKey(encodedSlug),
        });

        if (diagramId === undefined) {
          toast.error('Diagram byl vytvořen, ale nepodařilo se jej otevřít.');
          return;
        }

        router.push(`/dictionary/${slug}/diagram/${diagramId}`);
      },
      onError: () => toast.error('Diagram se nepodařilo vytvořit.'),
    },
  });

  const handleCreateDiagram = () => {
    createDiagram.mutate({ ontologySlug: encodedSlug, data: {} });
  };

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

        {isEditAllowed && diagramItems.length > 0 && (
          <GovDropdown
            id={`diagrams-${ontologyID}`}
            position="right"
            className="w-full [&_.gov-dropdown__list]:w-full"
          >
            <GovButton
              nativeType="button"
              color="neutral"
              type="outlined"
              size="s"
              expanded
            >
              <GovIcon
                name="diagram-3"
                size="l"
                slot="icon-start"
                type="components"
              />
              Diagramy [{diagramItems.length}]
              <GovIcon name="chevron-down" size="s" slot="icon-end" />
            </GovButton>

            <ul slot="list" className="min-w-72 p-0!">
              <li className="border-b border-border-grey">
                <GovButton
                  nativeType="button"
                  color="neutral"
                  type="base"
                  size="s"
                  expanded
                  disabled={createDiagram.isPending}
                  onGovClick={handleCreateDiagram}
                >
                  <GovIcon name="plus" size="l" slot="icon-start" />
                  {createDiagram.isPending
                    ? 'Vytvářím diagram…'
                    : 'Přidat nový diagram'}
                </GovButton>
              </li>
              {diagramItems.map((diagram) =>
                diagram.diagramId === undefined ? null : (
                  <li key={diagram.diagramId}>
                    <GovButton
                      color="neutral"
                      type="base"
                      size="s"
                      expanded
                      href={`${process.env.NEXT_PUBLIC_BASE_PATH}/dictionary/${slug}/diagram/${diagram.diagramId}`}
                    >
                      <GovIcon
                        name="diagram-3"
                        size="l"
                        slot="icon-start"
                        type="components"
                      />
                      {diagram.name?.trim() || '-- bez názvu --'}
                    </GovButton>
                  </li>
                ),
              )}
            </ul>
          </GovDropdown>
        )}

        {isEditAllowed && !diagrams.isPending && diagramItems.length === 0 && (
          <GovButton
            nativeType="button"
            color="neutral"
            type="outlined"
            size="s"
            expanded
            disabled={createDiagram.isPending}
            onGovClick={handleCreateDiagram}
          >
            <GovIcon
              name="diagram-3"
              size="l"
              slot="icon-start"
              type="components"
            />
            {createDiagram.isPending
              ? 'Vytvářím diagram…'
              : 'Přidat nový diagram'}
            <GovIcon name="plus" size="s" slot="icon-end" />
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
