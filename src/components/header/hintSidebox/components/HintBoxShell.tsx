import clsx from 'clsx';

interface HintboxShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function HintboxShell({ isOpen, onClose, children }: HintboxShellProps) {
  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-1000 bg-black transition-opacity duration-300 m-0',
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      <aside
        className={clsx(
          'fixed top-1/2 -translate-y-1/2 right-0 h-[90vh] bg-white rounded-l-xl shadow-2xl z-1000',
          'w-full md:w-2/3 2xl:w-1/3',
          'flex flex-col',
          'border border-r-0 border-blue-200',
          'transform transition-all duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {children}
      </aside>
    </>
  );
}
