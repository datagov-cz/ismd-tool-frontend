import { useEffect, useState } from 'react';

import { FileNode, SearchMatchType } from '@/lib/appTypes';
import { fetchApi } from '@/lib/basePath';

export function useHintTree() {
  const [tree, setTree] = useState<FileNode[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem('cached-hint-tree');
    if (cached) setTree(JSON.parse(cached));

    fetchApi('/api/hint-tree')
      .then((r) => r.json())
      .then((data: FileNode[]) => {
        setTree(data);
        localStorage.setItem('cached-hint-tree', JSON.stringify(data));
      })
      .catch(() => {
        if (cached) setTree(JSON.parse(cached));
      });
  }, []);

  return tree;
}

export function useHintSearch(query: string) {
  const [matches, setMatches] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!query) {
      setMatches(new Set());
      return;
    }

    const id = setTimeout(async () => {
      try {
        const res = await fetchApi(
          `/api/hint-search?q=${encodeURIComponent(query)}`,
        );
        const data: { matches: SearchMatchType[] } = await res.json();
        setMatches(new Set(data.matches.map((m) => m.path)));
      } catch {
        setMatches(new Set());
      }
    }, 300);

    return () => clearTimeout(id);
  }, [query]);

  return matches;
}

export function useHintFile(path: string | null) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!path) return;

    setContent('');

    const cacheKey = `cached-hint-file-${path}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) setContent(cached);

    fetchApi(`/api/hint-file?filePath=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((data: { content: string }) => {
        setContent(data.content);
        localStorage.setItem(cacheKey, data.content);
      })
      .catch(() => {
        if (cached) setContent(cached);
      });
  }, [path]);

  return content;
}
