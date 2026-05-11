import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from '@/providers/QueryProvider';
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: 'Hospital Management System',
  description: 'Complete hospital management solution',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="ml-60 flex-1">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
