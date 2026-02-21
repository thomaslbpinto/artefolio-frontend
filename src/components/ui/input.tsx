import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full bg-transparent border-border border-b-2 px-0 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}
