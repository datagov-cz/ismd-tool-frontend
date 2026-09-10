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

    const hasStoredLayout =
      (diagram?.nodes?.length ?? 0) > 0 ||
      (diagram?.edges?.length ?? 0) > 0 ||
      (diagram?.version ?? 0) !== 0;

    dispatch({
      type: 'init',
      concepts,
      diagram: hasStoredLayout ? diagram : undefined,
    });
  }, [concepts, diagram, dispatch, isDiagramPending]);
}
