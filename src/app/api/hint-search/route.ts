import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const CONTENT_PATH = path.join(process.cwd(), 'src/app/hints');

function walkDir(dir: string, fileList: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({ matches: [] });
  }

  const allFiles = walkDir(CONTENT_PATH).filter((f) => /\.mdx?$/.test(f));
  const lowerQ = q.toLowerCase();

  const matches: Array<{ path: string; name: string; snippet?: string }> = [];

  for (const f of allFiles) {
    try {
      const content = fs.readFileSync(f, 'utf-8');
      const name = path.basename(f);
      const rel = f.replace(CONTENT_PATH, '');
      const inName = name.toLowerCase().includes(lowerQ);
      const inContent = content.toLowerCase().includes(lowerQ);

      if (inName || inContent) {
        let snippet: string | undefined;
        if (inContent) {
          const idx = content.toLowerCase().indexOf(lowerQ);
          const start = Math.max(0, idx - 40);
          snippet = content
            .substring(start, Math.min(content.length, idx + 120))
            .replace(/\n+/g, ' ');
        }

        matches.push({ path: rel, name, snippet });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error reading file for search:', f, e);
    }
  }

  return NextResponse.json({ matches });
}
