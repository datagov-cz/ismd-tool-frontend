import { ActionDispatch, useEffect, useRef } from 'react';

import { ConceptDetailModel, DiagramDto } from '@/api/generated';

import { HistoryAction } from './withHistory';

export function useDiagramInitialization(
  {
    concepts,
    diagram,
    isReady,
    sourceKey,
  }: {
    concepts: ConceptDetailModel[];
    diagram: DiagramDto | undefined;
    isReady: boolean;
    sourceKey: string;
  },
  dispatch: ActionDispatch<[action: HistoryAction]>,
) {
  const initializedSource = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isReady || initializedSource.current === sourceKey) {
      return;
    }

    initializedSource.current = sourceKey;

    const hasStoredLayout =
      (diagram?.nodes?.length ?? 0) > 0 ||
      (diagram?.edges?.length ?? 0) > 0 ||
      (diagram?.version ?? 0) !== 0;

    dispatch({
      type: 'init',
      concepts,
      diagram: hasStoredLayout ? diagram : undefined,
    });
  }, [concepts, diagram, dispatch, isReady, sourceKey]);
}
