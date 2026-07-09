import { useMemo } from 'react';

import { ConceptDetailModel } from '@/api/generated';
import { getConceptId, getConceptIri } from '../model/concept';
import { ConceptFlowEdge, ConceptFlowNode } from '../model/diagram';

export function useActiveConceptIds(
  nodes: ConceptFlowNode[],
  edges: ConceptFlowEdge[],
  concepts: ConceptDetailModel[],
) {
  return useMemo(() => {
    const ids = new Set<string>();

    for (const node of nodes) {
      ids.add(getConceptId(node.data.concept));

      for (const property of node.data.vlastnosti) {
        ids.add(getConceptId(property));
      }
    }

    const usedVztahIris = new Set(
      edges.map((e) => e.data?.vztahIri).filter(Boolean),
    );

    if (usedVztahIris.size) {
      for (const concept of concepts) {
        const iri = getConceptIri(concept);

        if (iri && usedVztahIris.has(iri)) {
          ids.add(getConceptId(concept));
        }
      }
    }

    return ids;
  }, [nodes, edges, concepts]);
}
