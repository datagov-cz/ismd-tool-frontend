import { useEffect, useRef } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';

import type { RelationshipKind } from '../model/diagram';

export type RelationshipChoice = { kind: RelationshipKind; swap?: boolean };

const OPTIONS: {
  symbol: string;
  title: string;
  description: string;
  choice: RelationshipChoice;
}[] = [
  {
    symbol: 'A - B',
    title: 'Obecný vztah',
    description: 'Spojí pojmy. Potom přidej vztah na čáru.',
    choice: { kind: 'obecny' },
  },
  {
    symbol: 'A > B',
    title: 'A je nadřazené B',
    description: 'B je podtypem A',
    choice: { kind: 'hierarchie' },
  },
  {
    symbol: 'B > A',
    title: 'B je nadřazené A',
    description: 'A je podtypem B',
    choice: { kind: 'hierarchie', swap: true },
  },
  {
    symbol: 'A = B',
    title: 'Stejný význam',
    description: 'Oba pojmy označují totéž',
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
  selectedKind,
}: {
  x: number;
  y: number;
  sourceLabel: string;
  targetLabel: string;
  onSelect: (_choice: RelationshipChoice) => void;
  onClose: () => void;
  selectedKind?: RelationshipKind;
}) => {
  const ref = useRef<HTMLDivElement>(null);

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
      className="absolute z-10 w-[420px] -translate-x-1/2 bg-white rounded-lg border border-border-grey shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] p-4 flex flex-col gap-3"
      style={{ left: x, top: y + 12 }}
      ref={ref}
    >
      <div className="flex items-center gap-2 font-bold border-b border-border-grey pb-3">
        Vyberte typ vazby mezi <Badge letter="A" solid /> a <Badge letter="B" />
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
                <span className="font-bold text-sm">{option.title}</span>
                <span className="text-sm text-card-description">
                  {option.description}
                </span>
              </span>
              {selected && (
                <GovIcon name="check2-circle" size="m" color="primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
