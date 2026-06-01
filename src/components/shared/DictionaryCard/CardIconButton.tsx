import { GovIcon } from '@gov-design-system-ce/react';

export const CardIconButton = ({
  icon,
  onClick,
}: {
  icon: string;
  onClick: (_e: React.MouseEvent) => void;
}) => (
  <button
    className="size-6 flex items-center justify-center"
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      onClick(e);
    }}
  >
    <GovIcon
      type="components"
      color="primary"
      name={icon}
      size="s"
      className="transition-transform duration-200"
    />
  </button>
);
