export function getParentPaths(filePath: string): string[] {
  const parts = filePath.split('/').filter(Boolean);
  const paths: string[] = [];

  for (let i = 0; i < parts.length - 1; i++) {
    paths.push('/' + parts.slice(0, i + 1).join('/'));
  }

  return paths;
}
