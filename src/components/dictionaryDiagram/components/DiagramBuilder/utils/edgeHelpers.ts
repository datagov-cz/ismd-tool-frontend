import { Connection, MarkerType } from '@xyflow/react';

import { ConceptFlowEdge } from '@/components/dictionaryDiagram/model/diagram';

export const hasIncompleteObecnyEdge = (edges: ConceptFlowEdge[]): boolean =>
  edges.some((e) => e.data?.kind === 'obecny' && !e.data?.label);

export const withEdgeMarkers = (edge: ConceptFlowEdge): ConceptFlowEdge => {
  if (edge.data?.kind === 'hierarchie') {
    return {
      ...edge,
      markerStart: {
        type: MarkerType.ArrowClosed,
        orient: 'auto-start-reverse',
        width: 20,
        height: 20,
      },
    };
  }

  if (edge.data?.kind === 'obecny') {
    return {
      ...edge,
      markerStart: {
        type: MarkerType.Arrow,
        orient: 'auto-start-reverse',
        width: 20,
        height: 20,
      },
    };
  }

  return edge;
};

export const createPendingEdge = (pending: Connection): ConceptFlowEdge =>
  ({
    id: 'pending-edge',
    source: pending.source,
    target: pending.target,
    sourceHandle: pending.sourceHandle ?? undefined,
    targetHandle: pending.targetHandle ?? undefined,
    style: { strokeDasharray: '6 4', opacity: 0.6 },
  }) as ConceptFlowEdge;
