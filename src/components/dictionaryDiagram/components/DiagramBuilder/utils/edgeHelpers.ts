import { Connection, MarkerType } from '@xyflow/react';

import { ConceptFlowEdge } from '@/components/dictionaryDiagram/model/diagram';

export const hasIncompleteObecnyEdge = (edges: ConceptFlowEdge[]): boolean =>
  edges.some((e) => e.data?.kind === 'obecny' && !e.data?.label);

export const withEdgeMarkers = (edge: ConceptFlowEdge): ConceptFlowEdge => {
  const markerColor = edge.data?.pendingChange
    ? '#ca8504'
    : edge.data?.emphasis === 'connected'
      ? '#67329e'
      : undefined;
  if (edge.data?.kind === 'hierarchie') {
    return {
      ...edge,
      markerStart: {
        type: MarkerType.ArrowClosed,
        orient: 'auto-start-reverse',
        width: 12,
        height: 12,
        color: markerColor,
      },
    };
  }

  if (edge.data?.kind === 'obecny') {
    return {
      ...edge,
      markerStart: {
        type: MarkerType.Arrow,
        orient: 'auto-start-reverse',
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
    style: { strokeDasharray: '6 4', opacity: 0.6 },
  }) as ConceptFlowEdge;
