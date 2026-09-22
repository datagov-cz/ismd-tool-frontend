import clsx from 'clsx';

import { FormSection } from '@/components/conceptForm/components/FormSection';
import {
  TreeItem,
  TreeList,
  TreeStem,
} from '@/components/dictionaryCreate/Tree';

type BarProps = {
  className?: string;
};

const SkeletonBar = ({ className }: BarProps) => (
  <span
    className={clsx(
      'block rounded bg-surface-skeleton animate-pulse motion-reduce:animate-none',
      className,
    )}
  />
);

const SkeletonCheckbox = () => (
  <span className="block size-4 rounded-sm border border-border-subtle bg-surface-subtlest" />
);

type ItemRowProps = {
  className?: string;
};

export const SuggestionItemRowSkeleton = ({ className }: ItemRowProps) => (
  <TreeItem className={clsx('pl-6', className)} aria-hidden="true">
    <div className="flex items-start gap-2">
      <span className="flex h-6 w-4 shrink-0 items-center">
        <SkeletonCheckbox />
      </span>
      <span className="flex h-6 flex-1 items-center">
        <SkeletonBar className="h-4 w-2/5" />
      </span>
    </div>
    <div className="pl-6 pt-1">
      <SkeletonBar className="h-3 w-3/5" />
    </div>
  </TreeItem>
);

type GroupProps = {
  headingClassName: string;
  rows: number;
};

const GroupSkeleton = ({ headingClassName, rows }: GroupProps) => (
  <TreeItem className="pl-8.5">
    <span className="flex h-6 items-center">
      <SkeletonBar className={clsx('h-4', headingClassName)} />
    </span>
    <TreeList rail="nested">
      {Array.from({ length: rows }, (_, index) => (
        <SuggestionItemRowSkeleton key={index} />
      ))}
    </TreeList>
  </TreeItem>
);

export const SuggestionCardSkeleton = () => (
  <div aria-hidden="true">
    <FormSection
      icon={null}
      variant="primary"
      label={
        <span className="flex items-start gap-2">
          <span className="relative w-4 shrink-0 self-stretch after:absolute after:left-[7px] after:top-6 after:bottom-0 after:w-px after:bg-border-subtle">
            <span className="flex h-7 items-center">
              <SkeletonCheckbox />
            </span>
          </span>
          <span className="flex h-7 flex-1 items-center">
            <SkeletonBar className="h-5 w-1/3" />
          </span>
        </span>
      }
    >
      <div>
        <TreeStem rail="root" className="pl-8.5 pr-2.5">
          <span className="flex h-6 items-center">
            <SkeletonBar className="h-3 w-3/4" />
          </span>
        </TreeStem>
        <TreeList rail="root" className="pr-2.5">
          <GroupSkeleton headingClassName="w-24" rows={2} />
          <GroupSkeleton headingClassName="w-16" rows={1} />
        </TreeList>
      </div>
    </FormSection>
  </div>
);
