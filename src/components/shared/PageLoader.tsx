import clsx from 'clsx';

import { CircularLoader } from './CircularLoader';

export const PageLoader = ({ className }: { className?: string }) => (
  <div
    className={clsx(
      'h-full w-full flex items-center justify-center',
      className,
    )}
  >
    <CircularLoader />
  </div>
);
