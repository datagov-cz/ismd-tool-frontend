import fs from 'fs';
import path from 'path';

export interface HintPage {
  id: string;
  title: string;
  description: string;
  href: string;
  category: string;
}

export function getHintPages(): HintPage[] {
  const hintsDir = path.join(process.cwd(), 'hints');
  
  try {
    const categories = fs.readdirSync(hintsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory());
    
    const pages: HintPage[] = [];
    
    categories.forEach(category => {
      const categoryPath = path.join(hintsDir, category.name);
      const files = fs.readdirSync(categoryPath)
        .filter(file => file.endsWith('.md'));
      
      files.forEach(file => {
        const filePath = path.join(categoryPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const title = content.match(/^# (.+)$/m)?.[1] || file.replace('.md', '');
        const slug = file.replace('.md', '');
        
        if (slug !== 'README') {
          pages.push({
            id: `${category.name}-${slug}`,
            title,
            description: `Nápověda: ${title}`,
            href: `/hints/${category.name}/${slug}`,
            category: category.name,
          });
        }
      });
    });
    
    return pages;
  } catch {
    return [];
  }
}