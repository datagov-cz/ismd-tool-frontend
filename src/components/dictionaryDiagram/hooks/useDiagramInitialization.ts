import { ActionDispatch, useEffect, useRef } from 'react';

import { ConceptDetailModel, DiagramDto } from '@/api/generated';

import { HistoryAction } from './withHistory';

export function useDiagramInitialization(
  concepts: ConceptDetailModel[],
  diagram: DiagramDto | undefined,
  isDiagramPending: boolean,
  dispatch: ActionDispatch<[action: HistoryAction]>,
) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || concepts.length === 0 || isDiagramPending) {
      return;
    }

    initialized.current = true;

    dispatch({
      type: 'init',
      concepts,
      diagram: diagram?.nodes?.length ? diagram : undefined,
    });
  }, [concepts, diagram, dispatch, isDiagramPending]);
}
