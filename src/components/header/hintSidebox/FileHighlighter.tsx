interface Props {
  text: string;
  query: string;
}

export const FileHighlighter = ({ text, query }: Props) => {
  if (!query) return text;

  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white px-0.5 rounded">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};
