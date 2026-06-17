import { GovIcon } from '@gov-design-system-ce/react';

import { ButtonInput } from '@/components/shared/ButtonInput';
import { useLawByIri } from '@/components/shared/LegislativeSourceInput/useLawByIri';

type Props = {
  iri: string;
  onClear: () => void;
};

// Renders a selected legislative source from its IRI alone (the persisted source
// of truth). The label is resolved via a fetch-by-IRI (mocked for now) so this
// works even after a form reload, when no react state about the chosen law
// exists anymore.
export const LegislativeSourceSelected = ({ iri, onClear }: Props) => {
  const { data } = useLawByIri(iri);

  return (
    <div className="relative">
      <ButtonInput className="pr-12">
        <span className="flex flex-col items-start text-left">
          <span className="text-xs text-(--text-subtle)">{data?.label}</span>
          <span className="break-all">{iri}</span>
        </span>
      </ButtonInput>
      <button
        type="button"
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
  );
};
