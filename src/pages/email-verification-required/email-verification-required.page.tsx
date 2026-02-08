import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme.toggle';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { apiClient } from '@/lib/api-client';
import { useNavigate } from 'react-router';

export default function EmailVerificationRequiredPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleResendEmail() {
    if (!user?.email) {
      return;
    }

    setResending(true);
    setMessage('');
    setIsError(false);

    try {
      await apiClient.resendVerificationEmail(user.email);
      setMessage('Verification email sent! Please check your inbox.');
      setIsError(false);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Failed to resend email. Please try again.';
      setMessage(message);
      setIsError(true);
    } finally {
      setResending(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate('/');
    }
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
            Verify your email address
          </h1>
        </div>

        {message && (
          <div
            className={`border p-3 mb-4 ${
              isError
                ? 'bg-error-background border-error-border'
                : 'bg-success-background border-success-border'
            }`}
          >
            <p
              className={`text-xs sm:text-sm ${isError ? 'text-error' : 'text-success'}`}
            >
              {message}
            </p>
          </div>
        )}

        <div className="bg-border/30 border border-border p-4 mb-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            We sent a verification email to{' '}
            <span className="font-medium text-foreground">{user?.email}</span>.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            Click the link in the email to verify your account.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            If you didn&apos;t receive it, you can request a new one.
          </p>
        </div>

        <div className="space-y-2.5">
          <Button
            type="button"
            onClick={handleResendEmail}
            className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium"
            disabled={resending}
          >
            {resending ? 'Sending...' : 'Resend verification email'}
          </Button>

          <Button
            type="button"
            onClick={handleLogout}
            className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium border border-border bg-background text-foreground hover:bg-border/50"
          >
            Sign out
          </Button>
        </div>
      </main>
    </div>
  );
}
