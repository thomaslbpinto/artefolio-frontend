import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme.toggle';
import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-8 py-6 sm:gap-8 sm:px-6 sm:py-8">
      <header className="flex w-full max-w-md items-center justify-between">
        <Logo size="lg" />
        <ThemeToggle size={24} />
      </header>
      <main className="flex w-full max-w-md flex-col">{children}</main>
    </div>
  );
}
