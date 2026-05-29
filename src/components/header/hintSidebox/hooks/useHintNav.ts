import { useState } from 'react';

export type Panel = 'home' | 'search' | 'detail';

export interface HintNavState {
  panel: Panel;
  searchQuery: string;
  selectedFilePath: string | null;
  selectedFileTitle: string;
}

export interface HintNavActions {
  openSearch: () => void;
  openFile: (_path: string, _title: string) => void;
  goHome: () => void;
  setSearchQuery: (_q: string) => void;
  reset: () => void;
}

const INITIAL_STATE: HintNavState = {
  panel: 'home',
  searchQuery: '',
  selectedFilePath: null,
  selectedFileTitle: '',
};

export function useHintNav(): HintNavState & HintNavActions {
  const [state, setState] = useState<HintNavState>(INITIAL_STATE);

  const openSearch = () => setState((s) => ({ ...s, panel: 'search' }));

  const openFile = (path: string, title: string) =>
    setState((s) => ({
      ...s,
      panel: 'detail',
      selectedFilePath: path,
      selectedFileTitle: title,
    }));

  const goHome = () =>
    setState((s) => ({ ...s, panel: 'home', searchQuery: '' }));

  const setSearchQuery = (q: string) =>
    setState((s) => ({ ...s, searchQuery: q, panel: q ? 'search' : 'home' }));

  const reset = () => setState(INITIAL_STATE);

  return {
    ...state,
    openSearch,
    openFile,
    goHome,
    setSearchQuery,
    reset,
  };
}
