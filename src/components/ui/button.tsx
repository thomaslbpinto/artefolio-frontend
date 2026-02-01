import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'w-full bg-primary text-primary-foreground py-3 px-4 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 ease-out cursor-pointer disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
