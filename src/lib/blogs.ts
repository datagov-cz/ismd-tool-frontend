import fs from 'fs';
import path from 'path';

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  description: string;
  href: string;
}

export function getBlogPosts(): BlogPost[] {
  const blogsDir = path.join(process.cwd(), 'src/app/blogs');

  try {
    const entries = fs.readdirSync(blogsDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const slug = entry.name;
        const mdxPath = path.join(blogsDir, slug, 'page.mdx');

        if (fs.existsSync(mdxPath)) {
          const content = fs.readFileSync(mdxPath, 'utf-8');
          const title = content.match(/^# (.+)$/m)?.[1] || slug;

          return {
            id: slug,
            title,
            date: new Date().toLocaleDateString('cs-CZ'),
            description: `Přečtěte si článek: ${title}`,
            href: `/blogs/${slug}`,
          };
        }
        return null;
      })
      .filter(Boolean) as BlogPost[];
  } catch {
    return [];
  }
}
