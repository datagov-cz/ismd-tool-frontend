'use client';

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { GovButton } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import {
  useGetDiagram,
  useGetOntologyDetail,
  useRenameDiagram,
} from '@/api/generated';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { isQueryLoading } from '@/lib/query';
import { PageLoader } from '../shared/PageLoader';

import { DiagramBuilder } from './components/DiagramBuilder';
import { DiagramConceptPicker } from './components/DiagramConceptPickerSidebox/DiagramConceptPicker';
import { DictionaryDiagramHeader } from './DictionaryDiagramHeader';
import { useActiveConceptIds } from './hooks/useActiveConceptIds';
import { useDiagramConcepts } from './hooks/useDiagramConcepts';
import { useDiagramInitialization } from './hooks/useDiagramInitialization';
import { withHistory } from './hooks/withHistory';
import { getConceptId } from './model/concept';
import { diagramReducer, initialDiagramState } from './model/diagram';

export const DictionaryDiagramWrapper = ({
  slug,
  id,
}: {
  slug: string;
  id: number;
}) => {
  const t = useTranslations('DictionaryDiagram');
  const encodedSlug = encodeURIComponent(slug);
  const diagram = useGetDiagram(encodedSlug, id);
  const ontology = useGetOntologyDetail(encodedSlug);
  const { invalidateDiagram } = useQueryInvalidator();

  const { ontologyName, concepts } = useDiagramConcepts(ontology.data);
  const hydratedDiagram = diagram.data?.data;
  const hasDiagramPayload =
    diagram.data?.success !== false && hydratedDiagram !== undefined;
  const hasOntologyPayload =
    ontology.data?.success !== false &&
    ontology.data?.data?.ontologyDetail !== undefined;
  const isInitialLoadPending =
    isQueryLoading(diagram) || isQueryLoading(ontology);
  const isReady = hasDiagramPayload && hasOntologyPayload;

  const [history, dispatch] = useReducer(withHistory(diagramReducer), {
    past: [],
    present: initialDiagramState,
    future: [],
    inDrag: false,
  });

  useDiagramInitialization(
    {
      concepts,
      diagram: hydratedDiagram,
      isReady,
      sourceKey: `${slug}:${id}`,
    },
    dispatch,
  );

  const { nodes, edges, removedOverlays } = history.present;
  const renameDiagram = useRenameDiagram({
    mutation: {
      onSuccess: async () => {
        await invalidateDiagram(slug, id);
        toast.success(t('RenameSuccess'));
      },
      onError: () => toast.error(t('RenameError')),
    },
  });

  const handleRenameDiagram = async (name: string) => {
    await renameDiagram.mutateAsync({
      ontologySlug: encodedSlug,
      diagramId: id,
      data: {
        name,
      },
    });
  };

  const activeConceptIds = useActiveConceptIds(nodes, edges);
  const diagramParentByConceptId = useMemo(() => {
    const parentByConceptId = new Map<string, string>();
    const nodeById = new Map(nodes.map((node) => [node.id, node]));

    for (const node of nodes) {
      for (const property of node.data.vlastnosti) {
        parentByConceptId.set(
          getConceptId(property),
          getConceptId(node.data.concept),
        );
      }
    }

    for (const edge of edges) {
      if (!edge.data?.vztahIri) continue;

      const sourceNode = nodeById.get(edge.source);
      if (sourceNode) {
        parentByConceptId.set(
          edge.data.vztahIri,
          getConceptId(sourceNode.data.concept),
        );
      }
    }

    return parentByConceptId;
  }, [edges, nodes]);
  const otherOntologyConceptsInDiagram = useMemo(() => {
    const localConceptIds = new Set(concepts.map(getConceptId));
    const usedConcepts = nodes.flatMap((node) => [
      node.data.concept,
      ...node.data.vlastnosti,
    ]);
    const usedRelationships = edges.flatMap((edge) =>
      edge.data?.vztahIri
        ? [
            {
              iri: edge.data.vztahIri,
              název: edge.data.label ? { cs: edge.data.label } : undefined,
              metadata: {
                iri: edge.data.vztahIri,
                label: edge.data.label,
                conceptType: 'VZTAH' as const,
              },
            },
          ]
        : [],
    );

    return Array.from(
      new Map(
        [...usedConcepts, ...usedRelationships]
          .filter((concept) => !localConceptIds.has(getConceptId(concept)))
          .map((concept) => [getConceptId(concept), concept]),
      ).values(),
    );
  }, [concepts, edges, nodes]);
  const [focusRequest, setFocusRequest] = useState<{
    conceptId: string;
    requestId: number;
  } | null>(null);
  const clearFocusRequest = useCallback(() => setFocusRequest(null), []);

  useEffect(() => {
    const focusConceptFromHash = () => {
      const hash = window.location.hash.slice(1);
      const isConceptHash = hash.startsWith('concept=');
      const encodedConceptIri = hash.startsWith('concept=')
        ? hash.slice('concept='.length)
        : hash;
      if (!encodedConceptIri) return;

      if (isConceptHash) {
        window.scrollTo(0, 0);
        requestAnimationFrame(() => window.scrollTo(0, 0));
      }

      try {
        setFocusRequest({
          conceptId: decodeURIComponent(encodedConceptIri),
          requestId: Date.now(),
        });
      } catch {
        setFocusRequest({
          conceptId: encodedConceptIri,
          requestId: Date.now(),
        });
      }
    };

    focusConceptFromHash();
    window.addEventListener('hashchange', focusConceptFromHash);
    return () => window.removeEventListener('hashchange', focusConceptFromHash);
  }, []);

  const [selectedConceptIds, setSelectedConceptIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [pendingEditsOpen, setPendingEditsOpen] = useState(false);
  const pendingConceptIds = useMemo(
    () =>
      pendingEditsOpen
        ? new Set(
            (hydratedDiagram?.pendingEdits ?? []).flatMap((edit) =>
              [edit.iri, edit.slug].filter(
                (id): id is string => id !== undefined,
              ),
            ),
          )
        : new Set<string>(),
    [hydratedDiagram?.pendingEdits, pendingEditsOpen],
  );
  const pendingEdgeIds = useMemo(
    () =>
      pendingEditsOpen
        ? new Set(
            (hydratedDiagram?.edges ?? []).flatMap((edge) =>
              edge.id &&
              (edge.data?.pending ||
                edge.data?.hasPendingEdits ||
                edge.data?.pendingEdit)
                ? [edge.id]
                : [],
            ),
          )
        : new Set<string>(),
    [hydratedDiagram?.edges, pendingEditsOpen],
  );
  const shouldGenerateInitialLayout =
    (hydratedDiagram?.version ?? 0) === 0 &&
    (hydratedDiagram?.nodes?.length ?? 0) === 0 &&
    (hydratedDiagram?.edges?.length ?? 0) === 0;
  const hasUnsavedChanges = history.past.length > 0;

  useUnsavedChangesGuard({
    enabled: hasUnsavedChanges,
    message: t('UnsavedChanges'),
  });

  if (isInitialLoadPending) {
    return (
      <main
        className="min-h-[calc(100vh-72px)] w-full bg-primary-subtlest"
        aria-label={t('Loading')}
      >
        <PageLoader className="min-h-[calc(100vh-72px)]" />
      </main>
    );
  }

  if (!isReady) {
    const isRetrying = diagram.isFetching || ontology.isFetching;

    return (
      <main className="min-h-[calc(100vh-72px)] w-full bg-primary-subtlest p-4">
        <section
          role="alert"
          className="mx-auto flex min-h-80 max-w-2xl flex-col items-center justify-center gap-4 text-center"
        >
          <h1 className="text-2xl font-bold">{t('LoadErrorTitle')}</h1>
          <p>{t('LoadErrorDescription')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <GovButton
              type="solid"
              color="primary"
              disabled={isRetrying}
              onGovClick={() => {
                void Promise.all([diagram.refetch(), ontology.refetch()]);
              }}
            >
              {isRetrying ? t('Retrying') : t('Retry')}
            </GovButton>
            <GovButton
              type="outlined"
              color="neutral"
              href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/dictionary/${encodedSlug}`}
            >
              {t('BackToDictionary')}
            </GovButton>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="p-4 bg-primary-subtlest w-full min-h-[calc(100vh-72px)] flex flex-col gap-4">
      <DictionaryDiagramHeader
        ontologyName={ontologyName}
        ontologySlug={slug}
        diagramId={id}
        diagramName={hydratedDiagram.name}
        concepts={concepts}
        nodes={nodes}
        edges={edges}
        removedOverlays={removedOverlays}
        diagramVersion={hydratedDiagram.version}
        hasUnsavedChanges={hasUnsavedChanges}
        onLayoutSaved={(expected, saved) =>
          dispatch({
            type: 'layoutSaved',
            expected,
            saved,
          })
        }
      />

      <div className="flex w-full gap-4 flex-1">
        <DiagramConceptPicker
          concepts={concepts}
          otherOntologyConceptsInDiagram={otherOntologyConceptsInDiagram}
          activeConceptIds={activeConceptIds}
          selectedConceptIds={selectedConceptIds}
          diagramParentByConceptId={diagramParentByConceptId}
          onActiveConceptClick={(conceptId) =>
            setFocusRequest({ conceptId, requestId: Date.now() })
          }
          pendingEdits={hydratedDiagram.pendingEdits ?? []}
          pendingEditsOpen={pendingEditsOpen}
          onPendingEditsOpenChange={setPendingEditsOpen}
        />

        <DiagramBuilder
          concepts={concepts}
          nodes={nodes}
          edges={edges}
          autoLayout={shouldGenerateInitialLayout}
          dispatch={dispatch}
          ontology={slug}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
          focusRequest={focusRequest}
          onFocusRequestHandled={clearFocusRequest}
          onSelectedConceptIdsChange={setSelectedConceptIds}
          pendingConceptIds={pendingConceptIds}
          pendingEdgeIds={pendingEdgeIds}
          diagramName={hydratedDiagram.name}
          renamingDiagram={renameDiagram.isPending}
          onRenameDiagram={handleRenameDiagram}
        />
      </div>
    </main>
  );
};
