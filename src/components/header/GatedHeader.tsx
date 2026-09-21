import Image from 'next/image';

export const GatedHeader = () => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-header py-3 z-50">
        <section className="mx-auto max-w-full-hd px-5 flex items-center">
          <div className="flex items-center text-white font-medium gap-4">
            <Image
              src={`${basePath}/assets/icon-pixel.svg`}
              width={36}
              height={48}
              alt="lion"
            />
            <span className="text-xl">ISMD</span>
          </div>
        </section>
      </header>
      <div className="min-h-18" />
    </>
  );
};
