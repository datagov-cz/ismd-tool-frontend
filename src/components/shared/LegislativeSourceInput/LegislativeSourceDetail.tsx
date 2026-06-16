import { ComponentProps, useRef, useState } from 'react';
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
};

export const LegislativeSourceDetail = ({
  open,
  onOpenChange,
  source,
  onClear,
}: Props) => {
  const { data, isLoading } = useGetLawContent({
    law: `${source.cislo}/${source.rok}`,
  });

  const [selectedEli, setSelectedEli] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const bodyHtml = data?.data?.bodyHtml;

  const handleSelect = (eli: string) => {
    flushSync(() => {
      setSelectedEli(eli);
    });

    contentRef.current
      ?.querySelector(`[data-eli="${eli}"]`)
      ?.scrollIntoView({ block: 'start' });
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <div className="relative">
          <ButtonInput className="pr-12" onClick={() => onOpenChange?.(!open)}>
            {source.label}
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
        {selectedEli ? (
          <style>{`.law-content [data-eli="${selectedEli}"]{background-color:var(--law-selected-bg);}`}</style>
        ) : null}
        {isLoading ? <LegislativeSourceDetailSkeleton /> : null}
        {data?.errorCode ? <p>Error: {data.errorCode}</p> : null}
        {data?.data ? (
          <div className="grid grid-cols-3 grid-rows-1 gap-4 flex-1 min-h-0">
            <div className="min-h-0 overflow-y-auto text-sm">
              <LegislativeSourceFragmentNav
                fragments={data.data.fragments as FragmentNode[] | undefined}
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
