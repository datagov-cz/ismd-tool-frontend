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
        <span className="flex flex-col items-start text-left">
          <span className="text-xs text-(--text-subtle)">
            {data?.data?.displayLabel}
          </span>
          <span
            className="break-all"
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
