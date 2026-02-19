import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'default' | 'outline';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const baseStyles = cn(
  'w-full flex items-center justify-center gap-2',
  'h-9 sm:h-10 px-4',
  'text-xs sm:text-sm font-medium',
  'active:scale-[0.98] transition-all duration-200 ease-out cursor-pointer',
  'disabled:pointer-events-none disabled:opacity-50',
);

const variants: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:opacity-90',
  outline: 'border border-border bg-background text-foreground hover:bg-border/50',
};

export function Button({ children, className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
