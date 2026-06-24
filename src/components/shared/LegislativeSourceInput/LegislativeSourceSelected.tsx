import { GovIcon } from '@gov-design-system-ce/react';

import { useResolveLegalSource } from '@/api/generated';
import { ButtonInput } from '@/components/shared/ButtonInput';

type Props = {
  iri: string;
  onClear: () => void;
  onClick?: () => void;
};

export const LegislativeSourceSelected = ({ iri, onClear, onClick }: Props) => {
  const { data } = useResolveLegalSource(
    { iri },
    { query: { enabled: !!iri } },
  );

  return (
    <div className="flex items-center gap-2">
      <ButtonInput className="flex-1 min-w-0" onClick={onClick}>
        <span className="flex w-full min-w-0 flex-col items-start text-left">
          <span className="block h-4 w-full truncate text-xs leading-4 text-(--text-subtle)">
            {data?.data?.displayLabel}
          </span>
          <span
            className="block h-5 w-full truncate leading-5"
            dangerouslySetInnerHTML={{
              __html: data?.data?.fragmentBodyHtml ?? '',
            }}
          />
        </span>
      </ButtonInput>
      <button
        type="button"
        data-action="clear"
        className="shrink-0 cursor-pointer flex items-center"
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
  );
};
