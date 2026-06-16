import { ComponentProps, MouseEvent } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';

import { useGetLawContent } from '@/api/generated';
import { ButtonInput } from '@/components/shared/ButtonInput';
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
  const { data } = useGetLawContent({ law: `${source.cislo}/${source.rok}` });

  const handleBodyClick = (e: MouseEvent<HTMLDivElement>) => {
    const par = (e.target as HTMLElement).closest('[data-kind="par"]');
    if (par) {
      console.log(par.getAttribute('data-eli'));
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <ButtonInput onClick={() => onOpenChange?.(!open)}>
          {source.label}
          <GovIcon
            size="s"
            name="plus"
            color="primary"
            type="components"
            data-action="clear"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onClear();
            }}
          />
        </ButtonInput>
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
        {data?.errorCode ? <p>Error: {data.errorCode}</p> : null}
        {data?.data ? (
          <div className="grid grid-cols-3 grid-rows-1 gap-4 flex-1 min-h-0">
            <div className="min-h-0 overflow-y-auto">
              {data.data.fragments?.map((fragment) => (
                <div
                  key={fragment.iri}
                  dangerouslySetInnerHTML={{ __html: fragment.bodyHtml ?? '' }}
                />
              ))}
            </div>
            <div
              className="law-content min-h-0 overflow-y-auto col-span-2"
              onClick={handleBodyClick}
              dangerouslySetInnerHTML={{ __html: data.data.bodyHtml ?? '' }}
            />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};
