import type { XYPosition } from '@xyflow/react';

const CORNER_RADIUS = 12;

export const buildBentPath = (
  source: XYPosition,
  bends: XYPosition[],
  target: XYPosition,
): string => {
  const pts = [source, ...bends, target];
  let d = `M ${pts[0].x},${pts[0].y}`;

  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const next = pts[i + 1];

    const inLen = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const outLen = Math.hypot(next.x - curr.x, next.y - curr.y);

    if (inLen === 0 || outLen === 0) {
      d += ` L ${curr.x},${curr.y}`;
      continue;
    }

    const r = Math.min(CORNER_RADIUS, inLen / 2, outLen / 2);

    const inX = curr.x - ((curr.x - prev.x) / inLen) * r;
    const inY = curr.y - ((curr.y - prev.y) / inLen) * r;

    const outX = curr.x + ((next.x - curr.x) / outLen) * r;
    const outY = curr.y + ((next.y - curr.y) / outLen) * r;

    d += ` L ${inX},${inY} Q ${curr.x},${curr.y} ${outX},${outY}`;
  }

  d += ` L ${pts[pts.length - 1].x},${pts[pts.length - 1].y}`;
  return d;
};
