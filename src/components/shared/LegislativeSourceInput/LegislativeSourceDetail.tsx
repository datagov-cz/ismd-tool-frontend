import { ComponentProps, useRef } from 'react';
import { flushSync } from 'react-dom';

import { useGetLawContent } from '@/api/generated';
import { LegislativeSourceDetailSkeleton } from '@/components/shared/LegislativeSourceInput/LegislativeSourceDetailSkeleton';
import {
  FragmentNode,
  LegislativeSourceFragmentNav,
} from '@/components/shared/LegislativeSourceInput/LegislativeSourceFragmentNav';
import { LegislativeSourceSelected } from '@/components/shared/LegislativeSourceInput/LegislativeSourceSelected';
import { LegislativeSourceUnselected } from '@/components/shared/LegislativeSourceInput/LegislativeSourceUnselected';
import { LegislativeSource } from '@/components/shared/LegislativeSourceInput/types';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/shared/Popover';

type Props = {
  source: LegislativeSource;
  open: ComponentProps<typeof Popover>['open'];
  onOpenChange: ComponentProps<typeof Popover>['onOpenChange'];
  onClear: () => void;
  selectedIri: string | null;
  onSelectIri: (_iri: string) => void;
};

export const LegislativeSourceDetail = ({
  open,
  onOpenChange,
  source,
  onClear,
  selectedIri,
  onSelectIri,
}: Props) => {
  const { data, isLoading } = useGetLawContent({
    law: `${source.cislo}/${source.rok}`,
  });

  const contentRef = useRef<HTMLDivElement>(null);

  const bodyHtml = data?.data?.bodyHtml;
  const fragments = data?.data?.fragments as FragmentNode[] | undefined;

  const handleSelect = (iri: string) => {
    flushSync(() => {
      onSelectIri(iri);
    });

    contentRef.current
      ?.querySelector(`[data-iri="${iri}"]`)
      ?.scrollIntoView({ block: 'start' });
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor>
        {selectedIri ? (
          <LegislativeSourceSelected
            iri={selectedIri}
            onClick={() => onOpenChange?.(!open)}
            onClear={onClear}
          />
        ) : (
          <LegislativeSourceUnselected
            label={source.label}
            onClick={() => onOpenChange?.(!open)}
          />
        )}
      </PopoverAnchor>
      <PopoverContent
        side="bottom"
        avoidCollisions={false}
        align="start"
        sideOffset={0}
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        className="bg-white p-4 border border-(--border-subtle) max-h-(--radix-popover-content-available-height) overflow-hidden flex flex-col"
        onInteractOutside={(e) => {
          const target = e.detail.originalEvent.target as HTMLElement | null;
          if (target?.closest('[data-action="clear"]')) {
            e.preventDefault();
          }
        }}
      >
        {selectedIri ? (
          <style>{`.law-content [data-iri="${selectedIri}"]{background-color:var(--law-selected-bg);}`}</style>
        ) : null}
        {isLoading ? <LegislativeSourceDetailSkeleton /> : null}
        {data?.errorCode ? <p>Error: {data.errorCode}</p> : null}
        {data?.data ? (
          <div className="grid grid-cols-3 grid-rows-1 gap-4 flex-1 min-h-0">
            <div className="min-h-0 overflow-y-auto text-sm">
              <LegislativeSourceFragmentNav
                fragments={fragments}
                selectedIri={selectedIri}
                onSelect={handleSelect}
              />
            </div>
            <div
              ref={contentRef}
              className="law-content min-h-0 overflow-y-auto col-span-2"
              dangerouslySetInnerHTML={{ __html: bodyHtml ?? '' }}
            />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};
