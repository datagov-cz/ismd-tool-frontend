import clsx from 'clsx';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type Rail = 'root' | 'nested';

const railOffset: Record<Rail, string> = {
  root: '[--tree-x:17px]',
  nested: '[--tree-x:7px]',
};

const verticalLine =
  'before:absolute before:left-(--tree-x) before:w-px before:bg-border-subtle';

type TreeListProps = {
  rail: Rail;
  className?: string;
  children: ReactNode;
};

export const TreeList = ({ rail, className, children }: TreeListProps) => (
  <ul className={clsx(railOffset[rail], className)}>{children}</ul>
);

type TreeStemProps = {
  rail: Rail;
  className?: string;
  children?: ReactNode;
};

export const TreeStem = ({ rail, className, children }: TreeStemProps) => (
  <div
    className={clsx(
      railOffset[rail],
      verticalLine,
      'relative before:-top-3 before:bottom-0',
      className,
    )}
  >
    {children}
  </div>
);

export const TreeItem = ({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'li'>) => (
  <li
    {...props}
    className={clsx(
      verticalLine,
      'relative pt-2 before:top-0 before:bottom-0 last:before:bottom-auto last:before:h-[21px]',
      'after:absolute after:left-(--tree-x) after:top-5 after:h-px after:w-3 after:bg-border-subtle',
      className,
    )}
  >
    {children}
  </li>
);
