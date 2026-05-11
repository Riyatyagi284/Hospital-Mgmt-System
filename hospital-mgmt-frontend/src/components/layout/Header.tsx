import { Bell, Menu, ChevronDown } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted">
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </button>

        <div className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted cursor-pointer">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            A
          </div>
          <span className="text-sm font-medium text-foreground">Admin</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}