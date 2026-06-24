import { ComponentProps, useRef, useState } from 'react';

import { useGetLawContent } from '@/api/generated';
import { ButtonInput } from '@/components/shared/ButtonInput';
import { LegislativeSourceDetailSkeleton } from '@/components/shared/LegislativeSourceInput/LegislativeSourceDetailSkeleton';
import {
  FragmentNode,
  LegislativeSourceFragmentNav,
} from '@/components/shared/LegislativeSourceInput/LegislativeSourceFragmentNav';
import { LegislativeSourceSelected } from '@/components/shared/LegislativeSourceInput/LegislativeSourceSelected';
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
  // Pending selection while the popover is open. We commit it to the form only
  // on close, so browsing fragments doesn't repeatedly fire onChange (and the
  // anchor resize / refetch / popover reposition churn that came with it).
  const [draftIri, setDraftIri] = useState<string | null>(selectedIri);

  const bodyHtml = data?.data?.bodyHtml;
  const fragments = data?.data?.fragments as FragmentNode[] | undefined;

  const handleSelect = (iri: string) => {
    setDraftIri(iri);

    const scrollToFragment = () =>
      contentRef.current
        ?.querySelector(`[data-iri="${iri}"]`)
        ?.scrollIntoView({ block: 'start' });

    scrollToFragment();
    // Re-assert once Roboto has swapped in: the font change shifts line heights,
    // which otherwise drifts the target down proportionally to its depth.
    void document.fonts.ready.then(scrollToFragment);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      // Start each browse session from the currently committed value.
      setDraftIri(selectedIri);
    } else if (draftIri && draftIri !== selectedIri) {
      // Commit the browsed selection once, on close.
      onSelectIri(draftIri);
    }
    onOpenChange?.(next);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor>
        {selectedIri ? (
          <LegislativeSourceSelected
            iri={selectedIri}
            onClick={() => handleOpenChange(!open)}
            onClear={onClear}
          />
        ) : (
          <ButtonInput onClick={() => handleOpenChange(!open)}>
            {source.label}
          </ButtonInput>
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
        {draftIri ? (
          <style>{`.law-content [data-iri="${draftIri}"]{background-color:var(--law-selected-bg);}`}</style>
        ) : null}
        {isLoading ? <LegislativeSourceDetailSkeleton /> : null}
        {data?.errorCode ? <p>Error: {data.errorCode}</p> : null}
        {data?.data ? (
          <div className="grid grid-cols-3 grid-rows-1 gap-4 flex-1 min-h-0">
            <div className="min-h-0 overflow-y-auto text-sm">
              <LegislativeSourceFragmentNav
                fragments={fragments}
                selectedIri={draftIri}
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
