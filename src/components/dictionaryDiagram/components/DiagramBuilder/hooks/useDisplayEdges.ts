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
};

export const useDisplayEdges = ({
  edges,
  dispatch,
  pending,
}: UseDisplayEdgesProps) => {
  const displayEdges = useMemo(() => {
    const base = edges.map((e) => {
      const withCallbacks = {
        ...e,
        data: {
          ...e.data,
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
  }, [edges, pending, dispatch]);

  return { displayEdges };
};
