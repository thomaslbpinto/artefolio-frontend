import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex flex-col flex-1">
        <header className="h-14 border-b flex items-center px-6">Header</header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
};
