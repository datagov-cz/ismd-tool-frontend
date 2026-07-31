'use client';

import Image from 'next/image';
import Link from 'next/link';

import { OnlineIndicator } from './OnlineIndicator';

interface Props {
  showOnlineIndicator?: boolean;
}

export const HeaderLogo = ({ showOnlineIndicator }: Props) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

  return (
    <Link
      href="/"
      className="no-underline flex items-center text-white font-medium gap-4"
    >
      <Image
        src={`${basePath}/assets/icon-pixel.svg`}
        width={36}
        height={48}
        alt="lion"
      />
      <span className="text-xl">ISMD</span>
      {showOnlineIndicator && <OnlineIndicator />}
    </Link>
  );
};
