import { type Dispatch, type DragEvent, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

import { type Concept, getConceptKind } from '../model/concept';
import { parseConceptDrag } from '../model/conceptDrag';
import {
  type ConceptFlowEdge,
  type ConceptFlowNode,
  type DiagramAction,
} from '../model/diagram';

/**
 * The one spot that depends on React Flow's internal DOM (the `.react-flow__node`
 * class + `data-id`). React Flow has no first-class "drop onto a node" event, so
 * this is the workaround — kept here so a library bump only breaks one place.
 */
const nodeIdFromEvent = (event: DragEvent<HTMLElement>): string | null =>
  (event.target as HTMLElement)
    ?.closest?.('.react-flow__node')
    ?.getAttribute('data-id') ?? null;

export const useConceptDrop = (
  dispatch: Dispatch<DiagramAction>,
  concepts: Concept[],
) => {
  const { screenToFlowPosition } = useReactFlow<
    ConceptFlowNode,
    ConceptFlowEdge
  >();

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const concept = parseConceptDrag(event.dataTransfer);
      if (!concept) return;

      const kind = getConceptKind(concept);

      // 1) Třída → new node (reducer auto-fills its Vlastnosti + dedups).
      if (kind === 'trida') {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        dispatch({
          type: 'placeTrida',
          concept,
          position,
          allConcepts: concepts,
        });
        return;
      }

      // 2) Vlastnost → must land on a Třída node; reducer moves it there.
      if (kind === 'vlastnost') {
        const targetNodeId = nodeIdFromEvent(event);
        if (!targetNodeId) return; // not dropped on a node → ignore
        dispatch({ type: 'assignVlastnost', targetNodeId, vlastnost: concept });
        return;
      }

      // 3) Vztah and anything else: not droppable yet.
    },
    [concepts, dispatch, screenToFlowPosition],
  );

  return { onDrop, onDragOver };
};
