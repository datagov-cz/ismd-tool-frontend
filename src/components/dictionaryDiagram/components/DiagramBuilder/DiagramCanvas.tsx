import '@xyflow/react/dist/style.css';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  type EdgeChange,
  MiniMap,
  type NodeChange,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';

import { AddNewConceptDialog } from '@/components/dictionaryDiagram/components/AddNewConceptDialog';
import { ConceptNode } from '@/components/dictionaryDiagram/components/ConceptNode';
import { DiagramDispatchContext } from '@/components/dictionaryDiagram/components/diagramDispatchContext';
import { LabelDisplayContext } from '@/components/dictionaryDiagram/components/labelDisplayContext';
import { LabeledEdge } from '@/components/dictionaryDiagram/components/LabeledEdge';
import { useConceptDrop } from '@/components/dictionaryDiagram/hooks/useConceptDrop';
import { getConceptId } from '@/components/dictionaryDiagram/model/concept';
import {
  type ConceptFlowEdge,
  type ConceptFlowNode,
} from '@/components/dictionaryDiagram/model/diagram';

import { DiagramToolbar } from './components/DiagramToolbar';
import { DiagramTopBar } from './components/DiagramTopBar';
import {
  type HighlightedRelation,
  HighlightedRelationsPanel,
} from './components/HighlightedRelationsPanel';
import { RelationshipChooserOverlay } from './components/RelationshipChooserOverlay';
import type { DiagramBuilderProps } from './DiagramBuilder';
import { useConnectionWorkflow } from './hooks/useConnectionWorkflow';
import { useDiagramLayout } from './hooks/useDiagramLayout';
import { useDisplayEdges } from './hooks/useDisplayEdges';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const nodeTypes = { concept: ConceptNode };
const edgeTypes = { default: LabeledEdge };

const getNodeLabel = (node?: ConceptFlowNode) => {
  const concept = node?.data.concept;
  if (!concept) return 'Neznámý pojem';
  const metadata = concept.metadata;
  return (
    concept.název?.cs ??
    (metadata && 'label' in metadata ? metadata.label : undefined) ??
    concept.iri ??
    'Neznámý pojem'
  );
};

const getRelationLabel = (edge: ConceptFlowEdge) => {
  if (edge.data?.label) return edge.data.label;
  if (edge.data?.kind === 'hierarchie') return 'je nadřazený pojem';
  if (edge.data?.kind === 'ekvivalence') return 'je ekvivalentní';
  return 'má vztah';
};

export const DiagramCanvas = ({
  concepts,
  nodes,
  edges,
  autoLayout,
  dispatch,
  ontology,
  canRedo,
  canUndo,
  focusRequest,
  onFocusRequestHandled,
  onSelectedConceptIdsChange,
}: DiagramBuilderProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { getNode, getZoom, setCenter } = useReactFlow<
    ConceptFlowNode,
    ConceptFlowEdge
  >();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [showFullLabels, setShowFullLabels] = useState(false);
  const [focusedNodeIds, setFocusedNodeIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    onSelectedConceptIdsChange(
      new Set(
        nodes
          .filter((node) => focusedNodeIds.has(node.id))
          .map((node) => getConceptId(node.data.concept)),
      ),
    );
  }, [focusedNodeIds, nodes, onSelectedConceptIdsChange]);

  const toggleFocusedNode = useCallback((nodeId: string) => {
    setFocusedNodeIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const { onDrop, onDragOver } = useConceptDrop(dispatch, concepts);

  const {
    chooser,
    pending,
    onEdgeClick,
    onConnect,
    closeChooser,
    selectRelationship,
    removeEdge,
  } = useConnectionWorkflow({ nodes, edges, dispatch, wrapperRef });

  const { displayEdges } = useDisplayEdges({
    edges,
    dispatch,
    pending,
    focusedNodeIds,
  });

  const visibleNodeIds = useMemo(() => {
    if (focusedNodeIds.size === 0) return null;
    const ids = new Set(focusedNodeIds);
    for (const edge of edges) {
      if (focusedNodeIds.has(edge.source)) ids.add(edge.target);
      if (focusedNodeIds.has(edge.target)) ids.add(edge.source);
    }
    return ids;
  }, [edges, focusedNodeIds]);

  const highlightedRelations = useMemo<HighlightedRelation[]>(() => {
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    return edges
      .filter(
        (edge) =>
          focusedNodeIds.has(edge.source) || focusedNodeIds.has(edge.target),
      )
      .map((edge) => ({
        id: edge.id,
        sourceId: edge.source,
        source: getNodeLabel(nodeById.get(edge.source)),
        relation: getRelationLabel(edge),
        targetId: edge.target,
        target: getNodeLabel(nodeById.get(edge.target)),
      }));
  }, [nodes, edges, focusedNodeIds]);

  const highlightedRelationsTitle =
    focusedNodeIds.size === 1
      ? getNodeLabel(nodes.find((node) => focusedNodeIds.has(node.id)))
      : `${focusedNodeIds.size} zvýrazněné pojmy`;

  const centerOnNode = useCallback(
    (nodeId: string) => {
      const node = getNode(nodeId);
      if (!node) return;

      const width = node.measured?.width ?? node.width ?? 0;
      const height = node.measured?.height ?? node.height ?? 0;
      void setCenter(
        node.position.x + width / 2,
        node.position.y + height / 2,
        {
          zoom: Math.min(getZoom() + 0.25, 1.5),
          duration: 500,
        },
      );
    },
    [getNode, getZoom, setCenter],
  );

  useEffect(() => {
    if (!focusRequest) return;
    const node = nodes.find(
      (candidate) =>
        getConceptId(candidate.data.concept) === focusRequest.conceptId ||
        candidate.data.vlastnosti.some(
          (property) => getConceptId(property) === focusRequest.conceptId,
        ),
    );
    const relationEdge = edges.find(
      (edge) => edge.data?.vztahIri === focusRequest.conceptId,
    );
    if (!node && !relationEdge) return;

    const frame = requestAnimationFrame(() => {
      if (node) {
        const alreadyFocused = focusedNodeIds.has(node.id);
        setFocusedNodeIds((current) => {
          const next = new Set(current);
          if (alreadyFocused) next.delete(node.id);
          else next.add(node.id);
          return next;
        });
        if (!alreadyFocused) centerOnNode(node.id);
        onFocusRequestHandled();
        return;
      }

      if (!relationEdge) return;
      const alreadyFocused =
        focusedNodeIds.has(relationEdge.source) &&
        focusedNodeIds.has(relationEdge.target);
      setFocusedNodeIds((current) => {
        const next = new Set(current);
        if (alreadyFocused) {
          next.delete(relationEdge.source);
          next.delete(relationEdge.target);
        } else {
          next.add(relationEdge.source);
          next.add(relationEdge.target);
        }
        return next;
      });
      if (alreadyFocused) {
        onFocusRequestHandled();
        return;
      }
      const source = getNode(relationEdge.source);
      const target = getNode(relationEdge.target);
      if (!source || !target) return;
      void setCenter(
        (source.position.x + target.position.x) / 2,
        (source.position.y + target.position.y) / 2,
        { zoom: Math.min(getZoom() + 0.25, 1.5), duration: 500 },
      );
      onFocusRequestHandled();
    });

    return () => cancelAnimationFrame(frame);
  }, [
    centerOnNode,
    edges,
    focusRequest,
    focusedNodeIds,
    getNode,
    getZoom,
    nodes,
    onFocusRequestHandled,
    setCenter,
  ]);

  const centerOnUnfocusedRelationNode = useCallback(
    (relation: HighlightedRelation) => {
      const sourceFocused = focusedNodeIds.has(relation.sourceId);
      const targetFocused = focusedNodeIds.has(relation.targetId);
      const nodeId =
        sourceFocused && !targetFocused
          ? relation.targetId
          : targetFocused && !sourceFocused
            ? relation.sourceId
            : null;

      if (!nodeId) return;
      centerOnNode(nodeId);
    },
    [centerOnNode, focusedNodeIds],
  );

  const displayNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        selected: focusedNodeIds.has(node.id),
        data: {
          ...node.data,
          onFocus: () =>
            setFocusedNodeIds((current) => new Set(current).add(node.id)),
        },
        style: {
          ...node.style,
          opacity: visibleNodeIds && !visibleNodeIds.has(node.id) ? 0.14 : 1,
          transition: 'opacity 160ms ease',
        },
      })),
    [nodes, visibleNodeIds, focusedNodeIds],
  );

  const { runLayout } = useDiagramLayout({
    nodes,
    edges,
    dispatch,
    autoLayout,
  });

  useKeyboardShortcuts(dispatch);

  const onNodesChange = useCallback(
    (changes: NodeChange<ConceptFlowNode>[]) =>
      dispatch({ type: 'nodesChange', changes }),
    [dispatch],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<ConceptFlowEdge>[]) =>
      dispatch({ type: 'edgesChange', changes }),
    [dispatch],
  );

  return (
    <div
      className="flex-1084 bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] rounded-md relative"
      ref={wrapperRef}
    >
      <DiagramDispatchContext.Provider value={dispatch}>
        <LabelDisplayContext.Provider value={showFullLabels}>
          <ReactFlow<ConceptFlowNode, ConceptFlowEdge>
            nodes={displayNodes}
            edges={displayEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeClick={onEdgeClick}
            onNodeClick={(_, node) => toggleFocusedNode(node.id)}
            onPaneClick={() => setFocusedNodeIds(new Set())}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            colorMode="system"
          >
            <DiagramToolbar
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={() => dispatch({ type: 'undo' })}
              onRedo={() => dispatch({ type: 'redo' })}
              onLayout={runLayout}
              onAddConcept={() => setOpenAddDialog(true)}
            />

            <HighlightedRelationsPanel
              title={highlightedRelationsTitle}
              relations={highlightedRelations}
              onRelationClick={centerOnUnfocusedRelationNode}
            />

            <DiagramTopBar onExport={() => {}} onRename={() => {}} />

            <Controls className="text-blue-hover" showInteractive={true}>
              <ControlButton
                onClick={() => setShowFullLabels((v) => !v)}
                title={
                  showFullLabels
                    ? 'Zkrátit popisky vztahů'
                    : 'Zobrazit celé popisky vztahů'
                }
                aria-pressed={showFullLabels}
              >
                <GovIcon
                  type="components"
                  name={
                    showFullLabels
                      ? 'arrows-collapse-vertical'
                      : 'arrows-expand-vertical'
                  }
                  color="primary"
                  size="xs"
                />
              </ControlButton>
            </Controls>
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </LabelDisplayContext.Provider>
      </DiagramDispatchContext.Provider>

      <RelationshipChooserOverlay
        chooser={chooser}
        onSelect={selectRelationship}
        onClose={closeChooser}
        onRemove={removeEdge}
      />

      <AddNewConceptDialog
        onClose={() => setOpenAddDialog(false)}
        open={openAddDialog}
        ontology={ontology}
      />
    </div>
  );
};
