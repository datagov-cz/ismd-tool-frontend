'use client';

import { useState } from 'react';
import { GovButton, GovIcon, GovTag } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import {
  DiagramLayoutOverlay,
  MaterializeOnConflict,
  useMaterialize,
  useSaveLayout,
} from '@/api/generated';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';

import {
  getMaterializationConflicts,
  MaterializationConflict,
  MaterializationConflictDialog,
} from './MaterializationConflictDialog';
import { Concept } from './model/concept';
import {
  buildDiagramLayoutDto,
  ConceptFlowEdge,
  ConceptFlowNode,
} from './model/diagram';
import { capitalizeFirst } from './utils/capitalizeFirst';

type DictionaryDiagramHeaderProps = {
  ontologyName?: string;
  ontologySlug: string;
  diagramId: number;
  diagramName?: string;
  concepts: Concept[];
  nodes: ConceptFlowNode[];
  edges: ConceptFlowEdge[];
  removedOverlays: DiagramLayoutOverlay[];
  diagramVersion?: number;
  hasUnsavedChanges: boolean;
  onLayoutSaved: () => void;
};

export const DictionaryDiagramHeader = ({
  ontologyName,
  ontologySlug,
  diagramId,
  diagramName,
  concepts,
  nodes,
  edges,
  removedOverlays,
  diagramVersion,
  hasUnsavedChanges,
  onLayoutSaved,
}: DictionaryDiagramHeaderProps) => {
  const router = useRouter();
  const [conflicts, setConflicts] = useState<MaterializationConflict[]>([]);
  const t = useTranslations('ConceptDetail');
  const td = useTranslations('DictionaryDiagram.Header');
  const { invalidateDiagram, invalidateOntology } = useQueryInvalidator();
  const saveLayout = useSaveLayout({
    mutation: {
      onSuccess: async () => {
        onLayoutSaved();
        await invalidateDiagram(ontologySlug, diagramId);
        toast.success(td('SaveSuccess'));
      },
      onError: () => toast.error(td('SaveError')),
    },
  });
  const materialize = useMaterialize({
    mutation: {
      onSuccess: async (response) => {
        const responseConflicts = getMaterializationConflicts(response);
        if (responseConflicts) {
          setConflicts(responseConflicts);
          return;
        }

        setConflicts([]);
        await Promise.all([
          invalidateDiagram(ontologySlug, diagramId),
          invalidateOntology(ontologySlug),
        ]);
        toast.success(td('MaterializeSuccess'));
      },
      onError: (error) => {
        const responseConflicts = getMaterializationConflicts(error);
        if (responseConflicts) {
          setConflicts(responseConflicts);
          return;
        }

        toast.error(td('MaterializeError'));
      },
    },
  });

  const handleSaveLayout = () => {
    saveLayout.mutate({
      ontologySlug: encodeURIComponent(ontologySlug),
      diagramId,
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
        diagramId,
        data: {
          ...buildDiagramLayoutDto(
            nodes,
            edges,
            diagramVersion ?? 0,
            removedOverlays,
          ),
        },
      });

      materialize.mutate({ ontologySlug: encodedOntologySlug, diagramId });
    } catch {
      // The save mutation displays the error; materialization must not continue.
    }
  };

  const resolveConflicts = (
    resolution: MaterializeOnConflict,
    winnerDiagramId?: number,
  ) => {
    materialize.mutate({
      ontologySlug: encodeURIComponent(ontologySlug),
      diagramId,
      params: { onConflict: resolution, winnerDiagramId },
    });
  };

  return (
    <>
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

                <span className="font-bold text-blue-primary cursor-pointer">
                  {capitalizeFirst(ontologyName ?? '')}
                </span>
              </GovTag>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GovButton
            type="outlined"
            color="neutral"
            size="s"
            href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/dictionary/${encodeURIComponent(ontologySlug)}`}
          >
            {td('Close')}
          </GovButton>

          <GovButton
            type="solid"
            color="secondary"
            size="s"
            disabled={saveLayout.isPending || !hasUnsavedChanges}
            onGovClick={handleSaveLayout}
          >
            <GovIcon name="bookmark-plus" size="s" slot="icon-start" />
            {saveLayout.isPending ? td('Saving') : td('SaveDraft')}
          </GovButton>
          <GovButton
            type="solid"
            color="primary"
            size="s"
            disabled={saveLayout.isPending || materialize.isPending}
            onGovClick={handleMaterialize}
          >
            <GovIcon name="floppy" size="s" slot="icon-start" />
            {materialize.isPending ? td('Materializing') : td('Materialize')}
          </GovButton>
        </div>
      </div>

      <MaterializationConflictDialog
        open={conflicts.length > 0}
        conflicts={conflicts}
        ontologySlug={ontologySlug}
        currentDiagramName={diagramName}
        concepts={concepts}
        pending={materialize.isPending}
        onClose={() => setConflicts([])}
        onResolve={resolveConflicts}
      />
    </>
  );
};
