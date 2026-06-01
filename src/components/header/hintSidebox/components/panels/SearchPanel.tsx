import { useTranslations } from 'next-intl';

import { FileNode } from '@/lib/appTypes';
import { flattenTree } from '../../utils';
import { TopicRow } from '../TopicRow';

export function SearchPanel({
  query,
  tree,
  matches,
  onFileSelect,
}: {
  query: string;
  tree: FileNode[];
  matches: Set<string>;
  onFileSelect: (_path: string) => void;
}) {
  const allFiles = flattenTree(tree);
  const results = allFiles.filter((f) => matches.has(f.path));
  const t = useTranslations('Header.Hintbox');

  if (!query) {
    return (
      <p className="text-sm text-gray-400 text-center mt-10">
        {t('EnterSearch')}
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center mt-10">
        {t('NoResults')} &quot;{query}&quot;
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 overflow-y-auto h-full pb-4 px-1">
      <p className="text-dark-secondary px-3 pb-1">
        {results.length} výsledk
        {results.length === 1 ? '' : results.length < 5 ? 'y' : 'ů'} pro{' '}
        <strong>&quot;{query}&quot;</strong>
      </p>
      {results.map((f) => (
        <TopicRow
          key={f.path}
          file={f}
          query={query}
          onClick={() => onFileSelect(f.path)}
        />
      ))}
    </div>
  );
}
