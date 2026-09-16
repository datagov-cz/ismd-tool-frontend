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
  useStore,
} from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';
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

import {
  type DiagramExportBackground,
  DiagramExportDialog,
  type DiagramExportFormat,
  type DiagramExportPhase,
} from './components/DiagramExportDialog';
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
const MIN_ZOOM = 0.5;
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const waitForNextPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

const compactSvgDataUrl = (dataUrl: string) => {
  const separatorIndex = dataUrl.indexOf(',');
  if (separatorIndex === -1)
    return new Blob([dataUrl], { type: 'image/svg+xml' });

  const svgMarkup = decodeURIComponent(dataUrl.slice(separatorIndex + 1));
  const document = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml');
  if (document.querySelector('parsererror')) {
    return new Blob([svgMarkup], { type: 'image/svg+xml' });
  }

  const elementsByStyle = new Map<string, Element[]>();
  for (const element of document.querySelectorAll('[style]')) {
    const style = element.getAttribute('style');
    if (!style) continue;
    const elements = elementsByStyle.get(style) ?? [];
    elements.push(element);
    elementsByStyle.set(style, elements);
  }

  const sharedStyleRules: string[] = [];
  let sharedStyleIndex = 0;
  for (const [style, elements] of elementsByStyle) {
    if (elements.length < 2) continue;

    const className = `diagram-export-style-${sharedStyleIndex++}`;
    sharedStyleRules.push(`.${className}{${style}}`);
    for (const element of elements) {
      element.classList.add(className);
      element.removeAttribute('style');
    }
  }

  if (sharedStyleRules.length === 0) {
    return new Blob([svgMarkup], { type: 'image/svg+xml' });
  }

  const styleElement = document.createElementNS(SVG_NAMESPACE, 'style');
  styleElement.textContent = sharedStyleRules.join('');
  document.documentElement.prepend(styleElement);

  const compactedMarkup = new XMLSerializer().serializeToString(document);
  return new Blob(
    [compactedMarkup.length < svgMarkup.length ? compactedMarkup : svgMarkup],
    { type: 'image/svg+xml' },
  );
};

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
  const [exportPhase, setExportPhase] = useState<DiagramExportPhase>('idle');
  const [showFullLabels, setShowFullLabels] = useState(false);
  const [minimumZoomWarningDismissed, setMinimumZoomWarningDismissed] =
    useState(false);
  const [viewportX, viewportY, zoom] = useStore((state) => state.transform);
  const viewportWidth = useStore((state) => state.width);
  const viewportHeight = useStore((state) => state.height);
  const [storedFocusedNodeIds, setFocusedNodeIds] = useState<Set<string>>(
    () => new Set(),
  );
  const focusedNodeIds = useMemo(() => {
    const nodeIds = new Set(nodes.map((node) => node.id));
    if ([...storedFocusedNodeIds].every((nodeId) => nodeIds.has(nodeId))) {
      return storedFocusedNodeIds;
    }
    return new Set(
      [...storedFocusedNodeIds].filter((nodeId) => nodeIds.has(nodeId)),
    );
  }, [nodes, storedFocusedNodeIds]);

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
    onReconnect,
    closeChooser,
    selectRelationship,
    removeEdge,
  } = useConnectionWorkflow({ concepts, nodes, edges, dispatch, wrapperRef });

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
      .map((edge) => {
        const sourceId =
          edge.data?.kind === 'hierarchie' ? edge.target : edge.source;
        const targetId =
          edge.data?.kind === 'hierarchie' ? edge.source : edge.target;

        return {
          id: edge.id,
          sourceId,
          source: getNodeLabel(t('UnknownConcept'), nodeById.get(sourceId)),
          relation: getRelationLabel(edge, {
            hierarchy: t('Hierarchy'),
            equivalence: t('Equivalence'),
            relationship: t('Relationship'),
          }),
          targetId,
          target: getNodeLabel(t('UnknownConcept'), nodeById.get(targetId)),
        };
      });
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

  const showMinimumZoomWarning = useMemo(() => {
    if (
      nodes.length === 0 ||
      zoom > MIN_ZOOM + 0.001 ||
      viewportWidth === 0 ||
      viewportHeight === 0
    ) {
      return false;
    }

    const bounds = getNodesBounds(nodes);
    const visibleBounds = {
      left: -viewportX / zoom,
      top: -viewportY / zoom,
      right: (viewportWidth - viewportX) / zoom,
      bottom: (viewportHeight - viewportY) / zoom,
    };
    const diagramIsOutsideViewport =
      bounds.x < visibleBounds.left ||
      bounds.y < visibleBounds.top ||
      bounds.x + bounds.width > visibleBounds.right ||
      bounds.y + bounds.height > visibleBounds.bottom;
    const diagramIsTooLarge =
      bounds.width > viewportWidth / zoom ||
      bounds.height > viewportHeight / zoom;

    return diagramIsOutsideViewport && diagramIsTooLarge;
  }, [
    getNodesBounds,
    nodes,
    viewportHeight,
    viewportWidth,
    viewportX,
    viewportY,
    zoom,
  ]);

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

  const exportDiagram = useCallback(
    async (
      scope: 'diagram' | 'viewport',
      format: DiagramExportFormat,
      background: DiagramExportBackground,
    ) => {
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

      setExportPhase('rendering');
      await waitForNextPaint();
      const restoreSvgPaint = materializeSvgPaint(flowElement);
      let restoreViewportTransform = () => {};

      try {
        const flowBounds = flowElement.getBoundingClientRect();
        let dataUrl: string;
        const backgroundColor = background === 'white' ? '#ffffff' : undefined;

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

          dataUrl =
            format === 'png'
              ? await toPng(rendererElement, {
                  backgroundColor,
                  width,
                  height,
                  pixelRatio: getExportPixelRatio(width, height, 2),
                })
              : await toSvg(rendererElement, {
                  backgroundColor,
                  width,
                  height,
                });
        } else {
          dataUrl =
            format === 'png'
              ? await toPng(rendererElement, {
                  backgroundColor,
                  width: flowBounds.width,
                  height: flowBounds.height,
                  pixelRatio: getExportPixelRatio(
                    flowBounds.width,
                    flowBounds.height,
                    3,
                  ),
                })
              : await toSvg(rendererElement, {
                  backgroundColor,
                  width: flowBounds.width,
                  height: flowBounds.height,
                });
        }

        const safeName = ontology
          .split(/[\\/]/)
          .pop()
          ?.replace(/[^a-zA-Z0-9_-]+/g, '-')
          .replace(/^-|-$/g, '');
        const link = document.createElement('a');
        link.download = `${safeName || 'diagram'}-${scope === 'diagram' ? 'cely' : 'vyrez'}.${format}`;
        if (format === 'svg') {
          setExportPhase('optimizing');
          await waitForNextPaint();
        }
        const objectUrl =
          format === 'svg'
            ? URL.createObjectURL(compactSvgDataUrl(dataUrl))
            : undefined;
        link.href = objectUrl ?? dataUrl;
        setExportPhase('downloading');
        await waitForNextPaint();
        link.click();
        if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
        setOpenExportDialog(false);
      } catch {
        toast.error(t('ExportError'));
      } finally {
        restoreViewportTransform();
        restoreSvgPaint();
        setExportPhase('idle');
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
              onReconnect={onReconnect}
              edgesReconnectable
              onDrop={onDrop}
              onDragOver={onDragOver}
              fitView
              minZoom={MIN_ZOOM}
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

      {showMinimumZoomWarning && !minimumZoomWarningDismissed && (
        <div className="pointer-events-none absolute top-4 left-1/2 z-40 -translate-x-1/2 px-4">
          <div
            role="status"
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-lg border border-status-warning-600 bg-status-warning-100 px-4 py-2 text-sm font-medium text-status-warning-700 shadow-subtle"
          >
            <span>{t('MinimumZoomWarning')}</span>
            <button
              type="button"
              onClick={() => setMinimumZoomWarningDismissed(true)}
              aria-label={t('CloseMinimumZoomWarning')}
              className="flex shrink-0 rounded p-0.5 hover:bg-status-warning-200"
            >
              <GovIcon name="x-lg" size="xs" />
            </button>
          </div>
        </div>
      )}

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
        exportPhase={exportPhase}
        onClose={() => setOpenExportDialog(false)}
        onExport={exportDiagram}
      />
    </div>
  );
};
