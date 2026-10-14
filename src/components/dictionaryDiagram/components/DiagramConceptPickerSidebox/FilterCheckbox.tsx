import { ComponentRef, useEffect, useRef } from 'react';
import { GovFormCheckbox, GovFormLabel } from '@gov-design-system-ce/react';

type GovCheckboxElement = ComponentRef<typeof GovFormCheckbox> & {
  checked?: boolean;
};

export const FilterCheckbox = ({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: (_checked: boolean) => void;
}) => {
  const ref = useRef<GovCheckboxElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handler = () => onToggle(Boolean(el.checked));
    el.addEventListener('gov-change', handler);
    el.addEventListener('change', handler);
    return () => {
      el.removeEventListener('gov-change', handler);
      el.removeEventListener('change', handler);
    };
  }, [onToggle]);

  return (
    <GovFormCheckbox ref={ref} size="s" checked={checked}>
      <GovFormLabel slot="label">{label}</GovFormLabel>
    </GovFormCheckbox>
  );
};
