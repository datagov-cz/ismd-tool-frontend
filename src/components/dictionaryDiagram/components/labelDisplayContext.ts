import { createContext, useContext } from 'react';

/**
 * Global display mode for edge labels.
 * `false` (default) — labels are clamped to LABEL_MAX_WIDTH and ellipsized.
 * `true` — labels wrap and show their full text.
 *
 * Provided by DiagramCanvas; consumed by LabeledEdge. EdgeLabelRenderer
 * renders through a portal, but portals preserve React context, so a plain
 * provider around <ReactFlow> is enough.
 */
export const LabelDisplayContext = createContext(false);

export const useShowFullLabels = () => useContext(LabelDisplayContext);
