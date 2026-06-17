import { ButtonInput } from '@/components/shared/ButtonInput';

type Props = {
  label: string;
  onClick: () => void;
};

export const LegislativeSourceUnselected = ({ label, onClick }: Props) => (
  <ButtonInput onClick={onClick}>{label}</ButtonInput>
);
