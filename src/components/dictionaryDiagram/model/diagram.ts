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
  type Concept,
  getConceptId,
  getConceptIri,
  getConceptKind,
  getDefinicniObor,
} from './concept';

// --- node / edge typing ----------------------------------------------------

export type ConceptNodeData = {
  concept: Concept; // always a Třída
  vlastnosti: Concept[];
};

/**
 * Relationship kinds from the design (A–B / A>B / B>A / A=B).
 * Edges don't carry this yet — `connect` creates a plain edge. When the
 * "Vyberte typ vazby" chooser lands, it will set `data.kind` (+ direction)
 * and that's the only place that needs to change.
 */
export type RelationshipKind = 'obecny' | 'hierarchie' | 'ekvivalence';

export type ConceptEdgeData = {
  kind?: RelationshipKind;
  label?: string;
};

export type ConceptFlowNode = Node<ConceptNodeData, 'concept'>;
export type ConceptFlowEdge = Edge<ConceptEdgeData>;

export const isConceptNode = (node: Node): node is ConceptFlowNode =>
  node.type === 'concept';

// --- state + actions -------------------------------------------------------

export type DiagramState = {
  nodes: ConceptFlowNode[];
  edges: ConceptFlowEdge[];
};

export const initialDiagramState: DiagramState = { nodes: [], edges: [] };

export type DiagramAction =
  | { type: 'nodesChange'; changes: NodeChange<ConceptFlowNode>[] }
  | { type: 'edgesChange'; changes: EdgeChange<ConceptFlowEdge>[] }
  | { type: 'connect'; connection: Connection }
  | { type: 'init'; concepts: Concept[] } // <-- new
  | { type: 'applyLayout'; positions: Record<string, XYPosition> }
  | {
      type: 'placeTrida';
      concept: Concept;
      position: XYPosition;
      allConcepts: Concept[];
    }
  | { type: 'assignVlastnost'; targetNodeId: string; vlastnost: Concept };

// --- default layout --------------------------------------------------------

// const COL_GAP = 10;
// const ROW_GAP = 10;

export const getNadrazenaTrida = (c: Concept): string[] => {
  const v = c['nadřazená-třída'];
  return Array.isArray(v) ? v : v ? [v] : [];
};

export const getOborHodnot = (c: Concept): string | undefined =>
  c['obor-hodnot'] ?? undefined;

/**
 * Starting diagram derived from the ontology's concepts: one node per Třída,
 * each with its Vlastnosti attached (same rule as `placeTrida`), in a grid.
 * A Vlastnost attaches to the first Třída that claims it.
 */
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
      position: {
        x: i,
        y: i,
      },
      data: { concept, vlastnosti },
    };
  });

  // IRI -> React Flow node id. Only Třídy are nodes, so anything not in here
  // (Vlastnost, Literal, missing IRI) simply produces no edge.
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
    if (!source || !target) return; // an endpoint isn't a Třída on the canvas
    const key = `${source}->${target}:${data.kind}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({
      id: crypto.randomUUID(),
      source,
      target,
      sourceHandle: sourceIri, // handles are id'd by concept IRI
      targetHandle: targetIri,
      data,
    });
  };

  // Hierarchy: nadřazená třída (super) -> the Třída that declares it (sub).
  for (const trida of tridy) {
    for (const superIri of getNadrazenaTrida(trida)) {
      pushEdge(superIri, getConceptIri(trida) ?? '', { kind: 'hierarchie' });
    }
  }

  // Vztah: domain (definiční-obor) -> range (obor-hodnot).
  for (const vztah of concepts.filter((c) => getConceptKind(c) === 'vztah')) {
    const domain = getDefinicniObor(vztah);
    const range = getOborHodnot(vztah);
    if (!domain || !range) continue;
    pushEdge(domain, range, { kind: 'obecny', label: vztah.název?.cs });
  }

  return { nodes, edges };
};

// --- reducer ---------------------------------------------------------------
//
// All diagram rules live here. UI components dispatch intent; this decides
// what the diagram becomes. Relationship rules will be added to `connect`.

export const diagramReducer = (
  state: DiagramState,
  action: DiagramAction,
): DiagramState => {
  switch (action.type) {
    case 'nodesChange':
      return { ...state, nodes: applyNodeChanges(action.changes, state.nodes) };

    case 'edgesChange':
      return { ...state, edges: applyEdgeChanges(action.changes, state.edges) };

    case 'connect':
      // For now: a plain edge. Later: open the relationship chooser, then set
      // edge `data.kind` and direction based on the chosen vazba.
      return { ...state, edges: addEdge(action.connection, state.edges) };
    case 'init':
      return buildDefaultDiagram(action.concepts);

    case 'applyLayout':
      return {
        ...state,
        nodes: state.nodes.map((n) =>
          action.positions[n.id]
            ? { ...n, position: action.positions[n.id] }
            : n,
        ),
      };

    case 'placeTrida': {
      // Only one node per Třída.
      const tridaId = getConceptId(action.concept);
      if (state.nodes.some((n) => getConceptId(n.data.concept) === tridaId)) {
        return state;
      }

      // A Vlastnost can sit on only one Třída at a time — don't auto-steal
      // ones already assigned elsewhere.
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
        // attach to the target (no-op if already there)
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

        // remove from any other Třída (one Třída at a time)
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

    default:
      return state;
  }
};
