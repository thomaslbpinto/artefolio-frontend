import { useEffect, useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme.toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { OtpInput } from '@/components/ui/otp-input';
import { apiClient } from '@/lib/api-client';

const emailSchema = z.object({
  email: z.email('Please enter a valid email').max(255, 'Email must not exceed 255 characters'),
});

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one symbol'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type Step = 'email' | 'code' | 'password';

type FormErrors = {
  email?: string;
  code?: string;
  newPassword?: string;
  confirmPassword?: string;
  submit?: string;
};

type LoadingState = 'idle' | 'sending' | 'verifying' | 'resending' | 'resetting' | 'redirecting';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errors, setErrors] = useState<FormErrors>({});

  const disabled = loadingState !== 'idle';

  const [cooldownEndsAt, setCooldownEndsAt] = useState<Date | null>(null);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);

  function startCooldown(seconds = 60) {
    setCooldownEndsAt(new Date(Date.now() + seconds * 1000));
  }

  useEffect(() => {
    if (!cooldownEndsAt) return;

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
      navigate('/sign-in');
    }, 1500);
  }, [navigate, loadingState]);

  async function handleSendCode(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const result = emailSchema.safeParse({ email });

    if (!result.success) {
      setErrors({ email: result.error.issues[0]?.message ?? 'Invalid email' });
      return;
    }

    setLoadingState('sending');

    try {
      await apiClient.sendPasswordResetEmail(email);
      const { retryAfterSeconds } = await apiClient.getPasswordResetResendCooldown(email);
      startCooldown(retryAfterSeconds || 60);
      setStep('code');
    } catch (error: any) {
      const retryAfterSeconds = error.response?.data?.retryAfterSeconds;
      if (retryAfterSeconds) {
        startCooldown(retryAfterSeconds);
        setStep('code');
      }
      setErrors({ submit: error.response?.data?.message || 'Failed to send code. Please try again.' });
    } finally {
      setLoadingState('idle');
    }
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
      await apiClient.verifyPasswordResetCode(email, code);
      setStep('password');
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || 'Invalid code. Please try again.' });
    } finally {
      setLoadingState('idle');
    }
  }

  async function handleResendCode() {
    setErrors({});
    setLoadingState('resending');

    try {
      await apiClient.sendPasswordResetEmail(email);
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

  function handleUseAnotherEmail() {
    setStep('email');
    setEmail('');
    setCode('');
    setErrors({});
  }

  async function handleResetPassword(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const result = resetPasswordSchema.safeParse({ newPassword, confirmPassword });

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

    setLoadingState('resetting');

    try {
      await apiClient.resetPassword(email, code, newPassword);
      setLoadingState('redirecting');
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || 'Failed to reset password. Please try again.' });
      setLoadingState('idle');
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-8 py-6 sm:gap-8 sm:px-6 sm:py-8">
      <header className="flex w-full max-w-md items-center justify-between">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex w-full max-w-md flex-col transition-all duration-300 ease-out">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-lg font-semibold text-foreground sm:text-xl">Reset your password</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {step === 'email' && "Enter your email and we'll send you code to reset your password"}
            {step === 'code' && `Enter the 6-digit code sent to ${email}`}
            {step === 'password' && 'Create your new password'}
          </p>
        </div>

        {errors.submit && (
          <div className="mb-4 border border-error-border bg-error-background p-3">
            <p className="text-xs text-error sm:text-sm">{errors.submit}</p>
          </div>
        )}

        {step === 'email' && (
          <form className="space-y-3 sm:space-y-3.5" onSubmit={handleSendCode} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground sm:text-sm">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((previous) => ({ ...previous, email: '' }));
                }}
                placeholder="your@email.com"
                disabled={disabled}
                className="h-9 text-sm sm:h-10"
              />
              {errors.email && <p className="mt-1 text-[11px] text-error sm:text-xs">{errors.email}</p>}
            </div>

            <div className="space-y-2.5 pt-2 sm:space-y-3 sm:pt-3">
              <Button type="submit" className="h-9 text-xs font-medium sm:h-10 sm:text-sm" disabled={disabled}>
                {loadingState === 'sending' ? 'Sending...' : 'Send code'}
              </Button>

              <Button
                type="button"
                className="h-9 border border-border bg-background text-xs font-medium text-foreground hover:bg-border/50 sm:h-10 sm:text-sm"
                onClick={() => navigate('/sign-in')}
                disabled={disabled}
              >
                Back to sign in
              </Button>
            </div>
          </form>
        )}

        {step === 'code' && (
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
                {loadingState === 'verifying' ? 'Verifying...' : 'Verify code'}
              </Button>

              <Button
                type="button"
                className="h-9 border border-border bg-background text-xs font-medium text-foreground hover:bg-border/50 sm:h-10 sm:text-sm"
                onClick={handleResendCode}
                disabled={disabled || cooldownSecondsLeft > 0}
              >
                {loadingState === 'resending'
                  ? 'Resending...'
                  : cooldownSecondsLeft > 0
                    ? `Resend in ${cooldownSecondsLeft}s`
                    : 'Resend code'}
              </Button>

              <Button
                type="button"
                className="h-9 border border-border bg-background text-xs font-medium text-foreground hover:bg-border/50 sm:h-10 sm:text-sm"
                onClick={handleUseAnotherEmail}
                disabled={disabled}
              >
                Use another email
              </Button>
            </div>
          </form>
        )}

        {step === 'password' && (
          <form className="space-y-3 sm:space-y-3.5" onSubmit={handleResetPassword} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="text-xs font-medium text-muted-foreground sm:text-sm">
                New password
              </label>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setErrors((previous) => ({ ...previous, newPassword: '' }));
                }}
                disabled={disabled}
                className="h-9 text-sm sm:h-10"
                placeholder="********"
              />
              {errors.newPassword && <p className="mt-1 text-[11px] text-error sm:text-xs">{errors.newPassword}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground sm:text-sm">
                Confirm password
              </label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setErrors((previous) => ({ ...previous, confirmPassword: '' }));
                }}
                disabled={disabled}
                className="h-9 text-sm sm:h-10"
                placeholder="********"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-error sm:text-xs">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-2.5 pt-2 sm:space-y-3 sm:pt-3">
              <Button type="submit" className="h-9 text-xs font-medium sm:h-10 sm:text-sm" disabled={disabled}>
                {loadingState === 'resetting' || loadingState === 'redirecting' ? 'Resetting...' : 'Reset password'}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
