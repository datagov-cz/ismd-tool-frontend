import { ComponentProps, useRef } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { flushSync } from 'react-dom';

import { useGetLawContent } from '@/api/generated';
import { ButtonInput } from '@/components/shared/ButtonInput';
import { LegislativeSourceDetailSkeleton } from '@/components/shared/LegislativeSourceInput/LegislativeSourceDetailSkeleton';
import {
  FragmentNode,
  LegislativeSourceFragmentNav,
} from '@/components/shared/LegislativeSourceInput/LegislativeSourceFragmentNav';
import { LegislativeSource } from '@/components/shared/LegislativeSourceInput/types';
import { useLawByIri } from '@/components/shared/LegislativeSourceInput/useLawByIri';
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

  const { data: lawByIri } = useLawByIri(selectedIri);

  const triggerLabel = selectedIri
    ? (lawByIri?.label ?? source.label)
    : source.label;

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
      <PopoverAnchor asChild>
        <div className="relative">
          <ButtonInput className="pr-12" onClick={() => onOpenChange?.(!open)}>
            <span className="flex flex-col items-start text-left">
              <span
                className={selectedIri ? 'text-xs text-(--text-subtle)' : ''}
              >
                {triggerLabel}
              </span>
              {selectedIri ? (
                <span className="break-all">{selectedIri}</span>
              ) : null}
            </span>
          </ButtonInput>
          <button
            type="button"
            data-action="clear"
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onClear();
            }}
          >
            <GovIcon
              type="components"
              name="x"
              slot="icon-start"
              size="2xl"
              color="primary"
            />
          </button>
        </div>
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
