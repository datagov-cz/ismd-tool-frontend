import type { DragEvent } from 'react';

import type { Concept } from './concept';

export const CONCEPT_DRAG_MIME = 'application/x-concept';

export const onConceptDragStart = (
  event: DragEvent<HTMLElement>,
  concept: Concept,
) => {
  event.dataTransfer.setData(CONCEPT_DRAG_MIME, JSON.stringify(concept));
  event.dataTransfer.effectAllowed = 'move';
};

/** Read + parse a dragged concept back out of a drop event. */
export const parseConceptDrag = (
  dataTransfer: DataTransfer,
): Concept | null => {
  const raw = dataTransfer.getData(CONCEPT_DRAG_MIME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Concept;
  } catch {
    return null;
  }
};

export const getConceptFromDragEvent = (e: React.DragEvent): Concept | null => {
  const raw = e.dataTransfer.getData('application/x-concept');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Concept;
  } catch {
    return null;
  }
};
