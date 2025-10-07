interface Props {
  author: string;
  dateTime: Date;
  text: string;
}

export const CommentItem = ({ author, dateTime, text }: Props) => {
  return (
    <div className="space-y-2 p-2">
      <div className="text-sm font-medium">
        {author} - {new Date(dateTime).toLocaleDateString()}
      </div>
      <p className="mt-1 text-sm whitespace-pre-wrap line-clamp-3">{text}</p>
    </div>
  );
};
