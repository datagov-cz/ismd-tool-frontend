import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';

export function DetailPanel({ content }: { content: string }) {
  const t = useTranslations('Header.Hintbox');
  return (
    <div className="flex flex-col h-full border-t border-border-grey">
      <div className="overflow-y-auto flex-1">
        <div className="prose prose-sm prose-h1:my-4 prose-h2:my-3 prose-h3:my-3 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 max-w-none dark:prose-invert px-2">
          {content ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <p className="text-gray-400 animate-pulse">{t('Loading')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
