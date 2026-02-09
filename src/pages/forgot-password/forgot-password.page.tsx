import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme.toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z
    .email('Please enter a valid email')
    .max(255, 'Email must not exceed 255 characters'),
});

type FormErrors = {
  email?: string;
  submit?: string;
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    try {
      const result = forgotPasswordSchema.safeParse({ email });

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

      setLoading(true);

      await apiClient.forgotPassword(email);
      setSubmitted(true);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Failed to send reset link. Please try again.';
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  }

  async function handleBackToSignIn() {
    navigate('/sign-in');
  }

  if (submitted) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-8 py-6 sm:gap-8 sm:px-6 sm:py-8">
        <header className="flex w-full max-w-md items-center justify-between">
          <Logo />
          <ThemeToggle />
        </header>

        <main className="flex w-full max-w-md flex-col">
          <div className="mb-5 sm:mb-6">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">
              Check your email
            </h1>
          </div>

          <div className="bg-border/30 border border-border p-3 mb-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              If an account exists with{' '}
              <span className="font-medium text-foreground">{email}</span>, you
              will receive a password reset link.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Please check your inbox and follow the instructions.
            </p>
          </div>

          <div className="space-y-2.5">
            <Button
              type="button"
              onClick={handleBackToSignIn}
              className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium"
            >
              Back to sign in
            </Button>
          </div>
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
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">
            Forgot your password?
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {errors.submit && (
          <div className="border border-error-border bg-error-background p-3 mb-4">
            <p className="text-xs sm:text-sm text-error">{errors.submit}</p>
          </div>
        )}

        <form
          className="space-y-3 sm:space-y-3.5"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs sm:text-sm font-medium text-muted-foreground"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="your@email.com"
              disabled={loading}
              className="h-9 sm:h-10 text-sm"
            />
            {errors.email && (
              <p className="text-[11px] sm:text-xs text-error mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div className="pt-2 sm:pt-3 space-y-2.5 sm:space-y-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>

            <Button
              type="button"
              onClick={handleBackToSignIn}
              className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium border border-border bg-background text-foreground hover:bg-border/50"
              disabled={loading}
            >
              Back to sign in
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
