import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const CONTENT_PATH = path.join(process.cwd(), 'src/app/hints');

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get('filePath');

  if (!filePath) {
    return NextResponse.json({ error: 'Missing filePath' }, { status: 400 });
  }

  const absPath = path.resolve(CONTENT_PATH, `.${path.sep}${filePath}`);
  const rootWithSep = CONTENT_PATH.endsWith(path.sep)
    ? CONTENT_PATH
    : `${CONTENT_PATH}${path.sep}`;
  if (!absPath.startsWith(rootWithSep)) {
    return NextResponse.json({ error: 'Invalid filePath' }, { status: 400 });
  }

  // Attempt the read directly rather than checking existence/type first:
  // a check-then-read sequence is a TOCTOU race. Missing file (ENOENT) and
  // directory (EISDIR) both map to 404.
  try {
    const content = await fs.promises.readFile(absPath, 'utf-8');
    return NextResponse.json({ content });
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'EISDIR') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    // eslint-disable-next-line no-console
    console.error('Failed to read hint file:', e);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
