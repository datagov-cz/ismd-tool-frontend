import Dagre from '@dagrejs/dagre';
import type { XYPosition } from '@xyflow/react';

import type { ConceptFlowEdge, ConceptFlowNode } from './diagram';

export const layoutWithDagre = (
  nodes: ConceptFlowNode[],
  edges: ConceptFlowEdge[],
  direction: 'TB' | 'LR' = 'TB',
): Record<string, XYPosition> => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 10, ranksep: 100 });

  for (const node of nodes) {
    g.setNode(node.id, {
      width: node.measured?.width,
      height: node.measured?.height,
    });
  }
  for (const edge of edges) g.setEdge(edge.source, edge.target);

  Dagre.layout(g);

  const positions: Record<string, XYPosition> = {};
  for (const node of nodes) {
    const { x, y, width, height } = g.node(node.id);
    positions[node.id] = { x: x - width / 2, y: y - height / 2 };
  }
  return positions;
};
