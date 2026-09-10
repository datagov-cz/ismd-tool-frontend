import { createContext, type Dispatch, useContext } from 'react';

import type { DiagramAction } from '../model/diagram';

export const DiagramDispatchContext = createContext<
  Dispatch<DiagramAction> | undefined
>(undefined);

export const useDiagramDispatch = () => {
  const dispatch = useContext(DiagramDispatchContext);

  if (!dispatch) {
    throw new Error('useDiagramDispatch must be used inside DiagramCanvas');
  }

  return dispatch;
};
