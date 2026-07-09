import { useRef, useState } from 'react';
import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  useReactFlow,
  type XYPosition,
} from '@xyflow/react';
import clsx from 'clsx';

import { type Concept, getConceptKind } from '../model/concept';
import { getConceptFromDragEvent } from '../model/conceptDrag';
import type { ConceptEdgeData } from '../model/diagram';
import { buildBentPath } from '../model/edgePath';

const MAX_LABEL_LENGTH = 15;

export type LabeledEdgeData = ConceptEdgeData & {
  onDropVztah?: (_vztah: Concept) => void;
  onBendsChange?: (_bends?: XYPosition[]) => void;
};

export const LabeledEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerStart,
  markerEnd,
  data,
}: EdgeProps<Edge<LabeledEdgeData>>) => {
  const [expanded, setExpanded] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [draftBends, setDraftBends] = useState<XYPosition[] | null>(null);
  const dragIndex = useRef<number | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const bends = draftBends ?? data?.bends ?? [];
  const hasBends = bends.length > 0;

  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (hasBends) {
    edgePath = buildBentPath({ x: sourceX, y: sourceY }, bends, {
      x: targetX,
      y: targetY,
    });
    const mid = bends[Math.floor((bends.length - 1) / 2)];
    labelX = mid.x;
    labelY = mid.y;
  } else {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  }

  const pts = [
    { x: sourceX, y: sourceY },
    ...bends,
    { x: targetX, y: targetY },
  ];
  const segmentMids = pts.slice(0, -1).map((p, i) => ({
    x: (p.x + pts[i + 1].x) / 2,
    y: (p.y + pts[i + 1].y) / 2,
    insertAt: i,
  }));

  const startDrag = (index: number) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragIndex.current = index;
    setDraftBends(bends);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const startInsertDrag = (insertAt: number) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    dragIndex.current = insertAt;
    setDraftBends([...bends.slice(0, insertAt), p, ...bends.slice(insertAt)]);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (dragIndex.current === null) return;
    const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setDraftBends((prev) =>
      prev ? prev.map((b, i) => (i === dragIndex.current ? p : b)) : prev,
    );
  };

  const onDragEnd = (e: React.PointerEvent) => {
    if (dragIndex.current === null) return;
    dragIndex.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
    setDraftBends((final) => {
      if (final) data?.onBendsChange?.(final);
      return null;
    });
  };

  const removeBend = (index: number) => {
    const next = bends.filter((_, i) => i !== index);
    data?.onBendsChange?.(next.length ? next : undefined);
  };

  const incomplete = data?.kind === 'obecny' && !data?.label;

  const dropHandlers = incomplete
    ? {
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          setDragOver(true);
        },
        onDragLeave: () => setDragOver(false),
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
          const concept = getConceptFromDragEvent(e);
          if (concept && getConceptKind(concept) === 'vztah') {
            data?.onDropVztah?.(concept);
          }
        },
      }
    : {};

  const label = data?.label;
  const isTruncatable = !!label && label.length > MAX_LABEL_LENGTH;
  const displayLabel =
    isTruncatable && !expanded ? `${label.slice(0, MAX_LABEL_LENGTH)}…` : label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          ...(incomplete ? { strokeDasharray: '6 4' } : {}),
          ...(dragOver ? { stroke: '#2362a2', strokeWidth: 2 } : {}),
        }}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      {incomplete && (
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={24}
          style={{ pointerEvents: 'stroke' }}
          {...dropHandlers}
        />
      )}

      <EdgeLabelRenderer>
        {bends.map((b, i) => (
          <div
            key={`bend-${i}`}
            className="nodrag nopan absolute w-3 h-3 rounded-full border-2 border-blue-primary bg-white"
            style={{
              transform: `translate(-50%, -50%) translate(${b.x}px, ${b.y}px)`,
              pointerEvents: 'all',
              cursor: 'grab',
            }}
            onPointerDown={startDrag(i)}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onDoubleClick={(e) => {
              e.stopPropagation();
              removeBend(i);
            }}
            title="Táhnutím posunete, dvojklikem odstraníte"
          />
        ))}

        {draftBends === null &&
          segmentMids.map((m) => (
            <div
              key={`ghost-${m.insertAt}-${m.x}-${m.y}`}
              className="nodrag nopan absolute w-2.5 h-2.5 rounded-full border border-blue-primary bg-white opacity-0 hover:opacity-60 transition-opacity"
              style={{
                transform: `translate(-50%, -50%) translate(${m.x}px, ${m.y}px)`,
                pointerEvents: 'all',
                cursor: 'grab',
              }}
              onPointerDown={startInsertDrag(m.insertAt)}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
            />
          ))}

        {(label || incomplete) && (
          <div
            className={clsx(
              'nodrag nopan absolute rounded px-1.5 py-0.5 text-xs font-medium max-w-55 border',
              incomplete
                ? 'border-dashed text-card-description bg-white'
                : 'border-border-grey text-dark-blue-subtle bg-white',
              dragOver && 'border-blue-primary bg-blue-subtle',
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY + 16}px)`,
              pointerEvents: 'all',
              cursor: isTruncatable ? 'pointer' : 'default',
              whiteSpace: expanded ? 'normal' : 'nowrap',
            }}
            onClick={
              isTruncatable
                ? (e) => {
                    e.stopPropagation();
                    setExpanded((v) => !v);
                  }
                : undefined
            }
            title={isTruncatable && !expanded ? label : undefined}
            {...dropHandlers}
          >
            {incomplete ? 'Přidat vztah' : displayLabel}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};
