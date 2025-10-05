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
}

export const Searchbar = ({
  placeholder,
  hasSearchIcon,
  size = 'm',
}: Props) => {
  return (
    <GovFormControl className="w-full">
      <GovFormGroup onChange={() => console.log('asdad')}>
        <GovFormSearch size={size} onChange={(e) => console.log(e.target)}>
          <GovFormInput slot="input" placeholder={placeholder} size={size} />
          <GovButton slot="button" className={hasSearchIcon ? '' : 'hidden'}>
            <GovIcon name="search" slot="icon-start" />
          </GovButton>
        </GovFormSearch>
      </GovFormGroup>
    </GovFormControl>
  );
};
