import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full bg-transparent border-border border-b-2 border-t-0 border-l-0 border-r-0 px-0 py-3 focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}
