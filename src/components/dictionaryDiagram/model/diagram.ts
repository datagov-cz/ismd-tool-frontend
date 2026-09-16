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
  DiagramEdgeDataEdgeKind,
  type DiagramLayoutDto,
  type DiagramLayoutOverlay,
} from '@/api/generated';

import {
  type Concept,
  getConceptId,
  getConceptIri,
  getConceptKind,
  getDefinicniObor,
  getLabelFromConceptIri,
} from './concept';

export type ConceptNodeData = {
  concept: Concept;
  vlastnosti: Concept[];
  readOnly?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onRemove?: () => void;
};

export type RelationshipKind = 'obecny' | 'hierarchie' | 'ekvivalence';

export type ConceptEdgeData = {
  kind?: RelationshipKind;
  label?: string;
  vztahIri?: string;
  bends?: XYPosition[];
  emphasis?: 'connected' | 'dimmed';
  pendingChange?: boolean;
  stale?: boolean;
};

export type ConceptFlowNode = Node<ConceptNodeData, 'concept'>;
export type ConceptFlowEdge = Edge<ConceptEdgeData>;

export const isConceptNode = (node: Node): node is ConceptFlowNode =>
  node.type === 'concept';

export type DiagramState = {
  nodes: ConceptFlowNode[];
  edges: ConceptFlowEdge[];
  removedOverlays: DiagramLayoutOverlay[];
};

type DiagramContent = Pick<DiagramState, 'nodes' | 'edges'>;

export const initialDiagramState: DiagramState = {
  nodes: [],
  edges: [],
  removedOverlays: [],
};

export type DiagramAction =
  | { type: 'nodesChange'; changes: NodeChange<ConceptFlowNode>[] }
  | { type: 'edgesChange'; changes: EdgeChange<ConceptFlowEdge>[] }
  | { type: 'removeNode'; nodeId: string }
  | {
      type: 'connect';
      connection: Connection;
      kind?: RelationshipKind;
      swap?: boolean;
    }
  | {
      type: 'reconnect';
      edgeId: string;
      connection: Connection;
    }
  | {
      type: 'setEdgeKind';
      edgeId: string;
      kind: RelationshipKind;
      swap?: boolean;
    }
  | { type: 'setEdgeVztah'; edgeId: string; vztah: Concept }
  | { type: 'setEdgeBends'; edgeId: string; bends?: XYPosition[] }
  | { type: 'clearDiagram' }
  | {
      type: 'layoutSaved';
      expected: DiagramContent;
      saved: DiagramContent;
    }
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
    const key =
      data.kind === 'obecny' && data.vztahIri
        ? `relationship:${data.vztahIri}`
        : `edge:${source}->${target}:${data.kind}`;
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
      pushEdge(getConceptIri(trida) ?? '', superIri, { kind: 'hierarchie' });
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

  return { nodes, edges, removedOverlays: [] };
};

const edgeKindFromDto = (
  edgeKind?: (typeof DiagramEdgeDataEdgeKind)[keyof typeof DiagramEdgeDataEdgeKind],
): RelationshipKind => {
  switch (edgeKind) {
    case DiagramEdgeDataEdgeKind.SUBCLASS_OF:
      return 'hierarchie';
    case DiagramEdgeDataEdgeKind.EXACT_MATCH:
      return 'ekvivalence';
    default:
      return 'obecny';
  }
};

const conceptIri = (nodeId: string): string =>
  nodeId.startsWith('iri:') ? nodeId.slice('iri:'.length) : nodeId;

const edgeKindToDto = (
  kind?: RelationshipKind,
): (typeof DiagramEdgeDataEdgeKind)[keyof typeof DiagramEdgeDataEdgeKind] => {
  switch (kind) {
    case 'hierarchie':
      return DiagramEdgeDataEdgeKind.SUBCLASS_OF;
    case 'ekvivalence':
      return DiagramEdgeDataEdgeKind.EXACT_MATCH;
    default:
      return DiagramEdgeDataEdgeKind.VZTAH;
  }
};

const diagramEdgeId = (
  kind: (typeof DiagramEdgeDataEdgeKind)[keyof typeof DiagramEdgeDataEdgeKind],
  source: string,
  target: string,
): string => {
  if (kind === DiagramEdgeDataEdgeKind.VZTAH) return conceptIri(source);
  return ['edge', kind, conceptIri(source), conceptIri(target)].join('|');
};

export const buildDiagramLayoutDto = (
  nodes: ConceptFlowNode[],
  edges: ConceptFlowEdge[],
  version: number,
  removedOverlays: DiagramLayoutOverlay[] = [],
): DiagramLayoutDto => {
  const persistedIdByNodeId = new Map(
    nodes.flatMap((node) => {
      const conceptId = getConceptId(node.data.concept);
      return [
        [node.id, conceptId],
        [node.id.replace(/^iri:/, ''), conceptId],
      ] as const;
    }),
  );

  const layoutEdges = edges.flatMap((edge) => {
    const source = persistedIdByNodeId.get(edge.source.replace('iri:', ''));
    const target = persistedIdByNodeId.get(edge.target.replace('iri:', ''));
    if (!source || !target) return [];

    const kind = edgeKindToDto(edge.data?.kind);
    const sourceNode = nodes.find((node) => node.id === edge.source);
    const targetNode = nodes.find((node) => node.id === edge.target);
    const exactMatchNeedsSwap =
      kind === DiagramEdgeDataEdgeKind.EXACT_MATCH &&
      sourceNode?.data.readOnly === true &&
      targetNode?.data.readOnly !== true;
    const relationshipNeedsSwap =
      kind === DiagramEdgeDataEdgeKind.VZTAH &&
      sourceNode?.data.readOnly === true &&
      targetNode?.data.readOnly !== true;
    const persistedSource =
      exactMatchNeedsSwap || relationshipNeedsSwap ? target : source;
    const persistedTarget =
      exactMatchNeedsSwap || relationshipNeedsSwap ? source : target;
    const persistedEdgeIri =
      kind === DiagramEdgeDataEdgeKind.VZTAH
        ? edge.data?.vztahIri
        : persistedSource;
    if (!persistedEdgeIri) return [];
    const id = diagramEdgeId(kind, persistedEdgeIri, persistedTarget);

    return [
      {
        id,
        source: persistedSource,
        target: persistedTarget,
        segments: edge.data?.bends ?? [],
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
      visibleProperties: node.data.vlastnosti.map(getConceptId),
    })),
    edges: layoutEdges,
    overlays: removedOverlays,
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

  const withDiagramState = (
    concept: Concept,
    iri: string | undefined,
    stale: boolean | undefined,
  ): Concept => {
    const fallbackLabel = getLabelFromConceptIri(iri);
    if (!stale && concept.název?.cs) return concept;

    return {
      ...concept,
      stale,
      název:
        concept.název?.cs || !fallbackLabel
          ? concept.název
          : { ...concept.název, cs: fallbackLabel },
    };
  };

  const nodes: ConceptFlowNode[] = (diagram.nodes ?? []).flatMap(
    (savedNode) => {
      if (!savedNode.id || !savedNode.position) return [];

      const nodeId = savedNode.id.replace(/^iri:/, '');
      const savedConceptIri = savedNode.data?.iri ?? nodeId;
      const resolvedConcept =
        conceptsById.get(nodeId) ??
        conceptsById.get(savedConceptIri) ??
        (savedNode.data?.slug
          ? conceptsById.get(savedNode.data.slug)
          : undefined) ??
        ({
          iri: savedConceptIri,
          slug: savedNode.data?.slug,
          název: savedNode.data?.label,
          metadata: {
            iri: savedConceptIri,
            slug: savedNode.data?.slug,
            label: savedNode.data?.label?.cs,
            conceptType: savedNode.data?.conceptType ?? 'TRIDA',
          },
        } as Concept);
      const concept = withDiagramState(
        resolvedConcept,
        savedConceptIri,
        savedNode.data?.stale,
      );
      if (getConceptKind(concept) !== 'trida') return [];

      const savedProperties = savedNode.data?.properties;
      const vlastnosti = savedProperties
        ? savedProperties.flatMap((savedProperty) => {
            const propertyIri = savedProperty.iri;
            const propertyId = propertyIri ?? savedProperty.slug;
            if (!propertyId || assignedProperties.has(propertyId)) return [];

            const resolvedProperty =
              (propertyIri ? conceptsById.get(propertyIri) : undefined) ??
              (savedProperty.slug
                ? conceptsById.get(savedProperty.slug)
                : undefined) ??
              ({
                iri: propertyIri,
                slug: savedProperty.slug,
                název: savedProperty.label,
                metadata: {
                  iri: propertyIri,
                  slug: savedProperty.slug,
                  label: savedProperty.label?.cs,
                  conceptType: 'VLASTNOST',
                },
              } as Concept);
            const property = withDiagramState(
              resolvedProperty,
              propertyIri,
              savedProperty.stale,
            );

            assignedProperties.add(getConceptId(property));
            return [property];
          })
        : concepts.filter(
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
          id: nodeId,
          type: 'concept' as const,
          position: savedNode.position,
          parentId: savedNode.parentId,
          data: {
            concept,
            vlastnosti,
            readOnly: savedNode.data?.readOnly,
          },
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
      const { id, source, target } = savedEdge;
      if (!id || !source || !target) return [];

      const kind = edgeKindFromDto(savedEdge.data?.edgeKind);
      const savedSourceId = source.replace(/^iri:/, '');
      const savedTargetId = target.replace(/^iri:/, '');

      const sourceId = savedSourceId;
      const targetId = savedTargetId;
      const sourceNode = nodeById.get(sourceId);
      const targetNode = nodeById.get(targetId);
      if (!sourceNode || !targetNode) return [];

      const relationship =
        kind === 'obecny'
          ? ((savedEdge.data?.iri
              ? conceptsById.get(savedEdge.data.iri)
              : undefined) ??
            relationshipConcepts.find(
              (concept) =>
                getDefinicniObor(concept) ===
                  getConceptIri(sourceNode.data.concept) &&
                getOborHodnot(concept) ===
                  getConceptIri(targetNode.data.concept),
            ))
          : undefined;
      const relationshipIri =
        kind === 'obecny'
          ? (savedEdge.data?.iri ??
            (relationship ? getConceptIri(relationship) : undefined))
          : undefined;
      const relationshipLabel =
        kind === 'obecny'
          ? (savedEdge.data?.label?.cs ??
            relationship?.název?.cs ??
            getLabelFromConceptIri(relationshipIri))
          : undefined;

      return [
        {
          id,
          source: sourceId,
          target: targetId,
          data: {
            kind,
            label: relationshipLabel,
            vztahIri: relationshipIri,
            stale: savedEdge.data?.stale,
            bends: savedEdge.segments?.length
              ? savedEdge.segments.flatMap((segment) =>
                  segment.x === undefined || segment.y === undefined
                    ? []
                    : [{ x: segment.x, y: segment.y }],
                )
              : undefined,
          },
        },
      ];
    },
  );
  return { nodes, edges, removedOverlays: [] };
};

const getRemovedEdgeOverlay = (
  edge: ConceptFlowEdge,
  nodes: ConceptFlowNode[],
): DiagramLayoutOverlay | undefined => {
  if (edge.data?.kind === 'obecny') {
    return edge.data.vztahIri ? { conceptIri: edge.data.vztahIri } : undefined;
  }

  const affectedNodeId = edge.source;
  const affectedNode = nodes.find((node) => node.id === affectedNodeId);
  const conceptIri = affectedNode && getConceptIri(affectedNode.data.concept);

  return conceptIri
    ? edge.data?.kind === 'hierarchie'
      ? { conceptIri, broaderConcept: [] }
      : { conceptIri }
    : undefined;
};

/**
 * Whether the relationship already asserts this domain/range pair. Such an overlay would stage a
 * write identical to what RDF holds, surfacing as a pending edit that changes nothing.
 */
const assertsRelationship = (
  vztah: Concept | undefined,
  domain: string,
  range: string,
): boolean =>
  !!vztah &&
  getDefinicniObor(vztah) === domain &&
  getOborHodnot(vztah) === range;

const getEdgeOverlay = (
  edge: ConceptFlowEdge,
  nodes: ConceptFlowNode[],
  vztah?: Concept,
): DiagramLayoutOverlay | undefined => {
  const sourceNode = nodes.find((node) => node.id === edge.source);
  const targetNode = nodes.find((node) => node.id === edge.target);
  const sourceIri = sourceNode && getConceptIri(sourceNode.data.concept);
  const targetIri = targetNode && getConceptIri(targetNode.data.concept);
  if (!sourceIri || !targetIri) return undefined;

  switch (edge.data?.kind) {
    case 'hierarchie':
      return { conceptIri: sourceIri, broaderConcept: [targetIri] };
    case 'ekvivalence':
      return sourceNode.data.readOnly && !targetNode.data.readOnly
        ? { conceptIri: targetIri, exactMatch: [sourceIri] }
        : { conceptIri: sourceIri, exactMatch: [targetIri] };
    case 'obecny': {
      if (!edge.data.vztahIri) return undefined;
      const swap = sourceNode.data.readOnly && !targetNode.data.readOnly;
      const domain = swap ? targetIri : sourceIri;
      const range = swap ? sourceIri : targetIri;
      // A foreign range is never auto-drawn, so redrawing it by hand is the common way an
      // already-asserted relationship reaches this branch.
      if (assertsRelationship(vztah, domain, range)) return undefined;
      return { conceptIri: edge.data.vztahIri, domain, range };
    }
    default:
      return undefined;
  }
};

const addRemovedOverlays = (
  current: DiagramLayoutOverlay[],
  additions: Array<DiagramLayoutOverlay | undefined>,
) => {
  const overlays = new Map(
    current.map((overlay) => [overlay.conceptIri, overlay]),
  );

  for (const addition of additions) {
    if (!addition) continue;
    const existing = overlays.get(addition.conceptIri);
    const clearsOverlay = Object.keys(addition).length === 1;

    overlays.set(
      addition.conceptIri,
      !existing || clearsOverlay
        ? addition
        : {
            ...existing,
            ...addition,
            broaderConcept:
              addition.broaderConcept !== undefined
                ? addition.broaderConcept.length === 0
                  ? []
                  : Array.from(
                      new Set([
                        ...(existing.broaderConcept ?? []),
                        ...addition.broaderConcept,
                      ]),
                    )
                : existing.broaderConcept,
            exactMatch: addition.exactMatch
              ? Array.from(
                  new Set([
                    ...(existing.exactMatch ?? []),
                    ...addition.exactMatch,
                  ]),
                )
              : existing.exactMatch,
          },
    );
  }

  return Array.from(overlays.values());
};

export const diagramReducer = (
  state: DiagramState,
  action: DiagramAction,
): DiagramState => {
  switch (action.type) {
    case 'nodesChange':
      return { ...state, nodes: applyNodeChanges(action.changes, state.nodes) };

    case 'removeNode': {
      if (!state.nodes.some((node) => node.id === action.nodeId)) return state;

      return {
        ...state,
        nodes: state.nodes.filter((node) => node.id !== action.nodeId),
        edges: state.edges.filter(
          (edge) =>
            edge.source !== action.nodeId && edge.target !== action.nodeId,
        ),
      };
    }

    case 'edgesChange':
      return {
        ...state,
        edges: applyEdgeChanges(action.changes, state.edges),
        removedOverlays: addRemovedOverlays(
          state.removedOverlays,
          action.changes.flatMap((change) => {
            if (change.type !== 'remove') return [];
            const edge = state.edges.find((item) => item.id === change.id);
            return edge ? [getRemovedEdgeOverlay(edge, state.nodes)] : [];
          }),
        ),
      };

    case 'connect': {
      const c = action.connection;
      const conn: Connection = action.swap
        ? {
            ...c,
            source: c.target,
            target: c.source,
          }
        : c;
      const edge: ConceptFlowEdge = {
        ...conn,
        id: crypto.randomUUID(),
        ...(action.kind ? { data: { kind: action.kind } } : {}),
      };
      return {
        ...state,
        edges: addEdge(edge, state.edges),
        removedOverlays: addRemovedOverlays(state.removedOverlays, [
          getEdgeOverlay(edge, state.nodes),
        ]),
      };
    }

    case 'reconnect': {
      const previousEdge = state.edges.find(
        (edge) => edge.id === action.edgeId,
      );
      if (
        !previousEdge ||
        (previousEdge.source === action.connection.source &&
          previousEdge.target === action.connection.target) ||
        state.edges.some(
          (edge) =>
            edge.id !== action.edgeId &&
            edge.source === action.connection.source &&
            edge.target === action.connection.target &&
            (edge.sourceHandle ?? null) === action.connection.sourceHandle &&
            (edge.targetHandle ?? null) === action.connection.targetHandle,
        )
      ) {
        return state;
      }

      const updatedEdge: ConceptFlowEdge = {
        ...previousEdge,
        ...action.connection,
        data: {
          ...previousEdge.data,
          bends: undefined,
        },
      };

      return {
        ...state,
        edges: state.edges.map((edge) =>
          edge.id === action.edgeId ? updatedEdge : edge,
        ),
        removedOverlays: addRemovedOverlays(state.removedOverlays, [
          getRemovedEdgeOverlay(previousEdge, state.nodes),
          getEdgeOverlay(updatedEdge, state.nodes),
        ]),
      };
    }

    case 'setEdgeKind': {
      const previousEdge = state.edges.find(
        (edge) => edge.id === action.edgeId,
      );
      if (!previousEdge) return state;
      const base = action.swap
        ? {
            ...previousEdge,
            source: previousEdge.target,
            target: previousEdge.source,
          }
        : previousEdge;
      const clearsRelationship = action.kind !== 'obecny';
      if (
        base.source === previousEdge.source &&
        base.target === previousEdge.target &&
        previousEdge.data?.kind === action.kind &&
        (!clearsRelationship ||
          (!previousEdge.data.label && !previousEdge.data.vztahIri))
      ) {
        return state;
      }
      const updatedEdge: ConceptFlowEdge = {
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
      return {
        ...state,
        edges: state.edges.map((edge) =>
          edge.id === action.edgeId ? updatedEdge : edge,
        ),
        removedOverlays: addRemovedOverlays(state.removedOverlays, [
          getRemovedEdgeOverlay(previousEdge, state.nodes),
          getEdgeOverlay(updatedEdge, state.nodes),
        ]),
      };
    }

    case 'setEdgeVztah': {
      const edge = state.edges.find((item) => item.id === action.edgeId);
      if (!edge || edge.data?.kind !== 'obecny') return state;
      const label = action.vztah.název?.cs;
      const vztahIri = getConceptIri(action.vztah);
      if (edge.data.label === label && edge.data.vztahIri === vztahIri) {
        return state;
      }
      const updatedEdge: ConceptFlowEdge = {
        ...edge,
        data: {
          ...edge.data,
          label,
          vztahIri,
        },
      };
      const overlay = getEdgeOverlay(updatedEdge, state.nodes, action.vztah);
      // The guard found the relationship already asserted, so anything staged for it earlier in
      // this session is a no-op too; a bare entry discards the row rather than leaving it staged.
      const additions =
        !overlay && vztahIri ? [{ conceptIri: vztahIri }] : [overlay];
      return {
        ...state,
        edges: state.edges.map((item) =>
          item.id === action.edgeId ? updatedEdge : item,
        ),
        removedOverlays: addRemovedOverlays(state.removedOverlays, additions),
      };
    }

    case 'setEdgeBends': {
      const edge = state.edges.find((item) => item.id === action.edgeId);
      const bends = action.bends?.length ? action.bends : undefined;
      if (
        !edge ||
        edge.data?.bends === bends ||
        (!edge.data?.bends && !bends)
      ) {
        return state;
      }
      return {
        ...state,
        edges: state.edges.map((e) =>
          e.id === action.edgeId
            ? {
                ...e,
                data: {
                  ...e.data,
                  bends,
                },
              }
            : e,
        ),
      };
    }

    case 'clearDiagram':
      return state.nodes.length === 0 && state.edges.length === 0
        ? state
        : { ...state, nodes: [], edges: [] };

    case 'layoutSaved':
      if (
        state.nodes !== action.expected.nodes ||
        state.edges !== action.expected.edges
      ) {
        return state;
      }
      return {
        ...state,
        ...action.saved,
        removedOverlays: [],
      };

    case 'init':
      return action.diagram
        ? buildPersistedDiagram(action.concepts, action.diagram)
        : buildDefaultDiagram(action.concepts);

    case 'applyLayout':
      return {
        ...state,
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

      const readOnly = !action.allConcepts.some(
        (concept) => getConceptId(concept) === tridaId,
      );

      const assigned = new Set(
        state.nodes.flatMap((n) => n.data.vlastnosti.map(getConceptId)),
      );

      const vlastnosti = readOnly
        ? []
        : action.allConcepts.filter(
            (c) =>
              getConceptKind(c) === 'vlastnost' &&
              getDefinicniObor(c) === getConceptIri(action.concept) &&
              !assigned.has(getConceptId(c)),
          );

      const node: ConceptFlowNode = {
        id: crypto.randomUUID(),
        type: 'concept',
        position: action.position,
        data: {
          concept: action.concept,
          vlastnosti,
          readOnly,
        },
      };

      return { ...state, nodes: [...state.nodes, node] };
    }

    case 'assignVlastnost': {
      const vlId = getConceptId(action.vlastnost);
      const targetNode = state.nodes.find(
        (node) => node.id === action.targetNodeId,
      );
      if (
        !targetNode ||
        targetNode.data.readOnly ||
        targetNode.data.vlastnosti.some(
          (vlastnost) => getConceptId(vlastnost) === vlId,
        )
      ) {
        return state;
      }

      const nodes = state.nodes.map((node) => {
        if (node.id === action.targetNodeId) {
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

      const propertyIri = getConceptIri(action.vlastnost);
      const domain = getConceptIri(targetNode.data.concept);
      return {
        ...state,
        nodes,
        removedOverlays: addRemovedOverlays(state.removedOverlays, [
          propertyIri && domain
            ? { conceptIri: propertyIri, domain }
            : undefined,
        ]),
      };
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

      const removedProperty = targetNode.data.vlastnosti.find(
        (vlastnost) => getConceptId(vlastnost) === action.vlastnostId,
      );
      const removedPropertyIri =
        removedProperty && getConceptIri(removedProperty);

      return {
        ...state,
        nodes,
        removedOverlays: addRemovedOverlays(state.removedOverlays, [
          removedPropertyIri ? { conceptIri: removedPropertyIri } : undefined,
        ]),
      };
    }

    default:
      return state;
  }
};
