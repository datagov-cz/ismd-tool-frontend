import type { Reducer } from 'react';

import type { DiagramAction } from '../model/diagram';

export type HistoryAction = DiagramAction | { type: 'undo' } | { type: 'redo' };

export type HistoryState<S> = {
  past: S[];
  present: S;
  future: S[];
  inDrag: boolean;
};

const HISTORY_LIMIT = 100;

type Decision = { commit: boolean; inDrag: boolean };

function decide(action: HistoryAction, inDrag: boolean): Decision {
  switch (action.type) {
    case 'nodesChange': {
      const { changes } = action;

      if (changes.some((c) => c.type === 'position')) {
        const moving = changes.some(
          (c) => c.type === 'position' && c.dragging === true,
        );
        if (moving) return { commit: !inDrag, inDrag: true };
        return inDrag
          ? { commit: false, inDrag: false }
          : { commit: true, inDrag: false };
      }

      const structural = changes.some(
        (c) => c.type === 'remove' || c.type === 'add' || c.type === 'replace',
      );
      return { commit: structural, inDrag };
    }

    case 'edgesChange':
      return {
        commit: action.changes.some((c) => c.type !== 'select'),
        inDrag,
      };

    default:
      return { commit: true, inDrag };
  }
}

export function withHistory<S>(
  reducer: Reducer<S, DiagramAction>,
): Reducer<HistoryState<S>, HistoryAction> {
  return (state, action) => {
    const { past, present, future, inDrag } = state;
    if (action.type === 'clearOverlays' || action.type === 'init') {
      return {
        past: [],
        present: reducer(present, action),
        future: [],
        inDrag: false,
      };
    }

    if (action.type === 'undo') {
      if (past.length === 0) return state;
      return {
        past: past.slice(0, -1),
        present: past[past.length - 1],
        future: [present, ...future],
        inDrag: false,
      };
    }

    if (action.type === 'redo') {
      if (future.length === 0) return state;
      const [next, ...rest] = future;
      return {
        past: [...past, present],
        present: next,
        future: rest,
        inDrag: false,
      };
    }

    const nextPresent = reducer(present, action);
    const { commit, inDrag: nextInDrag } = decide(action, inDrag);

    if (nextPresent === present) {
      return inDrag === nextInDrag ? state : { ...state, inDrag: nextInDrag };
    }
    if (!commit) {
      return { past, present: nextPresent, future, inDrag: nextInDrag };
    }
    return {
      past: [...past, present].slice(-HISTORY_LIMIT),
      present: nextPresent,
      future: [],
      inDrag: nextInDrag,
    };
  };
}
