import { GovIcon } from '@gov-design-system-ce/react';

import { useResolveLegalSource } from '@/api/generated';
import { ButtonInput } from '@/components/shared/ButtonInput';
import { LegislativeSourceSelectedSkeleton } from '@/components/shared/LegislativeSourceInput/LegislativeSourceSelectedSkeleton';

type Props = {
  iri: string;
  onClear: () => void;
  onClick?: () => void;
};

export const LegislativeSourceSelected = ({ iri, onClear, onClick }: Props) => {
  const { data, isLoading } = useResolveLegalSource(
    { iri },
    { query: { enabled: !!iri } },
  );

  return (
    <div className="relative">
      <ButtonInput className="w-full gap-2" onClick={onClick}>
        <GovIcon
          type="components"
          name="book"
          size="m"
          color="primary"
          className="shrink-0"
        />
        <span className="flex w-full min-w-0 flex-col items-start text-left pr-8">
          {isLoading ? (
            <LegislativeSourceSelectedSkeleton />
          ) : (
            <>
              <span className="block h-4 w-full truncate text-xs leading-4 text-(--text-subtle)">
                {data?.data?.displayLabel}
              </span>
              <span
                className="block h-5 w-full text-xs font-semibold truncate leading-5"
                dangerouslySetInnerHTML={{
                  __html: data?.data?.fragmentBody ?? '',
                }}
              />
            </>
          )}
        </span>
      </ButtonInput>
      <button
        type="button"
        data-action="clear"
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClear();
        }}
      >
        <GovIcon type="components" name="x" size="2xl" color="primary" />
      </button>
    </div>
  );
};
