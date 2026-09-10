import {
  CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import type { RelationshipKind } from '../model/diagram';

export type RelationshipChoice = { kind: RelationshipKind; swap?: boolean };

const VIEWPORT_MARGIN = 8;
const CHOOSER_OFFSET = 12;

const OPTIONS: {
  symbol: string;
  key: 'AB' | 'BA' | 'AParent' | 'BParent' | 'Equivalent';
  choice: RelationshipChoice;
}[] = [
  {
    symbol: 'A → B',
    key: 'AB',
    choice: { kind: 'obecny' },
  },
  {
    symbol: 'B → A',
    key: 'BA',
    choice: { kind: 'obecny', swap: true },
  },
  {
    symbol: 'A > B',
    key: 'AParent',
    choice: { kind: 'hierarchie' },
  },
  {
    symbol: 'B > A',
    key: 'BParent',
    choice: { kind: 'hierarchie', swap: true },
  },
  {
    symbol: 'A = B',
    key: 'Equivalent',
    choice: { kind: 'ekvivalence' },
  },
];

const Badge = ({ letter, solid }: { letter: string; solid?: boolean }) => (
  <span
    className={`inline-flex items-center justify-center w-6 h-6 rounded-sm font-bold text-sm shrink-0 ${
      solid ? 'bg-blue-primary text-white' : 'bg-blue-subtle text-blue-primary'
    }`}
  >
    {letter}
  </span>
);

export const RelationshipChooser = ({
  x,
  y,
  sourceLabel,
  targetLabel,
  onSelect,
  onClose,
  onRemove,
  selectedKind,
}: {
  x: number;
  y: number;
  sourceLabel: string;
  targetLabel: string;
  onSelect: (_choice: RelationshipChoice) => void;
  onClose: () => void;
  onRemove?: () => void;
  selectedKind?: RelationshipKind;
}) => {
  const t = useTranslations('DictionaryDiagram.RelationshipChooser');
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<CSSProperties>({
    left: x,
    top: y + CHOOSER_OFFSET,
    transform: 'translateX(-50%)',
  });

  const keepInsideViewport = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    const containingBlock = element.offsetParent?.getBoundingClientRect();
    if (!containingBlock) return;

    const { width, height } = element.getBoundingClientRect();
    const desiredLeft = containingBlock.left + x - width / 2;
    const desiredTop = containingBlock.top + y + CHOOSER_OFFSET;
    const maxLeft = Math.max(
      VIEWPORT_MARGIN,
      window.innerWidth - width - VIEWPORT_MARGIN,
    );
    const maxTop = Math.max(
      VIEWPORT_MARGIN,
      window.innerHeight - height - VIEWPORT_MARGIN,
    );

    setPosition({
      left:
        Math.min(Math.max(desiredLeft, VIEWPORT_MARGIN), maxLeft) -
        containingBlock.left,
      top:
        Math.min(Math.max(desiredTop, VIEWPORT_MARGIN), maxTop) -
        containingBlock.top,
    });
  }, [x, y]);

  useLayoutEffect(() => {
    keepInsideViewport();

    const observer = new ResizeObserver(keepInsideViewport);
    if (ref.current) observer.observe(ref.current);
    window.addEventListener('resize', keepInsideViewport);
    window.addEventListener('scroll', keepInsideViewport, true);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', keepInsideViewport);
      window.removeEventListener('scroll', keepInsideViewport, true);
    };
  }, [keepInsideViewport]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();

    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [onClose]);

  return (
    <div
      className="absolute z-10 w-[min(420px,calc(100vw-16px))] max-h-[calc(100dvh-16px)] overflow-y-auto bg-white rounded-lg border border-border-grey shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] p-4 flex flex-col gap-3"
      style={position}
      ref={ref}
    >
      <div className="flex items-center gap-2 font-bold border-b border-border-grey pb-3">
        {t.rich('Title', {
          a: () => <Badge letter="A" solid />,
          b: () => <Badge letter="B" />,
        })}
      </div>

      <div className="flex gap-6 text-blue-primary font-bold text-sm">
        <span className="flex items-start gap-2 flex-1">
          <Badge letter="A" solid /> {sourceLabel}
        </span>
        <span className="flex items-start gap-2 flex-1">
          <Badge letter="B" /> {targetLabel}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {OPTIONS.map((option) => {
          const selected =
            !option.choice.swap && option.choice.kind === selectedKind;
          return (
            <button
              key={option.symbol}
              onClick={() => onSelect(option.choice)}
              className={clsx(
                'flex items-center gap-4 border rounded-md py-2.5 px-4 text-left transition-colors',
                selected
                  ? 'border-blue-primary bg-blue-subtle'
                  : 'border-border-grey hover:bg-blue-subtle',
              )}
            >
              <span className="font-bold w-12 shrink-0">{option.symbol}</span>
              <span className="flex flex-col flex-1">
                <span className="font-bold text-sm">
                  {t(`Options.${option.key}.Title`)}
                </span>
                <span className="text-sm text-card-description">
                  {t(`Options.${option.key}.Description`)}
                </span>
              </span>
              {selected && (
                <GovIcon name="check2-circle" size="m" color="primary" />
              )}
            </button>
          );
        })}
      </div>

      {onRemove && (
        <div className="border-t border-border-grey pt-3">
          <button
            type="button"
            onClick={onRemove}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-status-error-600 px-4 py-2.5 font-bold text-status-error-600 transition-colors hover:bg-status-error-100"
          >
            <GovIcon name="trash" size="m" />
            {t('Remove')}
          </button>
        </div>
      )}
    </div>
  );
};
