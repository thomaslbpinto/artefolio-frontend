import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export function Label({ className, required = false, ...props }: LabelProps) {
  return (
    <label className={cn('text-sm font-medium text-muted-foreground', className)} {...props}>
      {props.children}
      {required && <span className="text-error"> *</span>}
    </label>
  );
}
