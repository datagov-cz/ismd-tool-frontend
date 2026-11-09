import { GovFormCheckbox, GovFormLabel } from '@gov-design-system-ce/react';

export const FilterCheckbox = ({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: (_checked: boolean) => void;
}) => {
  return (
    <GovFormCheckbox
      size="s"
      checked={checked}
      readOnly
      onClick={() => onToggle(!checked)}
      onTouchEnd={(event) => {
        event.preventDefault();
        onToggle(!checked);
      }}
    >
      <GovFormLabel slot="label">{label}</GovFormLabel>
    </GovFormCheckbox>
  );
};
