'use client';

import { Session } from 'next-auth';
import { useTranslations } from 'next-intl';

import { useHintboxStore } from '@/store/hintboxStore';

import { GITHUB_BASE } from './constants';

export interface NavLink {
  icon: string;
  label: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

export const useNavigation = (session: Session | null) => {
  const t = useTranslations('Header');
  const setIsHintboxOpen = useHintboxStore((state) => state.setIsOpen);

  const prefix = session ? 'NavLogged' : 'Nav';

  const apiDocs: NavLink = {
    icon: 'book',
    label: t('ApiDocs'),
    href: `${process.env.NEXT_PUBLIC_BASE_PATH}/swagger-ui/index.html`,
    external: true,
  };

  const help: NavLink = {
    icon: 'question-square',
    label: t(`${prefix}.Link1`),
    onClick: () => setIsHintboxOpen(true),
  };

  const feedback: NavLink = {
    icon: 'chat-dots',
    label: t(`${prefix}.Dropdown.Label`),
    href: `${GITHUB_BASE}/choose`,
    external: true,
  };

  const feedbackItems: NavLink[] = [
    {
      icon: 'bug',
      label: t(`${prefix}.Dropdown.Link1`),
      href: `${GITHUB_BASE}?template=bug_report.yml`,
      external: true,
    },
    {
      icon: 'flag',
      label: t(`${prefix}.Dropdown.Link2`),
      href: `${GITHUB_BASE}?template=feature_request.yml`,
      external: true,
    },
  ];

  const createDictionary: NavLink = {
    icon: 'plus',
    label: t('Ontology'),
    href: `${process.env.NEXT_PUBLIC_BASE_PATH}/dictionary/create`,
  };

  return { apiDocs, help, feedback, feedbackItems, createDictionary };
};
