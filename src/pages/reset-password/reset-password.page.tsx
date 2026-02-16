import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme.toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, type SubmitEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { AxiosError } from 'axios';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one symbol'),
});

type FormErrors = {
  password?: string;
  submit?: string;
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    if (!token) {
      setErrors({ submit: 'Invalid or missing reset token' });
      return;
    }

    try {
      const result = resetPasswordSchema.safeParse({ password });

      if (!result.success) {
        const fieldErrors: FormErrors = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof FormErrors] = issue.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      setSubmitting(true);

      await apiClient.resetPassword(token, password);
      navigate('/sign-in', {
        state: { message: 'Password reset successfully. Please sign in.' },
      });
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Failed to reset password. Please try again.'
          : 'Failed to reset password. Please try again.';
      setErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-8 py-6 sm:gap-8 sm:px-6 sm:py-8">
        <header className="flex w-full max-w-md items-center justify-between">
          <Logo />
          <ThemeToggle />
        </header>

        <main className="flex w-full max-w-md flex-col">
          <div className="mb-5 sm:mb-6">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Invalid reset link</h1>
          </div>

          <div className="border border-error-border bg-error-background p-3 mb-6">
            <p className="text-xs sm:text-sm text-error">
              This password reset link is invalid or missing. Please request a new one.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium"
          >
            Request new link
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-8 py-6 sm:gap-8 sm:px-6 sm:py-8">
      <header className="flex w-full max-w-md items-center justify-between">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex w-full max-w-md flex-col">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">Reset your password</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Enter your new password below.</p>
        </div>

        {errors.submit && (
          <div className="bg-error-background border border-error-border p-3 mb-4">
            <p className="text-xs sm:text-sm text-error">{errors.submit}</p>
          </div>
        )}

        <form className="space-y-3 sm:space-y-3.5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs sm:text-sm font-medium text-muted-foreground">
              New password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="••••••••"
              disabled={submitting}
              className="h-9 sm:h-10 text-sm"
            />
            {errors.password && <p className="text-[11px] sm:text-xs text-error mt-1">{errors.password}</p>}
          </div>

          <div className="pt-2 sm:pt-3 space-y-2.5">
            <Button type="submit" disabled={submitting} className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium">
              {submitting ? 'Resetting...' : 'Reset password'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
