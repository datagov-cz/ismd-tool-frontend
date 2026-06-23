import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { FragmentDto } from '@/api/generated';

export type FragmentNode = FragmentDto & {
  children?: FragmentNode[];
};

type Props = {
  fragments: FragmentNode[] | undefined;
  selectedIri: string | null;
  onSelect: (_iri: string) => void;
  depth?: number;
};

export const LegislativeSourceFragmentNav = ({
  fragments,
  selectedIri,
  onSelect,
  depth = 0,
}: Props) => (
  <ul>
    {fragments
      ?.filter((fragment) => fragment.kind !== 'ppc')
      .map((fragment) => (
        <FragmentItem
          key={fragment.iri}
          fragment={fragment}
          selectedIri={selectedIri}
          onSelect={onSelect}
          depth={depth}
        />
      ))}
  </ul>
);

const FragmentItem = ({
  fragment,
  selectedIri,
  onSelect,
  depth,
}: {
  fragment: FragmentNode;
  selectedIri: string | null;
  onSelect: (_iri: string) => void;
  depth: number;
}) => {
  const t = useTranslations('LegislativeSource');
  const [open, setOpen] = useState(false);
  const hasChildren = (fragment.children?.length ?? 0) > 0;
  const isSelected = fragment.iri === selectedIri;

  return (
    <li>
      <div
        className={`flex items-start gap-2 py-1.5 pr-2 border-b border-(--border-subtle) cursor-pointer hover:bg-blue-100 ${
          isSelected ? 'bg-blue-200' : ''
        }`}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={() => onSelect(fragment.iri ?? '')}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            aria-label={open ? t('Collapse') : t('Expand')}
            aria-expanded={open}
            className="shrink-0 flex items-center justify-center w-4 h-4 rounded-xs border border-border-primary text-xs"
          >
            <GovIcon
              name={open ? 'dash-lg' : 'plus'}
              type="components"
              size="xs"
              color="primary"
              className="text-[0.625rem]"
            />
          </button>
        ) : (
          <span className="shrink-0 w-4" aria-hidden />
        )}
        <span
          className="leading-5 font-semibold not-italic [&_var]:not-italic [&_var]:font-semibold"
          dangerouslySetInnerHTML={{ __html: fragment.bodyHtml ?? '' }}
        />
      </div>
      {hasChildren && open ? (
        <LegislativeSourceFragmentNav
          fragments={fragment.children}
          selectedIri={selectedIri}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ) : null}
    </li>
  );
};
