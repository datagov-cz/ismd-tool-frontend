import { Connection, MarkerType } from '@xyflow/react';

import { ConceptFlowEdge } from '@/components/dictionaryDiagram/model/diagram';

const DEFAULT_EDGE_COLOR = '#b1b1b7';
const EDGE_MARKER_SIZE = 34;

export const hasIncompleteObecnyEdge = (edges: ConceptFlowEdge[]): boolean =>
  edges.some((edge) => edge.data?.kind === 'obecny' && !edge.data.vztahIri);

export const withEdgeMarkers = (edge: ConceptFlowEdge): ConceptFlowEdge => {
  const markerColor = edge.data?.stale
    ? '#c62828'
    : edge.data?.pendingChange
      ? '#ca8504'
      : edge.data?.emphasis === 'connected'
        ? '#67329e'
        : DEFAULT_EDGE_COLOR;
  if (edge.data?.kind === 'hierarchie') {
    return {
      ...edge,
      markerStart: undefined,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        orient: 'auto',
        markerUnits: 'userSpaceOnUse',
        width: EDGE_MARKER_SIZE,
        height: EDGE_MARKER_SIZE,
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
        markerUnits: 'userSpaceOnUse',
        width: EDGE_MARKER_SIZE,
        height: EDGE_MARKER_SIZE,
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
    markerEnd: {
      type: MarkerType.Arrow,
      orient: 'auto',
      markerUnits: 'userSpaceOnUse',
      width: EDGE_MARKER_SIZE,
      height: EDGE_MARKER_SIZE,
      color: DEFAULT_EDGE_COLOR,
    },
  }) as ConceptFlowEdge;
