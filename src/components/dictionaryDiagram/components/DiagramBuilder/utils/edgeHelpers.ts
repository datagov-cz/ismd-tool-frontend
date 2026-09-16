import { Connection, MarkerType } from '@xyflow/react';

import { ConceptFlowEdge } from '@/components/dictionaryDiagram/model/diagram';

export const hasIncompleteObecnyEdge = (edges: ConceptFlowEdge[]): boolean =>
  edges.some((edge) => edge.data?.kind === 'obecny' && !edge.data.vztahIri);

export const withEdgeMarkers = (edge: ConceptFlowEdge): ConceptFlowEdge => {
  const markerColor = edge.data?.pendingChange
    ? '#ca8504'
    : edge.data?.emphasis === 'connected'
      ? '#67329e'
      : undefined;
  if (edge.data?.kind === 'hierarchie') {
    return {
      ...edge,
      markerStart: undefined,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        orient: 'auto',
        width: 12,
        height: 12,
        color: markerColor,
      },
    };
  }

  if (edge.data?.kind === 'obecny') {
    return {
      ...edge,
      markerStart: undefined,
      markerEnd: {
        type: MarkerType.Arrow,
        orient: 'auto',
        width: 12,
        height: 12,
        color: markerColor,
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
    reconnectable: false,
    style: { strokeDasharray: '6 4', opacity: 0.6 },
  }) as ConceptFlowEdge;
