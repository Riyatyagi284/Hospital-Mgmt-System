interface SelectInputProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder: string;
  options?: string[];
}

export default function SelectInput({
  placeholder,
  options = [],
  ...props
}: SelectInputProps) {
  return (
    <select 
    {...props}
    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}