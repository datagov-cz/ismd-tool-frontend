import {
  GovButton,
  GovDialog,
  GovDropdown,
  GovIcon,
} from '@gov-design-system-ce/react';
import { isAxiosError } from 'axios';

import { MaterializeOnConflict } from '@/api/generated';

import {
  Concept,
  getConceptIri,
  getConceptKind,
  getDefinicniObor,
} from './model/concept';
import { getNadrazenaTrida, getOborHodnot } from './model/diagram';

type PendingEdit = {
  baseUpdatedAt?: string | null;
  broaderConcept?: string[] | null;
  convertToHierarchy?: unknown;
  domain?: string | null;
  exactMatch?: string[] | null;
  range?: string | null;
};

type ConflictingDiagram = {
  diagramId: number;
  diagramName?: string | null;
  pendingEdit?: PendingEdit;
};

export type MaterializationConflict = {
  conceptIri: string;
  label?: Record<string, string>;
  mine?: PendingEdit;
  theirs?: ConflictingDiagram[];
};

type ConflictResponse = {
  data?: { conflicts?: MaterializationConflict[] };
  errorCode?: string;
  message?: string;
  success?: boolean;
};

export const getMaterializationConflicts = (
  value: unknown,
): MaterializationConflict[] | undefined => {
  const body = isAxiosError(value) ? value.response?.data : value;

  if (
    !body ||
    typeof body !== 'object' ||
    !('errorCode' in body) ||
    (body as ConflictResponse).errorCode !== 'DIAGRAM_EDIT_CONFLICT'
  ) {
    return undefined;
  }

  const conflicts = (body as ConflictResponse).data?.conflicts;
  return Array.isArray(conflicts) ? conflicts : undefined;
};

type ComparableField = Exclude<keyof PendingEdit, 'baseUpdatedAt'>;

const valuesEqual = (left: unknown, right: unknown) =>
  JSON.stringify(left ?? null) === JSON.stringify(right ?? null);

const conceptName = (iri: string | undefined, concepts: Concept[]) => {
  if (!iri) return 'neurčený pojem';

  const concept = concepts.find((item) => getConceptIri(item) === iri);
  const metadataLabel =
    concept?.metadata && 'label' in concept.metadata
      ? concept.metadata.label
      : undefined;
  return (
    concept?.název?.cs ??
    metadataLabel ??
    decodeURIComponent(iri.split('/').pop() ?? iri).replaceAll('-', ' ')
  );
};

const conceptNames = (iris: string[], concepts: Concept[]) =>
  iris.length > 0
    ? `„${iris.map((iri) => conceptName(iri, concepts)).join('“, „')}“`
    : 'žádné';

const describeDifferences = (
  edit: PendingEdit | undefined,
  comparisons: Array<PendingEdit | undefined>,
  conceptIri: string,
  concepts: Concept[],
): string[] => {
  const concept = concepts.find((item) => getConceptIri(item) === conceptIri);
  const differs = (...fields: ComparableField[]) =>
    fields.some((field) =>
      comparisons.some(
        (comparison) => !valuesEqual(edit?.[field], comparison?.[field]),
      ),
    );
  const descriptions: string[] = [];

  if (differs('domain', 'range')) {
    const domain = edit?.domain ?? (concept && getDefinicniObor(concept));
    if (concept && getConceptKind(concept) === 'vlastnost') {
      descriptions.push(
        `Vlastnost bude zařazena pod pojem „${conceptName(domain, concepts)}“.`,
      );
    } else {
      const range = edit?.range ?? (concept && getOborHodnot(concept));
      descriptions.push(
        `Vztah povede z pojmu „${conceptName(domain, concepts)}“ na pojem „${conceptName(range, concepts)}“.`,
      );
    }
  }

  if (differs('broaderConcept')) {
    const parents =
      edit?.broaderConcept ?? (concept ? getNadrazenaTrida(concept) : []);
    descriptions.push(
      parents.length > 0
        ? `Nadřazeným pojmem bude ${conceptNames(parents, concepts)}.`
        : 'Pojem nebude mít žádný nadřazený pojem.',
    );
  }

  if (differs('exactMatch')) {
    descriptions.push(
      edit?.exactMatch?.length
        ? `Ekvivalentními pojmy budou ${conceptNames(edit.exactMatch, concepts)}.`
        : 'Diagram nenastavuje žádný nový ekvivalentní pojem.',
    );
  }

  if (differs('convertToHierarchy')) {
    descriptions.push(
      edit?.convertToHierarchy
        ? 'Vztah bude převeden na hierarchickou vazbu.'
        : 'Vztah zůstane běžným vztahem.',
    );
  }

  return descriptions;
};

export const MaterializationConflictDialog = ({
  open,
  conflicts,
  ontologySlug,
  currentDiagramName,
  concepts,
  pending,
  onClose,
  onResolve,
}: {
  open: boolean;
  conflicts: MaterializationConflict[];
  ontologySlug: string;
  currentDiagramName?: string;
  concepts: Concept[];
  pending: boolean;
  onClose: () => void;
  onResolve: (
    _resolution: MaterializeOnConflict,
    _winnerDiagramId?: number,
  ) => void;
}) => {
  const diagrams = Array.from(
    new Map(
      conflicts.flatMap((conflict) =>
        (conflict.theirs ?? []).map((diagram) => [diagram.diagramId, diagram]),
      ),
    ).values(),
  );
  const diagramHref = (diagramId: number) =>
    `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/dictionary/${ontologySlug}/diagram/${diagramId}`;

  const diagramNavigation =
    diagrams.length > 1 ? (
      <GovDropdown
        id="conflicting-diagrams"
        position="right"
        className="z-2000! [&_.gov-dropdown__list]:top-auto! [&_.gov-dropdown__list]:bottom-full! [&_.gov-dropdown__list]:z-2000!"
      >
        <GovButton type="outlined" color="primary" disabled={pending}>
          Přejít na konfliktní diagram
          <GovIcon name="chevron-down" size="s" slot="icon-end" />
        </GovButton>
        <ul slot="list" className="min-w-64 p-0!">
          {diagrams.map((diagram) => (
            <li key={diagram.diagramId}>
              <GovButton
                type="base"
                color="neutral"
                expanded
                href={diagramHref(diagram.diagramId)}
                target="_blank"
              >
                <GovIcon name="diagram-3" size="m" slot="icon-start" />
                {diagram.diagramName?.trim() || '-- bez názvu --'}
              </GovButton>
            </li>
          ))}
        </ul>
      </GovDropdown>
    ) : (
      <GovButton
        type="outlined"
        color="primary"
        disabled={pending || diagrams.length === 0}
        href={diagrams[0] ? diagramHref(diagrams[0].diagramId) : undefined}
        target="_blank"
      >
        Přejít na konfliktní diagram
      </GovButton>
    );

  return (
    <GovDialog
      open={open}
      labelTag="h2"
      onGovClose={onClose}
      className="materialization-conflict-dialog fixed z-100 [&_dialog]:max-w-4xl! [&_.gov-dialog__content]:min-h-0 [&_.gov-dialog__footer]:relative [&_.gov-dialog__footer]:z-10"
    >
      <h2 slot="title">Konfliktní změny diagramů</h2>

      <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
        <p>
          Některé změny kolidují se změnami rozpracovanými v jiných diagramech.
          Zvolte, které změny chcete zachovat.
        </p>

        {conflicts.map((conflict) => (
          <section
            key={conflict.conceptIri}
            className="rounded-lg border border-status-warning-200 p-4 bg-status-warning-100/70"
          >
            <h3 className="font-bold">
              {conflict.label?.cs ?? conflict.conceptIri}
            </h3>
            <p className="mb-3 break-all text-xs text-card-description">
              {conflict.conceptIri}
            </p>

            <div className="grid gap-4 desktop:grid-cols-2">
              <div className="bg-blue-subtle/90 border-blue border px-3 py-3 h-fit rounded-xl">
                <h4 className="mb-1 font-bold">Moje změny</h4>
                <p className="font-bold text-sm">
                  {currentDiagramName?.trim() || '-- bez názvu --'}
                </p>
                <ul className="list-disc pl-5">
                  {describeDifferences(
                    conflict.mine,
                    (conflict.theirs ?? []).map((item) => item.pendingEdit),
                    conflict.conceptIri,
                    concepts,
                  ).map((description) => (
                    <li key={description} className="break-all">
                      {description}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-status-error-100/80 border-status-error-600 border px-3 py-3 h-fit rounded-xl">
                <h4 className="mb-1 font-bold">Změny v jiných diagramech</h4>
                <div className="flex flex-col gap-3">
                  {(conflict.theirs ?? []).map((theirs) => (
                    <div key={theirs.diagramId}>
                      <p className="font-bold text-sm">
                        {theirs.diagramName?.trim() || '-- bez názvu --'}
                      </p>
                      <ul className="list-disc pl-5">
                        {describeDifferences(
                          theirs.pendingEdit,
                          [conflict.mine],
                          conflict.conceptIri,
                          concepts,
                        ).map((description) => (
                          <li key={description} className="break-all">
                            {description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
      <div
        className="flex w-full flex-wrap justify-end gap-2 z-10000! overflow-visible!"
        slot="footer"
      >
        {diagramNavigation}
        <GovButton
          type="solid"
          color="primary"
          disabled={pending}
          onGovClick={() => onResolve(MaterializeOnConflict.ACCEPT_MINE)}
        >
          Převzít moje změny
        </GovButton>
        {diagrams.length > 1 ? (
          <GovDropdown
            id="accept-conflicting-diagram"
            position="right"
            className="z-2000! relative [&_.gov-dropdown__list]:top-auto! [&_.gov-dropdown__list]:bottom-full! [&_.gov-dropdown__list]:z-2000!"
          >
            <GovButton type="outlined" color="primary" disabled={pending}>
              Převzít změny konfliktního diagramu
              <GovIcon name="chevron-down" size="s" slot="icon-end" />
            </GovButton>
            <ul slot="list" className="min-w-64 p-0! absolute z-3000! right-0">
              {diagrams.map((diagram) => (
                <li key={diagram.diagramId}>
                  <GovButton
                    type="base"
                    color="neutral"
                    expanded
                    disabled={pending}
                    onGovClick={() =>
                      onResolve(
                        MaterializeOnConflict.ACCEPT_THEIRS,
                        diagram.diagramId,
                      )
                    }
                  >
                    <GovIcon name="diagram-3" size="m" slot="icon-start" />
                    {diagram.diagramName?.trim() || '-- bez názvu --'}
                  </GovButton>
                </li>
              ))}
            </ul>
          </GovDropdown>
        ) : (
          <GovButton
            type="outlined"
            color="primary"
            disabled={pending || diagrams.length === 0}
            onGovClick={() =>
              onResolve(
                MaterializeOnConflict.ACCEPT_THEIRS,
                diagrams[0]?.diagramId,
              )
            }
          >
            Převzít změny konfliktního diagramu
          </GovButton>
        )}
      </div>
    </GovDialog>
  );
};
