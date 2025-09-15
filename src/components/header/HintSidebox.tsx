'use client';

import { useHintboxStore } from '@/store/hintboxStore';
import { useTranslations } from 'next-intl';
import { Sidebox } from '../shared/Sidebox';
import { useState, useEffect } from 'react';
import { FileNode } from '@/lib/appTypes';
import ReactMarkdown from 'react-markdown';

export const HintSidebox = () => {
  const isHintboxOpen = useHintboxStore((state) => state.isOpen);
  const setIsHintboxOpen = useHintboxStore((state) => state.setIsOpen);

  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  const t = useTranslations('Header.Hintbox');

  useEffect(() => {
    fetch('/api/hint-tree')
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then(setTree);
  }, []);

  const handleFileClick = (path: string) => {
    setSelectedFile(path);
    fetch(`/api/hint-file?filePath=${encodeURIComponent(path)}`)
      .then((res) => res.json())
      .then((data) => setFileContent(data.content));
  };

  function FileNodeComponent({ node }: { node: FileNode }) {
    const [expanded, setExpanded] = useState(false);

    if (node.type === 'folder') {
      return (
        <div className="ml-4">
          <div
            onClick={() => setExpanded(!expanded)}
            className="cursor-pointer font-bold"
          >
            📂 {node.name}
          </div>
          {expanded &&
            node.children?.map((child) => (
              <FileNodeComponent key={child.path} node={child} />
            ))}
        </div>
      );
    }

    return (
      <div
        className="ml-8 cursor-pointer hover:underline"
        onClick={() => handleFileClick(node.path)}
      >
        📄 {node.name}
      </div>
    );
  }

  return (
    <Sidebox
      title={t('Title')}
      isOpen={isHintboxOpen}
      setIsOpen={setIsHintboxOpen}
      closeAriaLabel={t('CloseAria')}
    >
      <div className="space-y-4 h-full">
        <div className="grid grid-cols-3 gap-4 p-4">
          {/* File tree */}
          <div className="col-span-1 overflow-y-auto">
            <h2 className="font-bold text-lg mb-2">📂 File Explorer</h2>
            {tree.map((node) => (
              <FileNodeComponent key={node.path} node={node} />
            ))}
          </div>

          {/* File viewer */}
          <div className="overflow-y-auto h-[60vh] col-span-2">
            <h2 className="font-bold text-lg mb-2">📄 Viewer</h2>
            {selectedFile ? (
              <div className="prose max-w-none">
                <ReactMarkdown>{fileContent}</ReactMarkdown>
              </div>
            ) : (
              <p>Select a file to view its contents</p>
            )}
          </div>
        </div>
      </div>
    </Sidebox>
  );
};
