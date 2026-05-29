import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

import { FileNode } from '@/lib/appTypes';
import { getRecommendedHints } from '@/lib/routeHints';

const CONTENT_PATH = path.join(process.cwd(), 'src/app/hints');

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pathname = searchParams.get('pathname') ?? '/';
  const isLoggedIn = searchParams.get('isLoggedIn') === 'true';

  const hintPaths = getRecommendedHints(pathname, isLoggedIn);

  const recommendations = hintPaths
    .map((hintPath) => {
      const absPath = path.join(CONTENT_PATH, hintPath);
      if (!fs.existsSync(absPath)) return null;

      const node: FileNode = {
        name: path.basename(hintPath),
        path: hintPath,
        type: 'file',
      };

      return node;
    })
    .filter(Boolean) as FileNode[];

  return NextResponse.json({ recommendations });
}
