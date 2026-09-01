import {
  GovButton,
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

export const Searchbar = ({ placeholder, size = 'm', onChange }: Props) => {
  return (
    <GovFormControl size="m">
      <GovFormGroup>
        <GovFormSearch
          size={size}
          button={
            <GovButton type="solid" color="primary" size={size}>
              <GovIcon name="search" type="components" />
            </GovButton>
          }
        >
          <GovFormInput
            identifier="searchbar-input"
            size="s"
            placeholder={placeholder}
            onChange={(e) => {
              onChange?.(e.currentTarget.value ?? '');
            }}
            iconStart={<GovIcon name="search" type="components" />}
          />
        </GovFormSearch>
      </GovFormGroup>
    </GovFormControl>
  );
};
