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
  useDeleteDiagram,
  useMaterialize,
  useSaveLayout,
} from '@/api/generated';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';

import { hasIncompleteObecnyEdge } from './components/DiagramBuilder/utils/edgeHelpers';
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
  droppedEdgeIds,
} from './model/diagram';
import { getStaleDiagramItems, StaleItemsDialog } from './StaleItemsDialog';
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
  onLayoutSaved: (
    _expected: { nodes: ConceptFlowNode[]; edges: ConceptFlowEdge[] },
    _saved: { nodes: ConceptFlowNode[]; edges: ConceptFlowEdge[] },
  ) => void;
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
  const [pendingSaveAction, setPendingSaveAction] = useState<
    'save' | 'materialize' | null
  >(null);
  const t = useTranslations('ConceptDetail');
  const td = useTranslations('DictionaryDiagram.Header');
  const tc = useTranslations('DictionaryDiagram.Canvas');
  const { invalidateDiagram, invalidateOntology } = useQueryInvalidator();
  const openMaterializationConflicts = (value: unknown) => {
    const responseConflicts = getMaterializationConflicts(value);
    if (!responseConflicts) return false;
    setConflicts(responseConflicts);
    return true;
  };
  const saveLayout = useSaveLayout({
    mutation: {
      onSuccess: async () => {
        await invalidateDiagram(ontologySlug, diagramId);
        toast.success(td('SaveSuccess'));
      },
      onError: () => toast.error(td('SaveError')),
    },
  });

  const deleteDiagram = useDeleteDiagram({
    mutation: {
      onSuccess: async () => {
        await invalidateOntology(ontologySlug);
        toast.success(td('Deleted'));
        router.push(`/dictionary/${ontologySlug}`);
      },
      onError: () => toast.error(td('DeleteError')),
    },
  });
  const materialize = useMaterialize({
    mutation: {
      onSuccess: async (response) => {
        if (openMaterializationConflicts(response)) return;

        setConflicts([]);
        await Promise.all([
          invalidateDiagram(ontologySlug, diagramId),
          invalidateOntology(ontologySlug),
        ]);
        if (response.success === false || response.data?.failed?.length) {
          toast.error(td('MaterializePartialError'));
        } else if (response.data?.skippedStale?.length) {
          toast.warn(td('MaterializeSkippedStale'));
        } else {
          toast.success(td('MaterializeSuccess'));
        }
      },
      onError: (error) => {
        if (openMaterializationConflicts(error)) return;

        toast.error(td('MaterializeError'));
      },
    },
  });

  const staleItems = getStaleDiagramItems(nodes, edges);
  const staleConceptIris = Array.from(
    new Set(
      staleItems.flatMap((item) => (item.conceptIri ? [item.conceptIri] : [])),
    ),
  );

  const withoutStaleItems = () => {
    const filteredNodes = nodes
      .filter((node) => !node.data.concept.stale)
      .map((node) => ({
        ...node,
        data: {
          ...node.data,
          vlastnosti: node.data.vlastnosti.filter(
            (property) => !property.stale,
          ),
        },
      }));
    const retainedNodeIds = new Set(filteredNodes.map((node) => node.id));
    const filteredEdges = edges.filter(
      (edge) =>
        !edge.data?.stale &&
        retainedNodeIds.has(edge.source) &&
        retainedNodeIds.has(edge.target),
    );

    return { nodes: filteredNodes, edges: filteredEdges };
  };

  const saveAndMaybeMaterialize = async (
    action: 'save' | 'materialize',
    savedNodes: ConceptFlowNode[],
    savedEdges: ConceptFlowEdge[],
    clearStaleOverlays = false,
  ) => {
    const encodedOntologySlug = encodeURIComponent(ontologySlug);

    const payload = buildDiagramLayoutDto(
      savedNodes,
      savedEdges,
      diagramVersion ?? 0,
      clearStaleOverlays
        ? [
            ...removedOverlays.filter(
              (overlay) => !staleConceptIris.includes(overlay.conceptIri),
            ),
            ...staleConceptIris.map((conceptIri) => ({ conceptIri })),
          ]
        : removedOverlays,
    );

    let response;
    try {
      response = await saveLayout.mutateAsync({
        ontologySlug: encodedOntologySlug,
        diagramId,
        data: payload,
      });
    } catch {
      // The save mutation displays the error; materialization must not continue.
      return;
    }

    // The server keeps every edge row it accepts, so sent and returned should match. A mismatch means
    // the canvas is now showing edges the server does not have; say so instead of letting it surface on
    // the next reload. Reporting only — the canvas keeps the user's state.
    const dropped = droppedEdgeIds(payload, response?.data);
    if (dropped.length > 0) {
      console.error('[diagram] edges sent but not saved:', dropped);
      toast.warning(td('SaveEdgesDropped', { count: dropped.length }));
    }

    onLayoutSaved({ nodes, edges }, { nodes: savedNodes, edges: savedEdges });

    if (action === 'materialize') {
      materialize.mutate({ ontologySlug: encodedOntologySlug, diagramId });
    }
  };

  const requestSave = (action: 'save' | 'materialize') => {
    if (hasIncompleteObecnyEdge(edges)) {
      toast.info(tc('CompleteRelationshipFirst'));
      return;
    }

    if (staleItems.length > 0) {
      setPendingSaveAction(action);
      return;
    }

    void saveAndMaybeMaterialize(action, nodes, edges);
  };

  const handleSaveLayout = () => requestSave('save');

  const handleDeleteDiagram = () => {
    deleteDiagram.mutate({
      ontologySlug: encodeURIComponent(ontologySlug),
      diagramId,
    });
  };

  const handleMaterialize = () => requestSave('materialize');

  const resolveStaleItems = (remove: boolean) => {
    if (!pendingSaveAction) return;

    const action = pendingSaveAction;
    const savedDiagram = remove ? withoutStaleItems() : { nodes, edges };
    setPendingSaveAction(null);
    void saveAndMaybeMaterialize(
      action,
      savedDiagram.nodes,
      savedDiagram.edges,
      remove,
    );
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
              href={`/dictionary/${ontologySlug}`}
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
            disabled={
              saveLayout.isPending ||
              materialize.isPending ||
              deleteDiagram.isPending
            }
            href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/dictionary/${encodeURIComponent(ontologySlug)}`}
          >
            {td('Close')}
          </GovButton>

          <GovButton
            type="solid"
            color="secondary"
            size="s"
            disabled={
              saveLayout.isPending ||
              !hasUnsavedChanges ||
              deleteDiagram.isPending
            }
            onGovClick={handleSaveLayout}
          >
            <GovIcon name="bookmark-plus" size="s" slot="icon-start" />
            {saveLayout.isPending ? td('Saving') : td('SaveDraft')}
          </GovButton>
          <GovButton
            type="solid"
            color="primary"
            size="s"
            disabled={
              saveLayout.isPending ||
              materialize.isPending ||
              deleteDiagram.isPending
            }
            onGovClick={handleMaterialize}
          >
            <GovIcon name="floppy" size="s" slot="icon-start" />
            {materialize.isPending ? td('Materializing') : td('Materialize')}
          </GovButton>
          <GovButton
            type="solid"
            color="error"
            size="s"
            disabled={
              saveLayout.isPending ||
              materialize.isPending ||
              deleteDiagram.isPending
            }
            onGovClick={handleDeleteDiagram}
          >
            <GovIcon name="trash" size="s" slot="icon-start" />
            {deleteDiagram.isPending ? td('Deleting') : td('Delete')}
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
      <StaleItemsDialog
        open={pendingSaveAction !== null}
        items={staleItems}
        pending={saveLayout.isPending || materialize.isPending}
        onClose={() => setPendingSaveAction(null)}
        onKeep={() => resolveStaleItems(false)}
        onRemove={() => resolveStaleItems(true)}
      />
    </>
  );
};
