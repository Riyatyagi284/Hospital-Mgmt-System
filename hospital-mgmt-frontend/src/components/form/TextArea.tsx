interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  placeholder: string;
}

export default function TextArea({
  placeholder,
  ...props
}: TextAreaProps) {
  return (
    <textarea
      {...props}
      placeholder={placeholder}
      rows={2}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring"
    />
  );
}