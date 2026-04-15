'use client';

import {
  GovFormGroup,
  GovFormInput,
  GovIcon,
} from '@gov-design-system-ce/react';

import { SearchTypesPopover } from './SearchTypesPopover';

export const SearchInput = () => {
  // const [searchTypes, setSearchTypes] = useState<SearchType[]>([]);
  return (
    <div className="w-full max-w-150">
      <GovFormGroup className="relative">
        <GovFormInput
          placeholder="Hledat veřejné pojmy nebo slovníky…"
          size="l"
        >
          <GovIcon
            type="components"
            color="neutral"
            name="search"
            slot="icon-start"
            size="s"
            className="transition-transform duration-200"
          />
        </GovFormInput>
        <SearchTypesPopover />
      </GovFormGroup>
    </div>
  );
};

// export const SearchPopoverResults = () => {};
