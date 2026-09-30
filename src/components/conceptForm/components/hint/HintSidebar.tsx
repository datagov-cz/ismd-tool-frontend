import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { Hint } from './conceptFormHints';

interface HintSidebarProps {
  hint: Hint;
  onToggle: () => void;
  className?: string;
  open: boolean;
}

export const HintSidebar = ({
  hint,
  onToggle,
  className,
  open,
}: HintSidebarProps) => {
  const t = useTranslations('ConceptEditWrapper');

  return (
    <aside
      className={clsx(`rounded-lg bg-surface text-sm shadow-raised`, className)}
    >
      <div className="flex items-center justify-between py-2 px-3 bg-blue-subtle overflow-hidden rounded-t-lg">
        <span className="flex items-center gap-2 font-medium">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center"
          >
            <GovIcon type="components" name="question-circle" />
          </button>
          {open && t('HintHeader')}
        </span>
        {open && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Zavřít nápovědu"
            className="text-muted-foreground hover:text-foreground flex items-center"
          >
            <GovIcon type="components" name="x-lg" />
          </button>
        )}
      </div>

      {open && (
        <div className="p-3">
          <h3 className="mb-1 font-semibold">{hint.title}</h3>
          <p className="text-muted-foreground">{hint.body}</p>

          {hint.recommendation && (
            <div className="mt-3">
              <p className="font-semibold">{t('Suggestion')}:</p>
              <p className="text-muted-foreground">{hint.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
