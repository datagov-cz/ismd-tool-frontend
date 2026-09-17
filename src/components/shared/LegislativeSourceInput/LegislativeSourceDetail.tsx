import { ComponentProps, useRef, useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useGetLawContent, useGetVersions } from '@/api/generated';
import { LegislativeSourceAutocomplete } from '@/components/shared/LegislativeSourceInput/LegislativeSourceAutocomplete';
import { LegislativeSourceDetailSkeleton } from '@/components/shared/LegislativeSourceInput/LegislativeSourceDetailSkeleton';
import {
  FragmentNode,
  LegislativeSourceFragmentNav,
} from '@/components/shared/LegislativeSourceInput/LegislativeSourceFragmentNav';
import { LegislativeSourceSelected } from '@/components/shared/LegislativeSourceInput/LegislativeSourceSelected';
import { LegislativeSourceVersionPicker } from '@/components/shared/LegislativeSourceInput/LegislativeSourceVersionPicker';
import { LegislativeSource } from '@/components/shared/LegislativeSourceInput/types';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/shared/Popover';

type Props = {
  id: string;
  source: LegislativeSource;
  open: ComponentProps<typeof Popover>['open'];
  onOpenChange: ComponentProps<typeof Popover>['onOpenChange'];
  onClear: () => void;
  selectedIri: string | null;
  onSelectIri: (_iri: string) => void;
};

export const LegislativeSourceDetail = ({
  id,
  open,
  onOpenChange,
  source,
  onClear,
  selectedIri,
  onSelectIri,
}: Props) => {
  const t = useTranslations('LegislativeSource');

  const contentRef = useRef<HTMLDivElement>(null);
  const [draftIri, setDraftIri] = useState<string | null>(selectedIri);
  // Only an explicit pick is stored; the default is derived below, so it needs no effect and
  // corrects itself when the version list arrives.
  const [chosenVersionIri, setChosenVersionIri] = useState<string | null>(null);

  // The version list is ~0.4% of a content response, so it is fetched on its own: the user
  // picks a znění before paying for its (~2 MB) text, and switching costs one content call
  // rather than two.
  const { data: versionsData, isLoading: versionsLoading } = useGetVersions({
    lawIri: source.iri,
  });
  const versions = versionsData?.data;

  // An already-selected fragment pins its own znění (the version date is part of every
  // fragment IRI); otherwise open on the current one.
  const pinnedVersionIri = selectedIri
    ? versions?.find((v) => v.iri && selectedIri.startsWith(v.iri))?.iri
    : undefined;
  const versionIri =
    chosenVersionIri ??
    pinnedVersionIri ??
    versions?.find((v) => v.latest)?.iri ??
    null;

  // Keyed by version IRI — the backend accepts one directly in `law`, and caches per znění.
  const { data, isLoading: contentLoading } = useGetLawContent(
    { law: versionIri ?? '' },
    { query: { enabled: !!versionIri } },
  );
  const isLoading = versionsLoading || contentLoading;

  const bodyHtml = data?.data?.bodyHtml;
  const fragments = data?.data?.fragments as FragmentNode[] | undefined;

  // Switching znění invalidates a fragment picked in the previous one: the same § has a
  // different IRI per version, so the old draft would point outside the rendered text.
  const handleVersionChange = (iri: string) => {
    setChosenVersionIri(iri);
    setDraftIri(null);
  };

  const handleSelect = (iri: string) => {
    setDraftIri(iri);

    const scrollToFragment = () =>
      contentRef.current
        ?.querySelector(`[data-iri="${iri}"]`)
        ?.scrollIntoView({ block: 'start' });

    scrollToFragment();
    void document.fonts.ready.then(scrollToFragment);
  };

  const handleConfirmSelection = () => {
    if (draftIri) {
      onSelectIri(draftIri);
      onOpenChange?.(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor>
        {selectedIri ? (
          <LegislativeSourceSelected
            iri={selectedIri}
            onClick={() => onOpenChange?.(!open)}
            onClear={onClear}
          />
        ) : (
          <div className="cursor-pointer" onClick={() => onOpenChange?.(!open)}>
            <div className="pointer-events-none">
              <LegislativeSourceAutocomplete
                placeholder={source.label}
                onSourceSelect={() => {}}
                id={id}
              />
            </div>
          </div>
        )}
      </PopoverAnchor>
      <PopoverContent
        side="bottom"
        avoidCollisions={false}
        align="start"
        sideOffset={0}
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        className="bg-white p-4 border border-(--border-subtle) max-h-96 overflow-hidden flex flex-col"
        onInteractOutside={(e) => {
          const target = e.detail.originalEvent.target as HTMLElement | null;
          if (target?.closest('[data-action="clear"]')) {
            e.preventDefault();
          }
        }}
      >
        {draftIri ? (
          <style>{`.law-content [data-iri="${draftIri}"]{background-color:var(--law-selected-bg);}`}</style>
        ) : null}
        {versions?.length ? (
          <div className="pb-3 mb-3 border-b border-(--border-subtle)">
            <LegislativeSourceVersionPicker
              versions={versions}
              selectedIri={versionIri}
              onSelect={handleVersionChange}
              disabled={contentLoading}
            />
          </div>
        ) : null}
        {isLoading ? <LegislativeSourceDetailSkeleton /> : null}
        {data?.errorCode ? <p>Error: {data.errorCode}</p> : null}
        {data?.data && !contentLoading ? (
          <div className="grid grid-cols-3 grid-rows-1 gap-4 flex-1 min-h-0">
            <div className="min-h-0 overflow-y-auto text-sm">
              <LegislativeSourceFragmentNav
                fragments={fragments}
                selectedIri={draftIri}
                onSelect={handleSelect}
              />
            </div>
            <div className="law-content min-h-0 overflow-y-auto col-span-2">
              <div
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: bodyHtml ?? '' }}
              />
              {draftIri && (
                <div className="sticky text-center bottom-0 bg-white pt-2 border-t border-primary-subtlest">
                  <GovButton
                    type="solid"
                    color="primary"
                    size="s"
                    onGovClick={handleConfirmSelection}
                  >
                    <GovIcon
                      name="check-square"
                      type="components"
                      slot="icon-start"
                    />
                    {t('SelectFragment')}
                  </GovButton>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};
