import { Dispatch, useMemo } from 'react';
import { Connection, XYPosition } from '@xyflow/react';

import { HistoryAction } from '@/components/dictionaryDiagram/hooks/withHistory';
import {
  Concept,
  getConceptIri,
} from '@/components/dictionaryDiagram/model/concept';
import { ConceptFlowEdge } from '@/components/dictionaryDiagram/model/diagram';
import { createPendingEdge, withEdgeMarkers } from '../utils/edgeHelpers';

type UseDisplayEdgesProps = {
  edges: ConceptFlowEdge[];
  dispatch: Dispatch<HistoryAction>;
  pending: Connection | null;
  focusedNodeIds: ReadonlySet<string>;
};

export const useDisplayEdges = ({
  edges,
  dispatch,
  pending,
  focusedNodeIds,
}: UseDisplayEdgesProps) => {
  const displayEdges = useMemo(() => {
    const base = edges.map((e) => {
      const isConnected =
        focusedNodeIds.size === 0 ||
        focusedNodeIds.has(e.source) ||
        focusedNodeIds.has(e.target);
      const emphasis: 'connected' | 'dimmed' | undefined =
        focusedNodeIds.size === 0
          ? undefined
          : isConnected
            ? 'connected'
            : 'dimmed';
      const withCallbacks = {
        ...e,
        data: {
          ...e.data,
          emphasis,
          onBendsChange: (bends?: XYPosition[]) =>
            dispatch({ type: 'setEdgeBends', edgeId: e.id, bends }),
          ...(e.data?.kind === 'obecny'
            ? {
                onDropVztah: (vztah: Concept) => {
                  const iri = getConceptIri(vztah);
                  if (edges.some((x) => x.data?.vztahIri === iri)) return;
                  dispatch({ type: 'setEdgeVztah', edgeId: e.id, vztah });
                },
              }
            : {}),
        },
      };

      return withEdgeMarkers(withCallbacks);
    });

    return pending ? [...base, createPendingEdge(pending)] : base;
  }, [edges, pending, dispatch, focusedNodeIds]);

  return { displayEdges };
};
