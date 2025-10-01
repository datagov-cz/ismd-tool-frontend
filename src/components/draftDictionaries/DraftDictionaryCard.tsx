import Link from 'next/link';

interface Props {
  title: string;
  link: string;
  text: string;
}

export const DraftDictionaryCard = ({ title, link, text }: Props) => {
  return (
    <Link
      href={link}
      className="rounded-md p-4 space-y-3 transition-shadow duration-200 hover:shadow-md cursor-pointer bg-white dark:bg-dark-bg text-black dark:text-white"
    >
      <h3 className="font-medium text-lg">{title}</h3>
      <p className="line-clamp-2">{text}</p>
    </Link>
  );
};
