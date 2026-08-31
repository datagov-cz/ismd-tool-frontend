import { GovTooltip } from '@gov-design-system-ce/react';

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
    <GovTooltip placement="bottom">
      <GovTooltip.Trigger asChild>{children}</GovTooltip.Trigger>
      <GovTooltip.Content className="z-2000!">{message}</GovTooltip.Content>
    </GovTooltip>
  ) : (
    children
  );
};
