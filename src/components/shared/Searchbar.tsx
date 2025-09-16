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
  onSearch: (query: string) => void;
  hasSearchIcon?: boolean;
  size?: 's' | 'm' | 'l';
}

export const Searchbar = ({
  placeholder,
  onSearch,
  hasSearchIcon,
  size = 'm',
}: Props) => {
  return (
    <GovFormControl className="w-full">
      <GovFormGroup>
        <GovFormSearch size={size}>
          <GovFormInput slot="input" placeholder={placeholder} size={size} />
          {hasSearchIcon && (
            <GovButton slot="button">
              <GovIcon name="search" slot="icon-start" />
            </GovButton>
          )}
        </GovFormSearch>
      </GovFormGroup>
    </GovFormControl>
  );
};
