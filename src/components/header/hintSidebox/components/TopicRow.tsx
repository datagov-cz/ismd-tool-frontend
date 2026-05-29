import { FileHighlighter } from '../FileHighlighter';
import { FlatFile } from '../HintSidebox';
import { titleFromPath } from '../utils';

export function TopicRow({
  file,
  query,
  onClick,
}: {
  file: FlatFile;
  query?: string;
  onClick: () => void;
}) {
  return (
    <li className="w-full text-left list-disc ml-6 px py-1">
      <span className="flex flex-col min-w-0 items-start">
        <button
          onClick={onClick}
          className="text-md font-bold underline text-blue-primary hover:no-underline"
        >
          {query ? (
            <FileHighlighter text={titleFromPath(file.path)} query={query} />
          ) : (
            titleFromPath(file.path)
          )}
        </button>
        {file.breadcrumb.length > 0 && (
          <span className="text-xs text-gray-400 truncate cursor-default">
            {file.breadcrumb.join(' › ')}
          </span>
        )}
      </span>
    </li>
  );
}
