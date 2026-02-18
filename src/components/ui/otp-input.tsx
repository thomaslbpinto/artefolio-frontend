import { cn } from '@/lib/utils';
import OTPInput from 'react-otp-input';

interface OtpInputProps {
  value: string;
  length?: number;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OtpInput({ value, length = 6, onChange, disabled = false, error = false }: OtpInputProps) {
  return (
    <OTPInput
      value={value}
      onChange={onChange}
      numInputs={length}
      inputType="tel"
      skipDefaultStyles={true}
      shouldAutoFocus={!disabled}
      containerStyle="flex items-center justify-between gap-2.5"
      renderInput={(props) => (
        <input
          {...props}
          disabled={disabled}
          className={cn(
            'h-13 w-13 rounded-md border bg-background text-center text-2xl font-semibold outline-none transition-colors',
            'border-border text-foreground focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error text-error focus:border-error',
          )}
        />
      )}
    />
  );
}

export type { OtpInputProps };
