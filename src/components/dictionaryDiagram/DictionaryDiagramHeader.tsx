'use client';

import { GovButton, GovIcon, GovTag } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import {
  DiagramLayoutOverlay,
  useMaterialize,
  useSaveLayout,
} from '@/api/generated';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';

import {
  buildDiagramLayoutDto,
  ConceptFlowEdge,
  ConceptFlowNode,
} from './model/diagram';
import { capitalizeFirst } from './utils/capitalizeFirst';

type DictionaryDiagramHeaderProps = {
  ontologyName?: string;
  ontologySlug: string;
  nodes: ConceptFlowNode[];
  edges: ConceptFlowEdge[];
  removedOverlays: DiagramLayoutOverlay[];
  diagramVersion?: number;
  onLayoutSaved: () => void;
};

export const DictionaryDiagramHeader = ({
  ontologyName,
  ontologySlug,
  nodes,
  edges,
  removedOverlays,
  diagramVersion,
  onLayoutSaved,
}: DictionaryDiagramHeaderProps) => {
  const router = useRouter();
  const t = useTranslations('ConceptDetail');
  const { invalidateDiagram, invalidateOntology } = useQueryInvalidator();
  const saveLayout = useSaveLayout({
    mutation: {
      onSuccess: async () => {
        onLayoutSaved();
        await invalidateDiagram(ontologySlug);
        toast.success('Návrh diagramu byl uložen.');
      },
      onError: () => toast.error('Návrh diagramu se nepodařilo uložit.'),
    },
  });
  const materialize = useMaterialize({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          invalidateDiagram(ontologySlug),
          invalidateOntology(ontologySlug),
        ]);
        toast.success('Změny byly propsány do slovníku.');
      },
      onError: () => toast.error('Změny se nepodařilo propsat do slovníku.'),
    },
  });

  const handleSaveLayout = () => {
    saveLayout.mutate({
      ontologySlug: encodeURIComponent(ontologySlug),
      data: {
        ...buildDiagramLayoutDto(
          nodes,
          edges,
          diagramVersion ?? 0,
          removedOverlays,
        ),
      },
    });
  };

  const handleMaterialize = async () => {
    const encodedOntologySlug = encodeURIComponent(ontologySlug);

    try {
      await saveLayout.mutateAsync({
        ontologySlug: encodedOntologySlug,
        data: {
          ...buildDiagramLayoutDto(
            nodes,
            edges,
            diagramVersion ?? 0,
            removedOverlays,
          ),
        },
      });

      materialize.mutate({ ontologySlug: encodedOntologySlug });
    } catch {
      // The save mutation displays the error; materialization must not continue.
    }
  };

  return (
    <div className="w-full flex justify-between">
      <div className="flex gap-2">
        <button
          onClick={() => router.back()}
          className="flex gap-1 text-blue-primary font-bold items-center text-sm"
        >
          <GovIcon name="chevron-compact-left" size="s" color="primary" />
          {t('Main.ControlPanel.Back')}
        </button>

        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">
            {t('Main.ControlPanel.InOntology')}:
          </span>

          <Link
            href={`/dictionary/${ontologyName?.split(' ').join('-')}`}
            className="cursor-pointer"
          >
            <GovTag
              color="success"
              type="subtle"
              size="xs"
              className="w-fit border bg-white! cursor-pointer"
            >
              <GovIcon
                name="journal-text"
                slot="icon-start"
                type="components"
              />

              <span className="font-bold text-blue-primary">
                {capitalizeFirst(ontologyName ?? '')}
              </span>
            </GovTag>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <GovButton type="outlined" color="neutral" size="s">
          Zavřít
        </GovButton>

        <GovButton
          type="solid"
          color="secondary"
          size="s"
          disabled={saveLayout.isPending}
          onGovClick={handleSaveLayout}
        >
          <GovIcon name="bookmark-plus" size="s" slot="icon-start" />
          {saveLayout.isPending ? 'Ukládání…' : 'Uložit návrh'}
        </GovButton>
        <GovButton
          type="solid"
          color="primary"
          size="s"
          disabled={saveLayout.isPending || materialize.isPending}
          onGovClick={handleMaterialize}
        >
          <GovIcon name="floppy" size="s" slot="icon-start" />
          {materialize.isPending ? 'Propisuji…' : 'Propsat do slovníku'}
        </GovButton>
      </div>
    </div>
  );
};
