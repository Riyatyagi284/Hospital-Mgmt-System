import Header from "@/components/layout/Header";

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
}

export default function PageContainer({ title, children }: PageContainerProps) {
  return (
    <div className="min-h-screen">
      <Header title={title} />
      <div className="p-6">{children}</div>
    </div>
  );
}