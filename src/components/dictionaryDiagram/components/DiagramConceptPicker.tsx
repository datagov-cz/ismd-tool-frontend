import { useMemo, useState } from 'react';
import {
  // GovFormCheckbox,
  GovFormGroup,
  GovFormInput,
  // GovFormLabel,
  GovIcon,
  GovTabs,
  GovTabsItem,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';

import {
  type Concept,
  // type ConceptKind,
  getConceptId,
  getConceptKind,
  KIND_ICON,
  KIND_LABEL,
} from '../model/concept';
import { onConceptDragStart } from '../model/conceptDrag';

export const DiagramConceptPicker = ({
  concepts,
  activeConceptIds,
}: {
  concepts: Concept[];
  activeConceptIds: Set<string>;
}) => {
  const [search, setSearch] = useState('');
  // const [kinds, setKinds] = useState<Record<ConceptKind, boolean>>({
  //   trida: false,
  //   vlastnost: false,
  //   vztah: false,
  // });

  // const toggleKind = (kind: ConceptKind) =>
  //   setKinds((prev) => ({ ...prev, [kind]: !prev[kind] }));

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    // const noKindFilter = !kinds.trida && !kinds.vlastnost && !kinds.vztah;

    return concepts.filter((concept) => {
      const matchesName =
        !query || !!concept.název?.cs?.toLowerCase().includes(query);
      // const matchesKind = noKindFilter || kinds[getConceptKind(concept)];
      // return matchesName && matchesKind;
      return matchesName;
    });
  }, [concepts, search]);

  return (
    <div className="flex-300 bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] rounded-md py-2 px-4">
      <GovTabs>
        <GovTabsItem label={`Tento slovník [${concepts.length}]`}>
          <GovFormGroup>
            <GovFormInput
              placeholder="Hledat pojem v tomto slovníku"
              size="s"
              value={search}
              onGovInput={(e) => setSearch(e.detail.value)}
            >
              <GovIcon name="search" size="s" slot="icon-start" />
            </GovFormInput>
          </GovFormGroup>
          {/* 
          <div className="flex gap-4 pt-2">
            <FilterCheckbox
              label="Třídy"
              checked={kinds.trida}
              onToggle={() => toggleKind('trida')}
            />
            <FilterCheckbox
              label="Vlastnosti"
              checked={kinds.vlastnost}
              onToggle={() => toggleKind('vlastnost')}
            />
            <FilterCheckbox
              label="Vztahy"
              checked={kinds.vztah}
              onToggle={() => toggleKind('vztah')}
            />
          </div> */}

          <div className="flex flex-col gap-1.5 pt-2 overflow-y-auto max-h-[calc(100vh-300px)] pr-1">
            {filtered.map((item, index) => (
              <DiagramPickerConcept
                key={`${getConceptId(item)}-${index}`}
                concept={item}
                active={activeConceptIds.has(getConceptId(item))}
              />
            ))}

            {filtered.length === 0 && (
              <span className="text-xs text-card-description py-2">
                Žádný pojem neodpovídá filtru.
              </span>
            )}
          </div>
        </GovTabsItem>
        <GovTabsItem label={`Jiné slovníky`}></GovTabsItem>
      </GovTabs>
    </div>
  );
};

// const FilterCheckbox = ({
//   label,
//   checked,
//   onToggle,
// }: {
//   label: string;
//   checked: boolean;
//   onToggle: (_checked: boolean) => void;
// }) => {
//   const ref = useRef<any>(null);

//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;

//     const handler = () => onToggle(Boolean(el.checked));
//     el.addEventListener('gov-change', handler);
//     el.addEventListener('change', handler);
//     return () => {
//       el.removeEventListener('gov-change', handler);
//       el.removeEventListener('change', handler);
//     };
//   }, [onToggle]);

//   return (
//     <GovFormCheckbox ref={ref} size="s" checked={checked}>
//       <GovFormLabel slot="label">{label}</GovFormLabel>
//     </GovFormCheckbox>
//   );
// };

export const DiagramPickerConcept = ({
  concept,
  active,
}: {
  concept: Concept;
  active?: boolean;
}) => {
  const kind = getConceptKind(concept);

  // Třída places a node (once it's there, can't place again).
  // Vlastnost can always be (re)assigned to a Třída node.
  // Vztah has no drop target yet.
  const draggable =
    kind === 'vlastnost' ? true : kind === 'trida' ? !active : false;

  return (
    <div
      draggable={draggable}
      onDragStart={
        draggable ? (e) => onConceptDragStart(e, concept) : undefined
      }
      className={clsx(
        'border rounded-sm py-1.5 px-2 flex justify-between items-center',
        draggable && 'cursor-grab active:cursor-grabbing',
        !active && !draggable && 'opacity-60',
        active
          ? 'bg-status-success-100 border-status-success-200'
          : 'border-border-grey bg-white',
      )}
    >
      <div className="flex items-center gap-1.5">
        <GovIcon name={KIND_ICON[kind]} size="m" color="primary" />
        <div className="flex flex-col gap-0.5">
          <span className="text-dark-blue-subtle font-medium text-sm leading-none">
            {concept.název?.cs}
          </span>
          <span className="text-xs font-medium text-card-description leading-none">
            {KIND_LABEL[kind]}
          </span>
        </div>
      </div>
      {active ? (
        <GovIcon name="check2-circle" size="l" color="success" />
      ) : draggable ? (
        <GovIcon name="arrows-move" size="l" color="primary" />
      ) : null}
    </div>
  );
};
