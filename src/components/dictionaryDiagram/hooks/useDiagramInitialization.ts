import { ActionDispatch, useEffect, useRef } from 'react';

import { ConceptDetailModel } from '@/api/generated';

import { HistoryAction } from './withHistory';

export function useDiagramInitialization(
  concepts: ConceptDetailModel[],
  dispatch: ActionDispatch<[action: HistoryAction]>,
) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || concepts.length === 0) {
      return;
    }

    initialized.current = true;

    dispatch({
      type: 'init',
      concepts,
    });
  }, [concepts, dispatch]);
}
