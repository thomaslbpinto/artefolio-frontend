import { useEffect, useState, type SubmitEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme.toggle';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { useAuth } from '@/contexts/auth.context';
import { apiClient } from '@/lib/api-client';

type LoadingState = 'idle' | 'verifying' | 'resending' | 'redirecting';

type FormErrors = {
  code?: string;
  submit?: string;
};

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();
  const [code, setCode] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [cooldownEndsAt, setCooldownEndsAt] = useState<Date | null>(null);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);

  const disabled = loadingState !== 'idle';

  function startCooldown(seconds = 60) {
    setCooldownEndsAt(new Date(Date.now() + seconds * 1000));
  }

  useEffect(() => {
    apiClient
      .getEmailVerificationResendCooldown()
      .then(({ retryAfterSeconds }) => {
        if (retryAfterSeconds > 0) {
          startCooldown(retryAfterSeconds);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!cooldownEndsAt) {
      return;
    }

    const tick = () => {
      const secondsLeft = Math.ceil((cooldownEndsAt.getTime() - Date.now()) / 1000);
      if (secondsLeft <= 0) {
        setCooldownSecondsLeft(0);
        setCooldownEndsAt(null);
      } else {
        setCooldownSecondsLeft(secondsLeft);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [cooldownEndsAt]);

  useEffect(() => {
    if (loadingState !== 'redirecting') {
      return;
    }

    setTimeout(() => {
      navigate('/');
    }, 1500);
  }, [navigate, loadingState]);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (user.emailVerified && loadingState !== 'redirecting') {
    return <Navigate to="/" replace />;
  }

  async function handleVerifyCode(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    if (code.length !== 6) {
      setErrors({ code: 'Enter the 6-digit code' });
      return;
    }

    setLoadingState('verifying');

    try {
      await apiClient.verifyEmailVerificationCode(code);
      await refreshUser();
      setLoadingState('redirecting');
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || 'Failed to verify code. Please try again.' });
      setCode('');
      setLoadingState('idle');
    }
  }

  async function handleResendCode() {
    if (!user?.email) {
      return;
    }

    setErrors({});
    setLoadingState('resending');

    try {
      await apiClient.resendEmailVerificationEmail(user.email);
      startCooldown();
    } catch (error: any) {
      const retryAfterSeconds = error.response?.data?.retryAfterSeconds;
      if (retryAfterSeconds) {
        startCooldown(retryAfterSeconds);
      }
      setErrors({ submit: error.response?.data?.message || 'Failed to resend code. Please try again.' });
    } finally {
      setLoadingState('idle');
      setCode('');
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
          <h1 className="text-lg font-semibold text-foreground sm:text-xl">Verify your email address</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">We sent a 6-digit code to {user.email}</p>
        </div>

        {errors.submit && (
          <div className="mb-4 border border-error-border bg-error-background p-3">
            <p className="text-xs text-error sm:text-sm">{errors.submit}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleVerifyCode} noValidate>
          <OtpInput
            value={code}
            onChange={(value) => {
              setCode(value);
              setErrors({});
            }}
            disabled={disabled}
            error={Boolean(errors.code || errors.submit)}
          />
          {errors.code && <p className="text-[11px] text-error sm:text-xs">{errors.code}</p>}

          <div className="space-y-2.5">
            <Button
              type="submit"
              className="h-9 text-xs font-medium sm:h-10 sm:text-sm"
              disabled={disabled || code.length !== 6}
            >
              {loadingState === 'verifying' || loadingState === 'redirecting' ? 'Verifying...' : 'Verify'}
            </Button>

            <Button
              type="button"
              className="h-9 border border-border bg-background text-xs font-medium text-foreground hover:bg-border/50 sm:h-10 sm:text-sm"
              onClick={handleResendCode}
              disabled={disabled || cooldownSecondsLeft > 0}
            >
              {loadingState === 'resending'
                ? 'Sending...'
                : cooldownSecondsLeft > 0
                  ? `Resend in ${cooldownSecondsLeft}s`
                  : 'Resend code'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
