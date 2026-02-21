import type { ReactNode } from 'react';
import { Header } from './ui/header';
import { Footer } from './ui/footer';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex flex-col flex-1">
        <Header />
        <main className={cn('flex-1 mt-12 p-2 pb-12', 'sm:mt-14 sm:p-3', 'lg:mt-16 lg:p-4')}>{children}</main>
        <Footer />
      </div>
    </div>
  );
};
