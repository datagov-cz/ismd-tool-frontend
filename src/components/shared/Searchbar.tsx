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

type GovInputEventType = CustomEvent<{ value: string }>;

export const Searchbar = ({
  placeholder,
  hasSearchIcon,
  size = 'm',
  onChange,
}: Props) => {
  return (
    <GovFormControl className="w-full">
      <GovFormGroup>
        <GovFormSearch size={size}>
          <GovFormInput
            slot="input"
            placeholder={placeholder}
            size={size}
            onGovInput={(e: GovInputEventType) => {
              onChange?.(e.detail.value ?? '');
            }}
          />
          <GovButton slot="button" className={hasSearchIcon ? '' : 'hidden'}>
            <GovIcon name="search" slot="icon-start" />
          </GovButton>
        </GovFormSearch>
      </GovFormGroup>
    </GovFormControl>
  );
};
