import { GovTooltip } from '@gov-design-system-ce/react';

export const ConditionalTooltip = ({
  active,
  message,
  children,
}: {
  active: boolean;
  message: string;
  children: React.ReactNode;
}) =>
  active && message ? (
    <GovTooltip position="bottom" className="border-0! mt-1" message={message}>
      {children}
    </GovTooltip>
  ) : (
    children
  );
