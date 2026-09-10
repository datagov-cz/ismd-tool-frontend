import { GovIcon } from '@gov-design-system-ce/react';
import Link from 'next/link';

import { SearchResultDtoConceptType, SearchType } from '@/api/generated';

import { SearchHighlightMatch } from './SearchHighlightMatch';

export const SearchResultItem = ({
  type,
  isPublished,
  label,
  query,
  href,
  onClose,
  conceptType,
}: {
  type: SearchType;
  isPublished?: boolean;
  label: string;
  query: string;
  href: string;
  onClose?: () => void;
  conceptType?: SearchResultDtoConceptType;
}) => {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex gap-2.5 leading-snug line-clamp-3"
    >
      <GovIcon
        type="components"
        name={
          type === SearchType.DIAGRAM
            ? 'diagram-3'
            : type === SearchType.ONTOLOGY
              ? isPublished === false
                ? 'journals'
                : 'journal-text'
              : conceptType === 'VZTAH'
                ? 'bezier2'
                : conceptType === 'VLASTNOST'
                  ? 'tag'
                  : 'card-heading'
        }
        color={
          type === SearchType.DIAGRAM
            ? undefined
            : type === SearchType.ONTOLOGY
              ? isPublished === false
                ? 'secondary'
                : 'success'
              : 'primary'
        }
        size="s"
        className={
          type === SearchType.DIAGRAM ? 'mt-0.5! text-purple!' : 'mt-0.5!'
        }
      />
      <span className="text-sm text-blue text-left">
        {label && <SearchHighlightMatch label={label} query={query} />}
      </span>
    </Link>
  );
};
