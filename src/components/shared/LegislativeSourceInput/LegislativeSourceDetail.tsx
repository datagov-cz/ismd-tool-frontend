import { ComponentProps, useRef, useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useGetLawContent } from '@/api/generated';
import { LegislativeSourceAutocomplete } from '@/components/shared/LegislativeSourceInput/LegislativeSourceAutocomplete';
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
  const t = useTranslations('LegislativeSource');
  const { data, isLoading } = useGetLawContent({
    law: `${source.cislo}/${source.rok}`,
  });

  const contentRef = useRef<HTMLDivElement>(null);
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
    void document.fonts.ready.then(scrollToFragment);
  };

  const handleConfirmSelection = () => {
    if (draftIri) {
      onSelectIri(draftIri);
      onOpenChange?.(false);
    }
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
          <div className="cursor-pointer" onClick={() => onOpenChange?.(!open)}>
            <div className="pointer-events-none">
              <LegislativeSourceAutocomplete
                placeholder={source.label}
                onSourceSelect={() => {}}
              />
            </div>
          </div>
        )}
      </PopoverAnchor>
      <PopoverContent
        side="bottom"
        avoidCollisions={false}
        align="start"
        sideOffset={0}
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        className="bg-white p-4 border border-(--border-subtle) max-h-96 overflow-hidden flex flex-col"
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
            <div className="law-content min-h-0 overflow-y-auto col-span-2">
              <div
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: bodyHtml ?? '' }}
              />
              {draftIri && (
                <div className="sticky text-center bottom-0 bg-white pt-2 border-t border-primary-subtlest">
                  <GovButton
                    type="solid"
                    color="primary"
                    size="s"
                    onGovClick={handleConfirmSelection}
                  >
                    <GovIcon
                      name="check-square"
                      type="components"
                      slot="icon-start"
                    />
                    {t('SelectFragment')}
                  </GovButton>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};
