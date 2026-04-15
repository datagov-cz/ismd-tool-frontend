import Link from 'next/link';

interface Props {
  title: string;
  link: string;
  text: string;
  modified?: Date;
  concepts: number;
}

export const DraftDictionaryCard = ({
  title,
  link,
  text,
  modified,
  concepts,
}: Props) => {
  return (
    <Link
      href={link}
      className="rounded-xl border border-border-grey overflow-hidden shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]"
    >
      <div className=" px-4 py-2 flex gap-1 flex-col transition-shadow duration-200 hover:shadow-md cursor-pointer bg-white dark:bg-dark-bg text-black dark:text-white ">
        <p className="font-medium text-blue-primary text-[16px]">{title}</p>
        <p className="line-clamp-2 text-sm text-card-description">
          {text}&nbsp;
        </p>
      </div>
      <div className="flex justify-between bg-page-background px-4 py-2">
        <div className="flex gap-3">
          <div className="space-x-1.5">
            <span className="text-dark-secondary text-[10px]">pojmů</span>
            <span className="text-[12px]">{concepts}</span>
          </div>
          <div className="space-x-1.5">
            <span className="text-dark-secondary text-[10px]">
              aktualizováno
            </span>
            <span className="text-[12px]">
              {modified?.toLocaleDateString('CS')}
            </span>
          </div>
        </div>
        <div></div>
      </div>
    </Link>
  );
};
