'use client';

import { GovButton, GovIcon, GovLink } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { scrollTop } from '@/lib/windowUtils';

import { FooterColumn } from './FooterColumn';

export const Footer = () => {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-blue py-12 text-white mt-auto">
      <section className="max-w-desktop px-5 mx-auto space-y-12">
        <div className="flex justify-between">
          <ul className="flex justify-between w-full flex-wrap flex-col md:flex-row gap-y-10 md:pr-28">
            <FooterColumn title={t('LinkColumn.Title')}>
              <ul className="space-y-3">
                <li>
                  <GovLink href="#" size="s">
                    {t('LinkColumn.Link1')}
                  </GovLink>
                </li>
                <li>
                  <GovLink href="#" size="s">
                    {t('LinkColumn.Link2')}
                  </GovLink>
                </li>
                <li>
                  <GovLink
                    href="https://github.com/datagov-cz/ISMD_org"
                    external
                    size="s"
                  >
                    {t('LinkColumn.Link3')}
                  </GovLink>
                </li>
              </ul>
            </FooterColumn>
            <FooterColumn title={t('ContactColumn.Title')}>
              <GovLink href={`mailto:${t('ContactColumn.Email')}`} size="s">
                <GovIcon slot="icon-start" name="envelope" />
                {t('ContactColumn.Email')}
              </GovLink>
            </FooterColumn>
          </ul>
          <GovButton
            slot="icon-start"
            name="arrow-up"
            aria-label={t('BackToTopAria')}
            type="solid"
            size="m"
            className="bg-white cursor-pointer"
            onGovClick={scrollTop}
          >
            <GovIcon name="arrow-up" />
          </GovButton>
        </div>
        <div className="space-y-4">
          <h6 className="text-lg font-medium">{t('ThanksSection.Title')}</h6>
          <p className="text-sm">{t('ThanksSection.Text')}</p>
          <ul className="flex gap-y-4 gap-x-6 flex-wrap">
            <li>
              <GovIcon name="logo-eu" />
            </li>
            <li>
              <GovIcon name="logo-npo" />
            </li>
            <li>
              <GovIcon name="logo-dia" />
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <ul className="flex gap-x-8 gap-y-3 flex-wrap">
            <li>
              <GovLink href="#" size="s">
                Link
              </GovLink>
            </li>
            <li>
              <GovLink href="#" size="s">
                Link
              </GovLink>
            </li>
            <li>
              <GovLink href="#" size="s">
                Link
              </GovLink>
            </li>
            <li>
              <GovLink href="#" size="s">
                Link
              </GovLink>
            </li>
          </ul>
          <hr className="!border-t-footer-separator" />
          <div className="flex justify-between flex-wrap gap-y-4 gap-x-8 text-secondary text-xs">
            <p>{t('FooterCopySection.Copyright')}</p>
            <div className="flex gap-x-3">
              <p>{t('FooterCopySection.Version')}</p>|
              <p>{t('FooterCopySection.DesignSystem')}</p>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
};
