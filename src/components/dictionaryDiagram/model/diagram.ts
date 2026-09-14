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

/**
 * The edge ids that were sent but are missing from the saved diagram, for a post-save sanity check.
 *
 * Membership decides which edges render, so the server echoes back every edge row it kept: sent and
 * returned should agree exactly. A discrepancy means a row was rejected or dropped, and the canvas is
 * now showing something the server does not have — a divergence that otherwise stays invisible until
 * the next reload, because the canvas keeps its own state after a save.
 *
 * Read-only: it reports, and never reconciles the canvas against the response. Applying the server's
 * edges here would fight edits the user has made since the request went out.
 */
export const droppedEdgeIds = (
  sent: DiagramLayoutDto,
  saved: DiagramDto | undefined,
): string[] => {
  if (!saved?.edges) return [];
  const returned = new Set(saved.edges.map((edge) => edge.id));
  return (sent.edges ?? [])
    .map((edge) => edge.id)
    .filter((id): id is string => !!id && !returned.has(id));
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
          synthesized: true,
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
        (savedEdge.data?.iri
          ? conceptsById.get(savedEdge.data.iri)
          : undefined) ??
        relationshipConcepts.find(
          (concept) =>
            getDefinicniObor(concept) ===
              getConceptIri(sourceNode.data.concept) &&
            getOborHodnot(concept) === getConceptIri(targetNode.data.concept),
        );
      const relationshipIri =
        savedEdge.data?.iri ??
        (relationship ? getConceptIri(relationship) : undefined);
      const relationshipLabel =
        savedEdge.data?.label?.cs ??
        relationship?.název?.cs ??
        getLabelFromConceptIri(relationshipIri);

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

/**
 * The parent set a `broaderConcept` overlay must start from: this session's staged edit if the concept
 * already has one, otherwise what RDF asserts.
 *
 * `broaderConcept` is a FULL REPLACE of the concept's superclasses, so every overlay must carry the
 * complete set — including parents that are not on this canvas. Building one from the edges alone
 * silently drops those, and sending a bare `[]` clears the predicate outright.
 *
 * Preferring the staged edit is what makes several edits to one concept accumulate. Seeding from RDF
 * every time would make each edit forget the last: add a parent, add a second, and the second overlay
 * would carry RDF's parents plus its own, dropping the first.
 *
 * Returns `undefined`, never `[]`, when there is no staged edit and the node carries only a synthesized
 * concept — the stub `buildPersistedDiagram` builds for a saved node no ontology concept matched. Its
 * structural fields are absent because nothing was read, not because the concept has none, so seeding
 * `[]` from it would stage a clear. Callers must skip the overlay instead: membership still takes the
 * edge off the canvas, which is the part the user asked for, and the RDF is left alone.
 *
 * A real concept with no parents omits `nadřazená-třída` too (the API serializes non-null only), which
 * is why the stub is flagged explicitly rather than detected by the missing key — that test cannot tell
 * the two apart, and reading it as "synthesized" would break the ordinary first-parent case.
 */
const getParentSeed = (
  node: ConceptFlowNode | undefined,
  conceptIri: string,
  staged: DiagramLayoutOverlay[],
): string[] | undefined => {
  const stagedParents = staged.find(
    (overlay) => overlay.conceptIri === conceptIri,
  )?.broaderConcept;
  if (stagedParents) return stagedParents;
  if (!node || node.data.concept.synthesized) return undefined;
  return getNadrazenaTrida(node.data.concept);
};

const getRemovedEdgeOverlay = (
  edge: ConceptFlowEdge,
  nodes: ConceptFlowNode[],
  staged: DiagramLayoutOverlay[],
): DiagramLayoutOverlay | undefined => {
  if (edge.data?.kind === 'obecny') {
    return edge.data.vztahIri ? { conceptIri: edge.data.vztahIri } : undefined;
  }

  const affectedNodeId = edge.source;
  const affectedNode = nodes.find((node) => node.id === affectedNodeId);
  const conceptIri = affectedNode && getConceptIri(affectedNode.data.concept);
  if (!conceptIri) return undefined;

  if (edge.data?.kind !== 'hierarchie') return { conceptIri };

  // Drop only the parent this edge draws. Sending `[]` would clear the predicate, deleting every
  // other superclass the user never touched.
  const targetNode = nodes.find((node) => node.id === edge.target);
  const targetIri = targetNode && getConceptIri(targetNode.data.concept);
  const parents = getParentSeed(affectedNode, conceptIri, staged);
  if (!parents || !targetIri) return undefined;

  return { conceptIri, broaderConcept: parents.filter((p) => p !== targetIri) };
};

const getEdgeOverlay = (
  edge: ConceptFlowEdge,
  nodes: ConceptFlowNode[],
  staged: DiagramLayoutOverlay[],
): DiagramLayoutOverlay | undefined => {
  const sourceNode = nodes.find((node) => node.id === edge.source);
  const targetNode = nodes.find((node) => node.id === edge.target);
  const sourceIri = sourceNode && getConceptIri(sourceNode.data.concept);
  const targetIri = targetNode && getConceptIri(targetNode.data.concept);
  if (!sourceIri || !targetIri) return undefined;

  switch (edge.data?.kind) {
    case 'hierarchie': {
      // Add to the concept's existing parents rather than replacing them: `broaderConcept` is a full
      // replace, so a one-element list deletes every other superclass at Převzít.
      const parents = getParentSeed(sourceNode, sourceIri, staged);
      if (!parents) return undefined;
      return {
        conceptIri: sourceIri,
        broaderConcept: Array.from(new Set([...parents, targetIri])),
      };
    }
    case 'ekvivalence':
      return sourceNode.data.readOnly && !targetNode.data.readOnly
        ? { conceptIri: targetIri, exactMatch: [sourceIri] }
        : { conceptIri: sourceIri, exactMatch: [targetIri] };
    case 'obecny':
      return edge.data.vztahIri
        ? sourceNode.data.readOnly && !targetNode.data.readOnly
          ? {
              conceptIri: edge.data.vztahIri,
              domain: targetIri,
              range: sourceIri,
            }
          : {
              conceptIri: edge.data.vztahIri,
              domain: sourceIri,
              range: targetIri,
            }
        : undefined;
    default:
      return undefined;
  }
};

/**
 * Folds staged overlays together, one entry per concept — the shape the API expects, where each entry
 * fully replaces that concept's staged edit.
 *
 * Each addition already carries the concept's COMPLETE intended `broaderConcept`, seeded from RDF by
 * `getAssertedParents`. So a later addition replaces an earlier one field by field; it must not be
 * unioned with it. Unioning was correct only while additions were one-element deltas, and it now has an
 * active failure: add a parent then remove another, and the union would resurrect the removed one,
 * because the removal's list is a subset of the addition's.
 *
 * Fields the addition does not mention are inherited, so a hierarchy edit and an `exactMatch` edit on
 * the same concept still accumulate.
 */
const addRemovedOverlays = (
  current: DiagramLayoutOverlay[],
  additions: Array<
    | DiagramLayoutOverlay
    | undefined
    // Built lazily, against the overlays folded so far, so several edits in one batch see each other:
    // a removal following an addition on the same concept must seed from that addition, not from RDF.
    | ((_staged: DiagramLayoutOverlay[]) => DiagramLayoutOverlay | undefined)
  >,
) => {
  const overlays = new Map(
    current.map((overlay) => [overlay.conceptIri, overlay]),
  );

  for (const entry of additions) {
    const addition =
      typeof entry === 'function'
        ? entry(Array.from(overlays.values()))
        : entry;
    if (!addition) continue;
    const existing = overlays.get(addition.conceptIri);
    // `{ conceptIri }` alone is a discard: it reverts the concept to live content, so it replaces
    // rather than merges.
    const clearsOverlay = Object.keys(addition).length === 1;

    overlays.set(
      addition.conceptIri,
      !existing || clearsOverlay ? addition : { ...existing, ...addition },
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
            return edge
              ? [
                  (staged: DiagramLayoutOverlay[]) =>
                    getRemovedEdgeOverlay(edge, state.nodes, staged),
                ]
              : [];
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
          (staged) => getEdgeOverlay(edge, state.nodes, staged),
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
          (staged) => getRemovedEdgeOverlay(previousEdge, state.nodes, staged),
          (staged) => getEdgeOverlay(updatedEdge, state.nodes, staged),
        ]),
      };
    }

    case 'setEdgeVztah': {
      const edge = state.edges.find((item) => item.id === action.edgeId);
      if (!edge || edge.data?.kind !== 'obecny') return state;
      const updatedEdge: ConceptFlowEdge = {
        ...edge,
        data: {
          ...edge.data,
          label: action.vztah.název?.cs,
          vztahIri: getConceptIri(action.vztah),
        },
      };
      return {
        ...state,
        edges: state.edges.map((item) =>
          item.id === action.edgeId ? updatedEdge : item,
        ),
        removedOverlays: addRemovedOverlays(state.removedOverlays, [
          (staged) => getEdgeOverlay(updatedEdge, state.nodes, staged),
        ]),
      };
    }

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
        data: {
          concept: action.concept,
          vlastnosti,
          readOnly: !action.allConcepts.some(
            (concept) => getConceptId(concept) === tridaId,
          ),
        },
      };

      return { ...state, nodes: [...state.nodes, node] };
    }

    case 'assignVlastnost': {
      const vlId = getConceptId(action.vlastnost);
      const targetNode = state.nodes.find(
        (node) => node.id === action.targetNodeId,
      );
      if (!targetNode) return state;

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
