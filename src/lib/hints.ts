import fs from 'fs';
import path from 'path';

import { FileNode } from './appTypes';

const HINTS_PATH = path.join(process.cwd(), 'src/app/hints');

export function getHintStructure(dirPath = HINTS_PATH): FileNode[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  return entries.map((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return {
        name: entry.name,
        path: fullPath.replace(HINTS_PATH, ''), // relative path
        type: 'folder',
        children: getHintStructure(fullPath),
      };
    } else {
      return {
        name: entry.name,
        path: fullPath.replace(HINTS_PATH, ''),
        type: 'file',
      };
    }
  });
}
