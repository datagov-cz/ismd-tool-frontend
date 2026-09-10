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
import { toPng } from 'html-to-image';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { AddNewConceptDialog } from '@/components/dictionaryDiagram/components/AddNewConceptDialog';
import { ConceptNode } from '@/components/dictionaryDiagram/components/ConceptNode';
import { DiagramDispatchContext } from '@/components/dictionaryDiagram/components/diagramDispatchContext';
import { LabelDisplayContext } from '@/components/dictionaryDiagram/components/labelDisplayContext';
import { LabeledEdge } from '@/components/dictionaryDiagram/components/LabeledEdge';
import { PendingChangesContext } from '@/components/dictionaryDiagram/components/pendingChangesContext';
import { useConceptDrop } from '@/components/dictionaryDiagram/hooks/useConceptDrop';
import { getConceptId } from '@/components/dictionaryDiagram/model/concept';
import {
  type ConceptFlowEdge,
  type ConceptFlowNode,
} from '@/components/dictionaryDiagram/model/diagram';

import { DiagramExportDialog } from './components/DiagramExportDialog';
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
const EXPORT_PADDING = 80;
const MAX_EXPORT_SIDE = 16384;
const MAX_EXPORT_PIXELS = 64_000_000;

const getExportPixelRatio = (
  width: number,
  height: number,
  preferredRatio: number,
) =>
  Math.min(
    preferredRatio,
    MAX_EXPORT_SIDE / width,
    MAX_EXPORT_SIDE / height,
    Math.sqrt(MAX_EXPORT_PIXELS / (width * height)),
  );

const materializeSvgPaint = (root: HTMLElement) => {
  const paintedElements = root.querySelectorAll<SVGElement>(
    '.react-flow__edge-path, .react-flow__marker path, .react-flow__marker polyline',
  );

  const originalStyles = Array.from(paintedElements, (element) => ({
    element,
    fill: element.style.fill,
    stroke: element.style.stroke,
  }));

  for (const element of paintedElements) {
    const styles = getComputedStyle(element);
    element.style.fill = styles.fill;
    element.style.stroke = styles.stroke;
  }

  return () => {
    for (const { element, fill, stroke } of originalStyles) {
      element.style.fill = fill;
      element.style.stroke = stroke;
    }
  };
};

const getNodeLabel = (unknownLabel: string, node?: ConceptFlowNode) => {
  const concept = node?.data.concept;
  if (!concept) return unknownLabel;
  const metadata = concept.metadata;
  return (
    concept.název?.cs ??
    (metadata && 'label' in metadata ? metadata.label : undefined) ??
    concept.iri ??
    unknownLabel
  );
};

const getRelationLabel = (
  edge: ConceptFlowEdge,
  labels: { hierarchy: string; equivalence: string; relationship: string },
) => {
  if (edge.data?.label) return edge.data.label;
  if (edge.data?.kind === 'hierarchie') return labels.hierarchy;
  if (edge.data?.kind === 'ekvivalence') return labels.equivalence;
  return labels.relationship;
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
  pendingConceptIds,
  pendingEdgeIds,
  diagramName,
  renamingDiagram,
  onRenameDiagram,
}: DiagramBuilderProps) => {
  const t = useTranslations('DictionaryDiagram.Canvas');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { getNode, getNodesBounds, getZoom, setCenter } = useReactFlow<
    ConceptFlowNode,
    ConceptFlowEdge
  >();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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
    pendingConceptIds,
    pendingEdgeIds,
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
        source: getNodeLabel(t('UnknownConcept'), nodeById.get(edge.source)),
        relation: getRelationLabel(edge, {
          hierarchy: t('Hierarchy'),
          equivalence: t('Equivalence'),
          relationship: t('Relationship'),
        }),
        targetId: edge.target,
        target: getNodeLabel(t('UnknownConcept'), nodeById.get(edge.target)),
      }));
  }, [nodes, edges, focusedNodeIds, t]);

  const highlightedRelationsTitle =
    focusedNodeIds.size === 1
      ? getNodeLabel(
          t('UnknownConcept'),
          nodes.find((node) => focusedNodeIds.has(node.id)),
        )
      : t('HighlightedConcepts', { count: focusedNodeIds.size });

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
          onBlur: () =>
            setFocusedNodeIds((current) => {
              const next = new Set(current);
              next.delete(node.id);
              return next;
            }),
          onRemove: () =>
            setFocusedNodeIds((current) => {
              const next = new Set(current);
              next.delete(node.id);
              return next;
            }),
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

  const exportPng = useCallback(
    async (scope: 'diagram' | 'viewport') => {
      const flowElement =
        wrapperRef.current?.querySelector<HTMLElement>('.react-flow');
      const rendererElement = flowElement?.querySelector<HTMLElement>(
        '.react-flow__renderer',
      );
      const viewportElement = flowElement?.querySelector<HTMLElement>(
        '.react-flow__viewport',
      );

      if (!flowElement || !rendererElement || !viewportElement) {
        toast.error(t('ExportError'));
        return;
      }

      setIsExporting(true);
      const restoreSvgPaint = materializeSvgPaint(flowElement);
      let restoreViewportTransform = () => {};

      try {
        const flowBounds = flowElement.getBoundingClientRect();
        let dataUrl: string;

        if (scope === 'diagram' && nodes.length > 0) {
          const bounds = getNodesBounds(nodes);
          const width = Math.ceil(bounds.width + EXPORT_PADDING * 2);
          const height = Math.ceil(bounds.height + EXPORT_PADDING * 2);
          const transformedLayers =
            rendererElement.querySelectorAll<HTMLElement>(
              '.react-flow__viewport, .react-flow__edgelabel-renderer',
            );
          const originalTransforms = Array.from(
            transformedLayers,
            (element) => ({ element, transform: element.style.transform }),
          );
          const transform = `translate(${EXPORT_PADDING - bounds.x}px, ${EXPORT_PADDING - bounds.y}px) scale(1)`;

          for (const element of transformedLayers) {
            element.style.transform = transform;
          }
          restoreViewportTransform = () => {
            for (const { element, transform } of originalTransforms) {
              element.style.transform = transform;
            }
          };

          dataUrl = await toPng(rendererElement, {
            backgroundColor: '#ffffff',
            width,
            height,
            pixelRatio: getExportPixelRatio(width, height, 2),
          });
        } else {
          dataUrl = await toPng(rendererElement, {
            backgroundColor: '#ffffff',
            width: flowBounds.width,
            height: flowBounds.height,
            pixelRatio: getExportPixelRatio(
              flowBounds.width,
              flowBounds.height,
              3,
            ),
          });
        }

        const safeName = ontology
          .split(/[\\/]/)
          .pop()
          ?.replace(/[^a-zA-Z0-9_-]+/g, '-')
          .replace(/^-|-$/g, '');
        const link = document.createElement('a');
        link.download = `${safeName || 'diagram'}-${scope === 'diagram' ? 'cely' : 'vyrez'}.png`;
        link.href = dataUrl;
        link.click();
        setOpenExportDialog(false);
      } catch {
        toast.error(t('ExportError'));
      } finally {
        restoreViewportTransform();
        restoreSvgPaint();
        setIsExporting(false);
      }
    },
    [getNodesBounds, nodes, ontology, t],
  );

  return (
    <div
      className="flex-1084 bg-white shadow-subtle rounded-md relative"
      ref={wrapperRef}
    >
      <DiagramDispatchContext.Provider value={dispatch}>
        <PendingChangesContext.Provider value={pendingConceptIds}>
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
                canClear={nodes.length > 0 || edges.length > 0}
                onClear={() => dispatch({ type: 'clearDiagram' })}
              />

              <HighlightedRelationsPanel
                title={highlightedRelationsTitle}
                relations={highlightedRelations}
                onRelationClick={centerOnUnfocusedRelationNode}
              />

              <DiagramTopBar
                onExport={() => setOpenExportDialog(true)}
                diagramName={diagramName}
                renaming={renamingDiagram}
                onRename={onRenameDiagram}
              />

              <Controls className="text-blue-hover" showInteractive={true}>
                <ControlButton
                  onClick={() => setShowFullLabels((v) => !v)}
                  title={
                    showFullLabels ? t('ShortenLabels') : t('ShowFullLabels')
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
        </PendingChangesContext.Provider>
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

      <DiagramExportDialog
        open={openExportDialog}
        isExporting={isExporting}
        onClose={() => setOpenExportDialog(false)}
        onExport={(scope) => void exportPng(scope)}
      />
    </div>
  );
};
