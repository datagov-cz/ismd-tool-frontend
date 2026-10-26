import { GovIcon, GovMessage } from '@gov-design-system-ce/react';

type Props = {
  title: string;
  hint: string;
  reconnecting?: string;
};

export const AiProgress = ({ title, hint, reconnecting }: Props) => (
  <div aria-live="polite">
    <GovMessage
      color="primary"
      type="subtle"
      icon={
        <GovIcon
          type="components"
          name="loader"
          size="s"
          className="animate-spin motion-reduce:animate-none"
        />
      }
    >
      <div className="font-bold">{title}</div>
      <div className="text-sm text-muted">{hint}</div>
      {reconnecting ? (
        <div className="text-sm text-muted">{reconnecting}</div>
      ) : null}
    </GovMessage>
  </div>
);
