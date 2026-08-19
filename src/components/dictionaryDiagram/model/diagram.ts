import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type XYPosition,
} from '@xyflow/react';

import {
  type DiagramDto,
  type DiagramLayoutDto,
  EdgeEdgeKind,
} from '@/api/generated';

import {
  type Concept,
  getConceptId,
  getConceptIri,
  getConceptKind,
  getDefinicniObor,
} from './concept';

export type ConceptNodeData = {
  concept: Concept;
  vlastnosti: Concept[];
  onFocus?: () => void;
};

export type RelationshipKind = 'obecny' | 'hierarchie' | 'ekvivalence';

export type ConceptEdgeData = {
  kind?: RelationshipKind;
  label?: string;
  vztahIri?: string;
  bends?: XYPosition[];
  emphasis?: 'connected' | 'dimmed';
};

export type ConceptFlowNode = Node<ConceptNodeData, 'concept'>;
export type ConceptFlowEdge = Edge<ConceptEdgeData>;

export const isConceptNode = (node: Node): node is ConceptFlowNode =>
  node.type === 'concept';

export type DiagramState = {
  nodes: ConceptFlowNode[];
  edges: ConceptFlowEdge[];
};

export const initialDiagramState: DiagramState = { nodes: [], edges: [] };

export type DiagramAction =
  | { type: 'nodesChange'; changes: NodeChange<ConceptFlowNode>[] }
  | { type: 'edgesChange'; changes: EdgeChange<ConceptFlowEdge>[] }
  | {
      type: 'connect';
      connection: Connection;
      id?: string;
      kind?: RelationshipKind;
      swap?: boolean;
    }
  | {
      type: 'setEdgeKind';
      edgeId: string;
      kind: RelationshipKind;
      swap?: boolean;
    }
  | { type: 'setEdgeVztah'; edgeId: string; vztah: Concept }
  | { type: 'setEdgeBends'; edgeId: string; bends?: XYPosition[] }
  | { type: 'init'; concepts: Concept[]; diagram?: DiagramDto }
  | { type: 'applyLayout'; positions: Record<string, XYPosition> }
  | {
      type: 'placeTrida';
      concept: Concept;
      position: XYPosition;
      allConcepts: Concept[];
    }
  | { type: 'assignVlastnost'; targetNodeId: string; vlastnost: Concept }
  | {
      type: 'removeVlastnost';
      targetNodeId: string;
      vlastnostId: string;
    };

export const getNadrazenaTrida = (c: Concept): string[] => {
  const v = c['nadřazená-třída'];
  return Array.isArray(v) ? v : v ? [v] : [];
};

export const getOborHodnot = (c: Concept): string | undefined =>
  c['obor-hodnot'] ?? undefined;

export const buildDefaultDiagram = (concepts: Concept[]): DiagramState => {
  const assigned = new Set<string>();
  const tridy = concepts.filter((c) => getConceptKind(c) === 'trida');

  const nodes: ConceptFlowNode[] = tridy.map((concept, i) => {
    const vlastnosti = concepts.filter(
      (c) =>
        getConceptKind(c) === 'vlastnost' &&
        getDefinicniObor(c) === getConceptIri(concept) &&
        !assigned.has(getConceptId(c)),
    );
    for (const v of vlastnosti) assigned.add(getConceptId(v));

    return {
      id: crypto.randomUUID(),
      type: 'concept' as const,
      position: { x: i, y: i },
      data: { concept, vlastnosti },
    };
  });

  const nodeIdByIri = new Map(
    nodes.map((n) => [getConceptIri(n.data.concept), n.id]),
  );

  const edges: ConceptFlowEdge[] = [];
  const seen = new Set<string>();

  const pushEdge = (
    sourceIri: string,
    targetIri: string,
    data: ConceptEdgeData,
  ) => {
    const source = nodeIdByIri.get(sourceIri);
    const target = nodeIdByIri.get(targetIri);
    if (!source || !target) return;
    const key = `${source}->${target}:${data.kind}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({
      id: crypto.randomUUID(),
      source,
      target,
      data,
    });
  };

  for (const trida of tridy) {
    for (const superIri of getNadrazenaTrida(trida)) {
      pushEdge(superIri, getConceptIri(trida) ?? '', { kind: 'hierarchie' });
    }
  }

  for (const vztah of concepts.filter((c) => getConceptKind(c) === 'vztah')) {
    const domain = getDefinicniObor(vztah);
    const range = getOborHodnot(vztah);
    if (!domain || !range) continue;
    pushEdge(domain, range, {
      kind: 'obecny',
      label: vztah.název?.cs,
      vztahIri: getConceptIri(vztah),
    });
  }

  return { nodes, edges };
};

const edgeKindFromDto = (
  edgeKind: (typeof EdgeEdgeKind)[keyof typeof EdgeEdgeKind],
): RelationshipKind => {
  switch (edgeKind) {
    case EdgeEdgeKind.SUBCLASS_OF:
    case EdgeEdgeKind.SUB_PROPERTY:
    case EdgeEdgeKind.SUB_RELATION:
      return 'hierarchie';
    case EdgeEdgeKind.EXACT_MATCH:
      return 'ekvivalence';
    default:
      return 'obecny';
  }
};

const edgeKindToDto = (kind?: RelationshipKind) => {
  switch (kind) {
    case 'hierarchie':
      return EdgeEdgeKind.SUBCLASS_OF;
    case 'ekvivalence':
      return EdgeEdgeKind.EXACT_MATCH;
    default:
      return EdgeEdgeKind.RANGE;
  }
};

export const buildDiagramLayoutDto = (
  nodes: ConceptFlowNode[],
  edges: ConceptFlowEdge[],
  version: number,
): DiagramLayoutDto => {
  const persistedIdByNodeId = new Map(
    nodes.map((node) => [
      node.id.replace('iri:', ''),
      getConceptId(node.data.concept),
    ]),
  );

  const edges1 = edges.flatMap((edge) => {
    const source = persistedIdByNodeId.get(edge.source.replace('iri:', ''));
    const target = persistedIdByNodeId.get(edge.target.replace('iri:', ''));
    if (!source || !target) return [];

    return [
      {
        id: edge.data?.vztahIri ?? edge.id,
        source,
        target,
        edgeKind: edgeKindToDto(edge.data?.kind),
      },
    ];
  });

  return {
    nodes: nodes.map((node) => ({
      id: persistedIdByNodeId.get(node.id) ?? node.id,
      position: node.position,
      parentId: node.parentId
        ? persistedIdByNodeId.get(node.parentId)
        : undefined,
    })),
    edges: edges1,
    version,
  };
};

export const buildPersistedDiagram = (
  concepts: Concept[],
  diagram: DiagramDto,
): DiagramState => {
  const conceptsById = new Map<string, Concept>();

  for (const concept of concepts) {
    const metadata = concept.metadata;
    const aliases = [
      getConceptId(concept),
      concept.iri,
      concept.identifikátor,
      concept.slug,
      metadata?.slug,
      metadata && 'conceptIri' in metadata ? metadata.conceptIri : undefined,
      metadata?.id?.toString(),
    ];

    for (const alias of aliases) {
      if (alias) conceptsById.set(alias, concept);
    }
  }
  const assignedProperties = new Set<string>();

  const nodes: ConceptFlowNode[] = (diagram.nodes ?? []).flatMap(
    (savedNode) => {
      const concept = conceptsById.get(savedNode.id.replace(/^iri:/, ''));
      if (!concept || getConceptKind(concept) !== 'trida') return [];

      const vlastnosti = concepts.filter(
        (candidate) =>
          getConceptKind(candidate) === 'vlastnost' &&
          getDefinicniObor(candidate) === getConceptIri(concept) &&
          !assignedProperties.has(getConceptId(candidate)),
      );
      vlastnosti.forEach((property) =>
        assignedProperties.add(getConceptId(property)),
      );
      return [
        {
          id: savedNode.id.replace('iri:', ''),
          type: 'concept' as const,
          position: savedNode.position,
          parentId: savedNode.parentId,
          data: { concept, vlastnosti },
        },
      ];
    },
  );

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const relationshipConcepts = concepts.filter(
    (concept) => getConceptKind(concept) === 'vztah',
  );

  const edges: ConceptFlowEdge[] = (diagram.edges ?? []).flatMap(
    (savedEdge) => {
      const sourceNode = nodeById.get(savedEdge.source);
      const targetNode = nodeById.get(savedEdge.target);
      if (!sourceNode || !targetNode) return [];

      const relationship = relationshipConcepts.find(
        (concept) =>
          getDefinicniObor(concept) ===
            getConceptIri(sourceNode.data.concept) &&
          getOborHodnot(concept) === getConceptIri(targetNode.data.concept),
      );

      return [
        {
          id: savedEdge.id,
          source: savedEdge.source,
          target: savedEdge.target,
          data: {
            kind: edgeKindFromDto(savedEdge.edgeKind),
            label: relationship?.název?.cs,
            vztahIri: relationship && getConceptIri(relationship),
          },
        },
      ];
    },
  );
  return { nodes, edges };
};

export const diagramReducer = (
  state: DiagramState,
  action: DiagramAction,
): DiagramState => {
  switch (action.type) {
    case 'nodesChange':
      return { ...state, nodes: applyNodeChanges(action.changes, state.nodes) };

    case 'edgesChange':
      return { ...state, edges: applyEdgeChanges(action.changes, state.edges) };

    case 'connect': {
      const edgeId = action.id ?? crypto.randomUUID();
      const c = action.connection;
      const conn: Connection = action.swap
        ? {
            ...c,
            source: c.target,
            target: c.source,
          }
        : c;
      return {
        ...state,
        edges: addEdge(
          {
            ...conn,
            id: edgeId,
            ...(action.kind ? { data: { kind: action.kind } } : {}),
          },
          state.edges,
        ),
      };
    }

    case 'setEdgeKind':
      return {
        ...state,
        edges: state.edges.map((edge) => {
          if (edge.id !== action.edgeId) return edge;
          const base = action.swap
            ? {
                ...edge,
                source: edge.target,
                target: edge.source,
              }
            : edge;
          return {
            ...base,
            data:
              action.kind === 'obecny'
                ? { ...base.data, kind: action.kind }
                : {
                    ...base.data,
                    kind: action.kind,
                    label: undefined,
                    vztahIri: undefined,
                  },
          };
        }),
      };

    case 'setEdgeVztah':
      return {
        ...state,
        edges: state.edges.map((e) => {
          return e.id === action.edgeId && e.data?.kind === 'obecny'
            ? {
                ...e,
                data: {
                  ...e.data,
                  label: action.vztah.název?.cs,
                  vztahIri: getConceptIri(action.vztah),
                },
              }
            : e;
        }),
      };

    case 'setEdgeBends':
      return {
        ...state,
        edges: state.edges.map((e) =>
          e.id === action.edgeId
            ? {
                ...e,
                data: {
                  ...e.data,
                  bends: action.bends?.length ? action.bends : undefined,
                },
              }
            : e,
        ),
      };

    case 'init':
      return action.diagram
        ? buildPersistedDiagram(action.concepts, action.diagram)
        : buildDefaultDiagram(action.concepts);

    case 'applyLayout':
      return {
        nodes: state.nodes.map((n) =>
          action.positions[n.id]
            ? { ...n, position: action.positions[n.id] }
            : n,
        ),
        edges: state.edges.map((e) =>
          e.data?.bends ? { ...e, data: { ...e.data, bends: undefined } } : e,
        ),
      };

    case 'placeTrida': {
      const tridaId = getConceptId(action.concept);
      if (state.nodes.some((n) => getConceptId(n.data.concept) === tridaId)) {
        return state;
      }

      const assigned = new Set(
        state.nodes.flatMap((n) => n.data.vlastnosti.map(getConceptId)),
      );

      const vlastnosti = action.allConcepts.filter(
        (c) =>
          getConceptKind(c) === 'vlastnost' &&
          getDefinicniObor(c) === getConceptIri(action.concept) &&
          !assigned.has(getConceptId(c)),
      );

      const node: ConceptFlowNode = {
        id: crypto.randomUUID(),
        type: 'concept',
        position: action.position,
        data: { concept: action.concept, vlastnosti },
      };

      return { ...state, nodes: [...state.nodes, node] };
    }

    case 'assignVlastnost': {
      const vlId = getConceptId(action.vlastnost);
      if (!state.nodes.some((n) => n.id === action.targetNodeId)) return state;

      const nodes = state.nodes.map((node) => {
        if (node.id === action.targetNodeId) {
          if (node.data.vlastnosti.some((v) => getConceptId(v) === vlId)) {
            return node;
          }
          return {
            ...node,
            data: {
              ...node.data,
              vlastnosti: [...node.data.vlastnosti, action.vlastnost],
            },
          };
        }

        if (node.data.vlastnosti.some((v) => getConceptId(v) === vlId)) {
          return {
            ...node,
            data: {
              ...node.data,
              vlastnosti: node.data.vlastnosti.filter(
                (v) => getConceptId(v) !== vlId,
              ),
            },
          };
        }

        return node;
      });

      return { ...state, nodes };
    }

    case 'removeVlastnost': {
      const targetNode = state.nodes.find(
        (node) => node.id === action.targetNodeId,
      );
      if (
        !targetNode?.data.vlastnosti.some(
          (vlastnost) => getConceptId(vlastnost) === action.vlastnostId,
        )
      ) {
        return state;
      }

      const nodes = state.nodes.map((node) =>
        node.id === action.targetNodeId
          ? {
              ...node,
              data: {
                ...node.data,
                vlastnosti: node.data.vlastnosti.filter(
                  (vlastnost) => getConceptId(vlastnost) !== action.vlastnostId,
                ),
              },
            }
          : node,
      );

      return { ...state, nodes };
    }

    default:
      return state;
  }
};
