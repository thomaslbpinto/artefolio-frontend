import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme.toggle';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth.context';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying',
  );
  const [message, setMessage] = useState('Verifying your email...');
  const [resending, setResending] = useState(false);
  const hasVerifiedTokenRef = useRef(false);

  useEffect(() => {
    async function verifyEmailWithToken(token: string) {
      try {
        await apiClient.verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully!');
        await refreshUser();
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (error: any) {
        setStatus('error');
        const message =
          error.response?.data?.message ||
          'Failed to verify email. Please try again.';
        setMessage(message);
      }
    }

    const token = searchParams.get('token');

    if (user?.emailVerified) {
      navigate('/');
    } else if (token) {
      setTimeout(() => {
        if (!hasVerifiedTokenRef.current) {
          hasVerifiedTokenRef.current = true;
          verifyEmailWithToken(token);
        }
      }, 1500);
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [searchParams, user, navigate, refreshUser]);

  async function handleResendEmail() {
    if (!user?.email) {
      return;
    }

    setStatus('verifying');
    setMessage('');
    setResending(true);

    try {
      await apiClient.resendVerificationEmail(user.email);
      setStatus('success');
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      setStatus('error');
      const message =
        error.response?.data?.message ||
        'Failed to resend email. Please try again.';
      setMessage(message);
    } finally {
      setResending(false);
    }
  }

  function handleGoHome() {
    navigate('/');
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

        <div
          className={`border p-4 mb-6 ${
            status === 'error'
              ? 'bg-error-background border-error-border'
              : status === 'success'
                ? 'bg-success-background border-success-border'
                : 'bg-border/30 border-border'
          }`}
        >
          <div className="flex items-center gap-2">
            <p
              className={`text-xs sm:text-sm ${
                status === 'error'
                  ? 'text-error'
                  : status === 'success'
                    ? 'text-success'
                    : 'text-muted-foreground'
              }`}
            >
              {message}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {user && !user.emailVerified && (
            <Button
              type="button"
              onClick={handleResendEmail}
              className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium"
              disabled={resending}
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </Button>
          )}

          <Button
            type="button"
            onClick={handleGoHome}
            className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium border border-border bg-background text-foreground hover:bg-border/50"
            disabled={resending || (status === 'success' && !resending)}
          >
            {!resending && status === 'success'
              ? 'Redirecting to home...'
              : 'Go to home'}
          </Button>
        </div>
      </main>
    </div>
  );
}
