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
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

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

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  function FileNodeComponent({ node }: { node: FileNode }) {
    const isExpanded = expandedFolders.has(node.path);

    if (node.type === 'folder') {
      return (
        <div className="ml-2">
          <div
            onClick={() => toggleFolder(node.path)}
            className="cursor-pointer font-bold"
          >
            {isExpanded ? '📂' : '📁'} {node.name}
          </div>
          {isExpanded &&
            node.children?.map((child) => (
              <FileNodeComponent key={child.path} node={child} />
            ))}
        </div>
      );
    }

    return (
      <div
        className={`ml-5 cursor-pointer hover:underline ${selectedFile === node.path ? 'font-medium' : ''}`}
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
      <div className="gap-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* File tree */}
          <div className="col-span-1">
            <h2 className="font-bold text-lg mb-2">📂 {t('FileExplorer')}</h2>
            <div className="overflow-y-auto h-[66vh]">
              {tree.map((node) => (
                <FileNodeComponent key={node.path} node={node} />
              ))}
            </div>
          </div>

          {/* File viewer */}
          <div className="col-span-2">
            {selectedFile && (
              <h2 className="font-bold text-lg mb-2">📄 {selectedFile}</h2>
            )}
            <div className="h-[66vh] overflow-y-auto">
              {selectedFile ? (
                <div className="prose prose-h1:my-4 prose-h2:my-3 prose-h3:my-3 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 max-w-none">
                  <ReactMarkdown>{fileContent}</ReactMarkdown>
                </div>
              ) : (
                <p>{t('SelectFile')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Sidebox>
  );
};
