interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  disabled?:boolean;
}

export default function TextInput({
  placeholder,
  disabled,
  ...props
}: TextInputProps) {
  return (
    <input
      {...props}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring disabled:bg-muted disabled:text-muted-foreground"
    />
  );
}