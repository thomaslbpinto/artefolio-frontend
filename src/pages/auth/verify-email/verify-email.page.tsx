import { useEffect, useState, type SubmitEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/ui/auth-layout';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/error-banner';
import { FieldError } from '@/components/ui/field-error';
import { FormHeader } from '@/components/ui/form-header';
import { OtpInput } from '@/components/ui/otp-input';
import { useAuth } from '@/contexts/auth.context';
import { useCooldown } from '@/hooks/use-cooldown';
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
  const { cooldownSecondsLeft, startCooldown } = useCooldown();

  const disabled = loadingState !== 'idle';

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
    <AuthLayout>
      <FormHeader title="Verify your email address" subtitle={`We sent a 6-digit code to ${user.email}`} />

      <ErrorBanner message={errors.submit} />

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
        <FieldError message={errors.code} />

        <div className="space-y-2.5">
          <Button type="submit" disabled={disabled || code.length !== 6}>
            {loadingState === 'verifying' || loadingState === 'redirecting' ? 'Verifying...' : 'Verify code'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleResendCode}
            disabled={disabled || cooldownSecondsLeft > 0}
          >
            {loadingState === 'resending'
              ? 'Resending...'
              : cooldownSecondsLeft > 0
                ? `Resend in ${cooldownSecondsLeft}s`
                : 'Resend code'}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
