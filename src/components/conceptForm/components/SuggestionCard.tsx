import { GovFormCheckbox } from '@gov-design-system-ce/react';

import { FormSection } from '@/components/conceptForm/components/FormSection';

type Props = {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
};

export const SuggestionCard = ({
  id,
  label,
  description,
  checked,
  onToggle,
}: Props) => (
  <FormSection
    icon={null}
    variant="primary"
    label={
      <button
        type="button"
        className="select-none flex items-center gap-2"
        onClick={onToggle}
      >
        <GovFormCheckbox
          id={id}
          checked={checked}
          size="s"
          aria-hidden="true"
          className="pointer-events-none"
        />
        {label}
      </button>
    }
  >
    <div className="px-2.5">{description}</div>
  </FormSection>
);
