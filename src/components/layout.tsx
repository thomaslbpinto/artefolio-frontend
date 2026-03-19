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
        <main className={cn('flex-1 mb-10', 'sm:mb-0', 'lg:mb-0')}>{children}</main>
        <Footer />
      </div>
    </div>
  );
};
