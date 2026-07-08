import { type FocusEvent, useState } from 'react';

import { Hint, resolveHintKey } from './conceptFormHints';

export function useFormHints(hints: Record<string, Hint>, defaultHint: Hint) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  const handleFocus = (e: FocusEvent<HTMLElement>) => {
    let el: HTMLElement | null = e.target as HTMLElement;
    while (el && el !== e.currentTarget) {
      const id = el.getAttribute('id');
      const name = el.getAttribute('name');
      const key =
        (id && resolveHintKey(id, hints)) ||
        (name && resolveHintKey(name, hints));

      if (key) {
        setActiveKey(key);
        return;
      }
      el = el.parentElement;
    }
  };

  const hint = (activeKey && hints[activeKey]) || defaultHint;

  return { hint, open, setOpen, handleFocus };
}
