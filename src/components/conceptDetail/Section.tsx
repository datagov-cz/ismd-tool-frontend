import { ReactNode } from 'react';

export const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="border-b border-border-primary-subtle/20 pb-3 flex gap-2 last:border-0 pt-3 first:pt-0 last:pb-0">
    <span className="font-medium text-sm min-w-40 max-w-40">{title}</span>
    <div className="col-span-3 space-y-2 w-full">{children}</div>
  </div>
);
