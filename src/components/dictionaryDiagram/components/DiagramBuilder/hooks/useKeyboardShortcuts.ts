import { useEffect } from 'react';

import { HistoryAction } from '@/components/dictionaryDiagram/hooks/withHistory';

type Dispatch = React.Dispatch<HistoryAction>;

export const useKeyboardShortcuts = (dispatch: Dispatch) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      if (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      ) {
        return;
      }

      const modifierPressed = e.metaKey || e.ctrlKey;

      if (modifierPressed && e.key.toLowerCase() === 'z') {
        e.preventDefault();

        dispatch({
          type: e.shiftKey ? 'redo' : 'undo',
        });

        return;
      }

      if (modifierPressed && e.key.toLowerCase() === 'y') {
        e.preventDefault();

        dispatch({
          type: 'redo',
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [dispatch]);
};
