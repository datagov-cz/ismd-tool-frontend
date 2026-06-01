'use client';

import { useHintboxStore } from '@/store/hintboxStore';

import { HintboxHeader } from './components/HintBoxHeader';
import { HintboxShell } from './components/HintBoxShell';
import { DetailPanel } from './components/panels/DetailPanel';
import { HomePanel } from './components/panels/HomePanel';
import { SearchPanel } from './components/panels/SearchPanel';
import { useHintFile, useHintSearch, useHintTree } from './hooks/useHintData';
import { useHintNav } from './hooks/useHintNav';
import { titleFromPath } from './utils';

export interface FlatFile {
  path: string;
  name: string;
  breadcrumb: string[];
}

export const HintSidebox = () => {
  const isHintboxOpen = useHintboxStore((state) => state.isOpen);
  const setIsHintboxOpen = useHintboxStore((state) => state.setIsOpen);

  const tree = useHintTree();
  const nav = useHintNav();
  const matches = useHintSearch(nav.searchQuery);
  const fileContent = useHintFile(nav.selectedFilePath);

  const handleClose = () => {
    setIsHintboxOpen(false);
    setTimeout(nav.reset, 300);
  };

  const handleFileSelect = (path: string) => {
    nav.openFile(path, titleFromPath(path));
  };

  return (
    <HintboxShell isOpen={isHintboxOpen} onClose={handleClose}>
      <HintboxHeader
        panel={nav.panel}
        searchQuery={nav.searchQuery}
        selectedFileTitle={nav.selectedFileTitle}
        onSearchChange={nav.setSearchQuery}
        onGoHome={nav.goHome}
        onClose={handleClose}
      />

      <div className="flex-1 overflow-hidden px-3 pt-3">
        {nav.panel === 'home' && (
          <HomePanel tree={tree} onFileSelect={handleFileSelect} />
        )}
        {nav.panel === 'search' && (
          <SearchPanel
            query={nav.searchQuery}
            tree={tree}
            matches={matches}
            onFileSelect={handleFileSelect}
          />
        )}
        {nav.panel === 'detail' && <DetailPanel content={fileContent} />}
      </div>
    </HintboxShell>
  );
};
