// hooks/withHistory.ts
import type { Reducer } from 'react';

import type { DiagramAction } from '../model/diagram';

export type HistoryAction = DiagramAction | { type: 'undo' } | { type: 'redo' };

export type HistoryState<S> = {
  past: S[];
  present: S;
  future: S[];
  /** true while a pointer drag is in flight, so we snapshot only once per drag */
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
        // first move of a drag → snapshot; later moves → skip; release → skip
        if (moving) return { commit: !inDrag, inDrag: true };
        return inDrag
          ? { commit: false, inDrag: false } // drag released
          : { commit: true, inDrag: false }; // discrete (keyboard) move
      }

      const structural = changes.some(
        (c) => c.type === 'remove' || c.type === 'add' || c.type === 'replace',
      );
      return { commit: structural, inDrag }; // ignore pure select / dimensions
    }

    case 'edgesChange':
      return {
        commit: action.changes.some((c) => c.type !== 'select'),
        inDrag,
      };

    // connect, drop, add-concept, … — every other mutation is one undo step
    default:
      return { commit: true, inDrag };
  }
}

export function withHistory<S>(
  reducer: Reducer<S, DiagramAction>,
): Reducer<HistoryState<S>, HistoryAction> {
  return (state, action) => {
    const { past, present, future, inDrag } = state;
    console.log(state, 'test');
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
