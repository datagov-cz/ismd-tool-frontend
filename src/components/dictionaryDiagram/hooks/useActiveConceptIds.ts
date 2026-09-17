import { useMemo } from 'react';

import { getConceptId } from '../model/concept';
import { ConceptFlowEdge, ConceptFlowNode } from '../model/diagram';

export function useActiveConceptIds(
  nodes: ConceptFlowNode[],
  edges: ConceptFlowEdge[],
) {
  return useMemo(() => {
    const ids = new Set<string>();

    for (const node of nodes) {
      ids.add(getConceptId(node.data.concept));

      for (const property of node.data.vlastnosti) {
        ids.add(getConceptId(property));
      }
    }

    for (const edge of edges) {
      if (edge.data?.vztahIri) ids.add(edge.data.vztahIri);
    }

    return ids;
  }, [nodes, edges]);
}
