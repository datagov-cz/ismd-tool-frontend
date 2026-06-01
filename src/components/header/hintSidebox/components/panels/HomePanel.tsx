import { useTranslations } from 'next-intl';

import { useCurrentUser } from '@/components/contexts/CurrentUserProvider';
import { FileNode } from '@/lib/appTypes';
import { useHintRecommendations } from '../../hooks/useHintRecommendations';
import { flattenTree } from '../../utils';
import { TopicRow } from '../TopicRow';

export function HomePanel({
  tree,
  onFileSelect,
}: {
  tree: FileNode[];
  onFileSelect: (_path: string) => void;
}) {
  const allFiles = flattenTree(tree);
  const user = useCurrentUser();
  const recommendations = useHintRecommendations(user.isLoggedIn);
  const flatRecommendations = recommendations.map(
    (rec) =>
      allFiles.find((f) => f.path === rec.path) ?? {
        path: rec.path,
        name: rec.name,
        breadcrumb: [],
      },
  );

  const t = useTranslations('Header.Hintbox');

  return (
    <div className="flex flex-col gap-6 overflow-y-auto h-full px-1 pb-4">
      <section>
        <h3 className="text-md font-semibold mb-2 px-1">{t('Recommended')}</h3>
        <ul className="flex flex-col">
          {flatRecommendations.map((node) => (
            <TopicRow
              key={node.path}
              file={node}
              onClick={() => onFileSelect(node.path)}
            />
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-m font-semibold mb-2 px-1">{t('All')}</h3>
        <ul className="flex flex-col">
          {allFiles.map((f) => (
            <TopicRow
              key={f.path}
              file={f}
              onClick={() => onFileSelect(f.path)}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
