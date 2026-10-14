import { type Dispatch, type DragEvent, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { resolveConceptReferences } from '@/api/generated';
import {
  type Concept,
  getConceptId,
  getConceptIri,
  getConceptKind,
} from '../model/concept';
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
  const t = useTranslations('DictionaryDiagram.Canvas');
  const { getNode, screenToFlowPosition } = useReactFlow<
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
        const conceptId = getConceptId(concept);
        const isForeign = !concepts.some(
          (localConcept) => getConceptId(localConcept) === conceptId,
        );
        dispatch({
          type: 'placeTrida',
          concept,
          position,
          allConcepts: concepts,
        });

        const conceptIri = getConceptIri(concept);
        if (isForeign && conceptIri) {
          void resolveConceptReferences({ iris: [conceptIri] })
            .then((response) => {
              const names = response.data?.resolved?.[conceptIri]?.ontologyName;
              const ontologyName =
                names?.cs ?? (names ? Object.values(names)[0] : undefined);
              if (!ontologyName) return;

              dispatch({
                type: 'setForeignOntologyName',
                conceptId,
                ontologyName,
              });
            })
            .catch(() => {
              // Keep the generic foreign-dictionary label when resolution fails.
            });
        }
        return;
      }

      // 2) Vlastnost → must land on a Třída node; reducer moves it there.
      if (kind === 'vlastnost') {
        const targetNodeId = nodeIdFromEvent(event);
        if (!targetNodeId) return; // not dropped on a node → ignore

        if (getNode(targetNodeId)?.data.readOnly) {
          toast.info(t('ForeignPropertyNotAllowed'), {
            position: 'bottom-right',
          });
          return;
        }

        dispatch({ type: 'assignVlastnost', targetNodeId, vlastnost: concept });
        return;
      }

      // 3) Vztah and anything else: not droppable yet.
    },
    [concepts, dispatch, getNode, screenToFlowPosition, t],
  );

  return { onDrop, onDragOver };
};
