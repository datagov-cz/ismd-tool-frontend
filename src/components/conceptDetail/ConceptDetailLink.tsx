import Link from 'next/link';

export const ConceptDetailLink = ({
  href,
  label,
}: {
  href: string;
  label?: string;
}) => {
  return (
    <Link
      className="text-blue-primary visited:text-blue-primary underline block"
      href={href}
    >
      {label || href}
    </Link>
  );
};
