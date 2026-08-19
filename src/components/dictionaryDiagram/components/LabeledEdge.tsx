import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

import { useShowFullLabels } from './labelDisplayContext';

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
  const showFullLabels = useShowFullLabels();
  const [dragOver, setDragOver] = useState(false);

  const [labelOverride, setLabelOverride] = useState(false);
  useEffect(() => setLabelOverride(false), [showFullLabels]);
  const showFull = labelOverride ? !showFullLabels : showFullLabels;

  const labelRef = useRef<HTMLDivElement>(null);
  const [isTruncatable, setIsTruncatable] = useState(false);

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

  const addBendAtPointer = (e: React.MouseEvent<SVGPathElement>) => {
    if (!data?.onBendsChange) return;

    e.preventDefault();
    e.stopPropagation();

    const bend = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const insertAt = pts.slice(0, -1).reduce(
      (nearest, start, index) => {
        const end = pts[index + 1];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const lengthSquared = dx * dx + dy * dy;
        const progress = lengthSquared
          ? Math.max(
              0,
              Math.min(
                1,
                ((bend.x - start.x) * dx + (bend.y - start.y) * dy) /
                  lengthSquared,
              ),
            )
          : 0;
        const closestX = start.x + progress * dx;
        const closestY = start.y + progress * dy;
        const distanceSquared =
          (bend.x - closestX) ** 2 + (bend.y - closestY) ** 2;

        return distanceSquared < nearest.distanceSquared
          ? { index, distanceSquared }
          : nearest;
      },
      { index: 0, distanceSquared: Number.POSITIVE_INFINITY },
    ).index;

    data.onBendsChange([
      ...bends.slice(0, insertAt),
      bend,
      ...bends.slice(insertAt),
    ]);
  };

  const incomplete = data?.kind === 'obecny' && !data?.label;
  const dimmed = data?.emphasis === 'dimmed';
  const emphasized = data?.emphasis === 'connected';

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

  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el || !label) return;
    if (showFull) {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 16;
      setIsTruncatable(el.clientHeight > lineHeight * 1.5);
    } else {
      setIsTruncatable(el.scrollWidth > el.clientWidth);
    }
  }, [label, showFull]);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          opacity: dimmed ? 0.08 : 1,
          transition: 'opacity 160ms ease, stroke 160ms ease',
          ...(emphasized
            ? {
                stroke: '#67329e',
                strokeWidth: 2.25,
              }
            : {}),
          ...(incomplete ? { strokeDasharray: '6 4' } : {}),
          ...(dragOver ? { stroke: '#2362a2', strokeWidth: 2 } : {}),
        }}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      {!dimmed && !incomplete && data?.onBendsChange && (
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={20}
          style={{ pointerEvents: 'stroke' }}
          onContextMenu={addBendAtPointer}
        />
      )}
      {incomplete && (
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={24}
          style={{ pointerEvents: 'stroke' }}
          onContextMenu={data?.onBendsChange ? addBendAtPointer : undefined}
          {...dropHandlers}
        />
      )}

      <EdgeLabelRenderer>
        {!dimmed &&
          bends.map((b, i) => (
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
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => {
                e.stopPropagation();
                removeBend(i);
              }}
              title="Táhnutím posunete, dvojklikem odstraníte"
            />
          ))}

        {!dimmed &&
          draftBends === null &&
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
              onClick={(e) => e.stopPropagation()}
            />
          ))}

        {(label || incomplete) && (
          <div
            ref={labelRef}
            className={clsx(
              'nodrag nopan absolute rounded px-1.5 py-0.5 text-xs font-medium max-w-37.5 border',
              showFull
                ? 'whitespace-normal wrap-break-word'
                : 'overflow-hidden text-ellipsis whitespace-nowrap',
              incomplete
                ? 'border-dashed text-card-description bg-white'
                : 'border-border-grey text-dark-blue-subtle bg-white',
              dragOver && 'border-blue-primary bg-blue-subtle',
              dimmed && 'opacity-0 pointer-events-none',
              emphasized && 'shadow-sm border-blue-primary',
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY + 16}px)`,
              pointerEvents: dimmed ? 'none' : 'all',
              cursor: isTruncatable ? 'pointer' : 'default',
            }}
            onClick={
              isTruncatable
                ? (e) => {
                    e.stopPropagation();
                    setLabelOverride((v) => !v);
                  }
                : undefined
            }
            title={isTruncatable && !showFull && label ? label : undefined}
            {...dropHandlers}
          >
            {incomplete ? 'Přidat vztah' : label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};
