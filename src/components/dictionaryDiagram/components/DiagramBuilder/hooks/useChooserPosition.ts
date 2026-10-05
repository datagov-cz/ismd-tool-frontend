import { RefObject, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

import { ConceptFlowNode } from '@/components/dictionaryDiagram/model/diagram';

export const useChooserPosition = (
  wrapperRef: RefObject<HTMLDivElement | null>,
) => {
  const { flowToScreenPosition } = useReactFlow();

  const toLocal = useCallback(
    (clientX: number, clientY: number) => {
      const bounds = wrapperRef.current?.getBoundingClientRect();
      return {
        x: clientX - (bounds?.left ?? 0),
        y: clientY - (bounds?.top ?? 0),
      };
    },
    [wrapperRef],
  );

  const midpointBetweenNodes = useCallback(
    (source: ConceptFlowNode, target: ConceptFlowNode) => {
      const mid = flowToScreenPosition({
        x: (source.position.x + target.position.x) / 2,
        y: (source.position.y + target.position.y) / 2,
      });
      return toLocal(mid.x, mid.y);
    },
    [flowToScreenPosition, toLocal],
  );

  return { toLocal, midpointBetweenNodes };
};
