import { cn } from '@/lib/utils';
import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full bg-transparent border-border border-b-2 px-0 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground resize-none',
        className,
      )}
      {...props}
    />
  );
}
