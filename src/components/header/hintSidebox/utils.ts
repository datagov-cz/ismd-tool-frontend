import { FileNode } from '@/lib/appTypes';

import { FlatFile } from './HintSidebox';

export function getParentPaths(filePath: string): string[] {
  const parts = filePath.split('/').filter(Boolean);
  const paths: string[] = [];

  for (let i = 0; i < parts.length - 1; i++) {
    paths.push('/' + parts.slice(0, i + 1).join('/'));
  }

  return paths;
}

export function flattenTree(
  nodes: FileNode[],
  ancestors: string[] = [],
): FlatFile[] {
  const result: FlatFile[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      result.push({ path: node.path, name: node.name, breadcrumb: ancestors });
    } else if (node.children) {
      result.push(...flattenTree(node.children, [...ancestors, node.name]));
    }
  }
  return result;
}

export function titleFromPath(path: string) {
  return (
    path
      .split('/')
      .pop()
      ?.replace(/\.[^.]+$/, '') ?? path
  );
}
