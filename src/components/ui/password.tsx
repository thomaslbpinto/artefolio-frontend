import { cn } from '@/lib/utils';
import { useState, type InputHTMLAttributes } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Input } from './input';

type PasswordProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function Password({ className, placeholder = '••••••••', ...props }: PasswordProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={isVisible ? 'text' : 'password'}
        placeholder={placeholder}
        className={cn('pr-10 peer', className)}
      />

      <button
        type="button"
        onClick={() => setIsVisible((prev) => !prev)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        disabled={props.disabled}
        className="absolute inset-y-0 right-0 flex items-center px-2 invisible peer-[:not(:placeholder-shown)]:visible cursor-pointer text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none"
      >
        {isVisible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </div>
  );
}
