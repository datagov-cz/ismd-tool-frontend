import { GovFormCheckbox } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { FormSection } from '@/components/conceptForm/components/FormSection';

export type SuggestionItem = {
  key: string;
  label: string;
  description: string;
};

type Props = {
  id: string;
  label: string;
  description: string;
  properties: SuggestionItem[];
  relations: SuggestionItem[];
  checked: boolean;
  onToggle: () => void;
  selectedItems: string[];
  onToggleItem: (_key: string) => void;
};

export const DictionarySuggestionCard = ({
  id,
  label,
  description,
  properties,
  relations,
  checked,
  onToggle,
  selectedItems,
  onToggleItem,
}: Props) => {
  const t = useTranslations('CreateOntology.AiSuggestion');

  const branch =
    'relative pl-5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-border-subtlest after:absolute after:left-0 after:h-px after:w-4 after:bg-border-subtlest';

  const renderGroup = (title: string, items: SuggestionItem[]) => (
    <li
      className={clsx(
        branch,
        'pt-2 after:top-4.5 last:before:bottom-auto last:before:h-4.5',
      )}
    >
      <div className="text-sm font-bold text-blue-primary">{title}</div>
      <ul className="pl-2.5">
        {items.map((item) => (
          <li
            key={item.key}
            className={clsx(
              branch,
              'pt-2 after:top-5 last:before:bottom-auto last:before:h-5',
            )}
          >
            <button
              type="button"
              className="select-none flex items-center gap-2 text-sm font-bold text-blue-primary"
              onClick={() => onToggleItem(item.key)}
            >
              <GovFormCheckbox
                id={`${id}-${item.key}`}
                checked={selectedItems.includes(item.key)}
                size="s"
                aria-hidden="true"
                className="pointer-events-none"
              />
              {item.label}
            </button>
            <div className="pl-7 text-sm">{item.description}</div>
          </li>
        ))}
      </ul>
    </li>
  );

  return (
    <FormSection
      icon={null}
      variant="primary"
      label={
        <button
          type="button"
          className="select-none flex items-center gap-2"
          onClick={onToggle}
        >
          <GovFormCheckbox
            id={id}
            checked={checked}
            size="s"
            aria-hidden="true"
            className="pointer-events-none"
          />
          {label}
        </button>
      }
    >
      <div className="relative px-2.5 pl-7 before:absolute before:-top-3 before:-bottom-2 before:left-4.5 before:w-px before:bg-border-subtlest">
        {description}
      </div>
      <ul className="px-2.5 pl-4.5">
        {renderGroup(t('Properties'), properties)}
        {renderGroup(t('Relations'), relations)}
      </ul>
    </FormSection>
  );
};
