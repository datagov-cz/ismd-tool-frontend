'use client';

import { useCallback, useMemo, useReducer, useState } from 'react';

import { useGetDiagram, useGetOntologyDetail } from '@/api/generated';

import { DiagramBuilder } from './components/DiagramBuilder';
import { DiagramConceptPicker } from './components/DiagramConceptPickerSidebox/DiagramConceptPicker';
import { DictionaryDiagramHeader } from './DictionaryDiagramHeader';
import { useActiveConceptIds } from './hooks/useActiveConceptIds';
import { useDiagramConcepts } from './hooks/useDiagramConcepts';
import { useDiagramInitialization } from './hooks/useDiagramInitialization';
import { withHistory } from './hooks/withHistory';
import { getConceptId } from './model/concept';
import { diagramReducer, initialDiagramState } from './model/diagram';

export const DictionaryDiagramWrapper = ({ slug }: { slug: string }) => {
  const diagram = useGetDiagram(encodeURIComponent(slug));
  const ontology = useGetOntologyDetail(encodeURIComponent(slug));

  const { ontologyName, concepts } = useDiagramConcepts(ontology.data);

  const [history, dispatch] = useReducer(withHistory(diagramReducer), {
    past: [],
    present: initialDiagramState,
    future: [],
    inDrag: false,
  });

  useDiagramInitialization(
    concepts,
    diagram.data?.data,
    diagram.isPending,
    dispatch,
  );

  const { nodes, edges } = history.present;

  const activeConceptIds = useActiveConceptIds(nodes, edges);
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
  const [selectedConceptIds, setSelectedConceptIds] = useState<Set<string>>(
    () => new Set(),
  );

  return (
    <main className="p-4 bg-primary-subtlest w-full min-h-[calc(100vh-72px)] flex flex-col gap-4">
      <DictionaryDiagramHeader
        ontologyName={ontologyName}
        ontologySlug={slug}
        nodes={nodes}
        edges={edges}
        diagramVersion={diagram.data?.data?.version}
      />

      <div className="flex w-full gap-4 flex-1">
        <DiagramConceptPicker
          concepts={concepts}
          otherOntologyConceptsInDiagram={otherOntologyConceptsInDiagram}
          activeConceptIds={activeConceptIds}
          selectedConceptIds={selectedConceptIds}
          onActiveConceptClick={(conceptId) =>
            setFocusRequest({ conceptId, requestId: Date.now() })
          }
        />

        <DiagramBuilder
          concepts={concepts}
          nodes={nodes}
          edges={edges}
          autoLayout={!diagram.data?.data?.nodes?.length}
          dispatch={dispatch}
          ontology={slug}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
          focusRequest={focusRequest}
          onFocusRequestHandled={clearFocusRequest}
          onSelectedConceptIdsChange={setSelectedConceptIds}
        />
      </div>
    </main>
  );
};
