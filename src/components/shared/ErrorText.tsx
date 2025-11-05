interface Props {
  text: string;
}

export const ErrorText = ({ text }: Props) => {
  return (
    <p className="text-sm text-status-error-700 dark:text-status-error-200">
      {text}
    </p>
  );
};
