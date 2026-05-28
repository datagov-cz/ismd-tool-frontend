import {
  GovFormControl,
  GovFormGroup,
  GovFormInput,
  GovFormSearch,
  GovIcon,
} from '@gov-design-system-ce/react';

interface Props {
  placeholder: string;
  hasSearchIcon?: boolean;
  size?: 's' | 'm' | 'l';
  onChange?: (_value: string) => void;
}

type GovInputEventType = CustomEvent<{ value: string }>;

export const Searchbar = ({ placeholder, size = 'm', onChange }: Props) => {
  return (
    <GovFormControl>
      <GovFormGroup>
        <GovFormSearch size={size}>
          <GovFormInput
            slot="input"
            size="s"
            placeholder={placeholder}
            onGovInput={(e: GovInputEventType) => {
              onChange?.(e.detail.value ?? '');
            }}
          >
            <GovIcon name="search" slot="icon-start" type="components" />
          </GovFormInput>
        </GovFormSearch>
      </GovFormGroup>
    </GovFormControl>
  );
};
