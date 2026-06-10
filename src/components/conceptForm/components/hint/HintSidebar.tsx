import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import {
  conceptFormHints,
  defaultHint,
  defaultHintEdit,
} from './conceptFormHints';

interface HintSidebarProps {
  activeKey: string | null;
  onClose: () => void;
  className?: string;
  editing?: boolean;
}

export const HintSidebar = ({
  activeKey,
  onClose,
  className,
  editing,
}: HintSidebarProps) => {
  const t = useTranslations('ConceptEditWrapper');
  const hint =
    (activeKey && conceptFormHints[activeKey]) ||
    (editing ? defaultHintEdit : defaultHint);

  return (
    <aside
      className={clsx(
        `rounded-lg bg-white text-sm shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3)]`,
        className,
      )}
    >
      <div className="flex items-center justify-between py-2 px-3 bg-blue-subtle overflow-hidden rounded-t-lg">
        <span className="flex items-center gap-2 font-medium">
          <GovIcon type="components" name="question-circle" />
          {t('HintHeader')}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít nápovědu"
          className="text-muted-foreground hover:text-foreground flex items-center"
        >
          <GovIcon type="components" name="x-lg" />
        </button>
      </div>

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
    </aside>
  );
};
