import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';

import { FragmentDto } from '@/api/generated';

// The API returns fragments as a recursive tree, but the generated FragmentDto
// type omits the `children` field — re-add it here.
export type FragmentNode = FragmentDto & {
  children?: FragmentNode[];
};

type Props = {
  fragments: FragmentNode[] | undefined;
  onSelect: (_eli: string) => void;
  depth?: number;
};

export const LegislativeSourceFragmentNav = ({
  fragments,
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
          onSelect={onSelect}
          depth={depth}
        />
      ))}
  </ul>
);

const FragmentItem = ({
  fragment,
  onSelect,
  depth,
}: {
  fragment: FragmentNode;
  onSelect: (_eli: string) => void;
  depth: number;
}) => {
  const [open, setOpen] = useState(false);
  const hasChildren = (fragment.children?.length ?? 0) > 0;

  return (
    <li>
      <div
        className="flex items-start gap-2 py-1.5 border-b border-(--border-subtle)"
        style={{ paddingLeft: depth * 12 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? 'Sbalit' : 'Rozbalit'}
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
          className="cursor-pointer leading-5 font-semibold not-italic hover:bg-blue-100 [&_var]:not-italic [&_var]:font-semibold"
          onClick={() => onSelect(fragment.eliPath ?? '')}
          dangerouslySetInnerHTML={{ __html: fragment.bodyHtml ?? '' }}
        />
      </div>
      {hasChildren && open ? (
        <LegislativeSourceFragmentNav
          fragments={fragment.children}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ) : null}
    </li>
  );
};
