import { useEffect, useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { AuthLayout } from '@/components/ui/auth-layout';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/error-banner';
import { FieldError } from '@/components/ui/field-error';
import { FormHeader } from '@/components/ui/form-header';
import { Input } from '@/components/ui/input';
import { OtpInput } from '@/components/ui/otp-input';
import { Password } from '@/components/ui/password';
import { useCooldown } from '@/hooks/use-cooldown';
import { apiClient } from '@/lib/api-client';
import { createInputChangeHandler } from '@/lib/form';
import { emailRules, passwordRules } from '@/lib/validation';

const emailSchema = z.object({
  email: emailRules,
});

const resetPasswordSchema = z
  .object({
    newPassword: passwordRules,
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
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [code, setCode] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errors, setErrors] = useState<FormErrors>({});

  const disabled = loadingState !== 'idle';

  const { cooldownSecondsLeft, startCooldown } = useCooldown();
  const handleInputChange = createInputChangeHandler(setFormData, setErrors);

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

    const result = emailSchema.safeParse({ email: formData.email });

    if (!result.success) {
      setErrors({ email: result.error.issues[0]?.message ?? 'Invalid email' });
      return;
    }

    setLoadingState('sending');

    try {
      await apiClient.sendPasswordResetEmail(formData.email);
      const { retryAfterSeconds } = await apiClient.getPasswordResetResendCooldown(formData.email);
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
      await apiClient.verifyPasswordResetCode(formData.email, code);
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
      await apiClient.sendPasswordResetEmail(formData.email);
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
    setFormData((prev) => ({ ...prev, email: '' }));
    setCode('');
    setErrors({});
  }

  async function handleResetPassword(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const result = resetPasswordSchema.safeParse({
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    });

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
      await apiClient.resetPassword(formData.email, code, formData.newPassword);
      setLoadingState('redirecting');
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || 'Failed to reset password. Please try again.' });
      setLoadingState('idle');
    }
  }

  return (
    <AuthLayout>
      <FormHeader
        title="Reset your password"
        subtitle={
          step === 'email'
            ? "Enter your email and we'll send you code to reset your password"
            : step === 'code'
              ? `Enter the 6-digit code sent to ${formData.email}`
              : 'Create your new password'
        }
      />

      <ErrorBanner message={errors.submit} />

      {step === 'email' && (
        <form className="space-y-3 sm:space-y-3.5" onSubmit={handleSendCode} noValidate>
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              disabled={disabled}
              className="h-9 sm:h-10 text-sm"
            />
            <FieldError message={errors.email} />
          </div>

          <div className="space-y-2.5 pt-2 sm:space-y-3 sm:pt-3">
            <Button type="submit" disabled={disabled}>
              {loadingState === 'sending' ? 'Sending...' : 'Send code'}
            </Button>

            <Button type="button" variant="outline" onClick={() => navigate('/sign-in')} disabled={disabled}>
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
          <FieldError message={errors.code} />

          <div className="space-y-2.5">
            <Button type="submit" disabled={disabled || code.length !== 6}>
              {loadingState === 'verifying' ? 'Verifying...' : 'Verify code'}
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

            <Button type="button" variant="outline" onClick={handleUseAnotherEmail} disabled={disabled}>
              Use another email
            </Button>
          </div>
        </form>
      )}

      {step === 'password' && (
        <form className="space-y-3 sm:space-y-3.5" onSubmit={handleResetPassword} noValidate>
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground" htmlFor="newPassword">
              New password
            </label>
            <Password
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              disabled={disabled}
              className="h-9 sm:h-10 text-sm"
            />
            <FieldError message={errors.newPassword} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground" htmlFor="confirmPassword">
              Confirm password
            </label>
            <Password
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={disabled}
              className="h-9 sm:h-10 text-sm"
            />
            <FieldError message={errors.confirmPassword} />
          </div>

          <div className="space-y-2.5 pt-2 sm:space-y-3 sm:pt-3">
            <Button type="submit" disabled={disabled}>
              {loadingState === 'resetting' || loadingState === 'redirecting' ? 'Resetting...' : 'Reset password'}
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
