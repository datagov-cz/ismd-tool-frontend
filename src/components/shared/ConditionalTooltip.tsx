import { GovTooltip, GovTooltipContent } from '@gov-design-system-ce/react';

export const ConditionalTooltip = ({
  active,
  message,
  children,
}: {
  active: boolean;
  message: string;
  children: React.ReactNode;
}) => {
  return active && message ? (
    <GovTooltip position="bottom" className="border-0! mt-1" message={message}>
      <GovTooltipContent className="z-2000!">{message}</GovTooltipContent>
      {children}
    </GovTooltip>
  ) : (
    children
  );
};
