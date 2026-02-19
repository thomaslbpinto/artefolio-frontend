import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { SiGoogle } from 'react-icons/si';
import { AuthLayout } from '@/components/ui/auth-layout';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/error-banner';
import { FieldError } from '@/components/ui/field-error';
import { FormHeader } from '@/components/ui/form-header';
import { Input } from '@/components/ui/input';
import { Password } from '@/components/ui/password';
import { useAuth } from '@/contexts/auth.context';
import { apiClient } from '@/lib/api-client';
import { createInputChangeHandler } from '@/lib/form';
import { emailRules } from '@/lib/validation';

const signInSchema = z.object({
  email: emailRules,
  password: z.string().min(1, 'Password is required').max(255, 'Password must not exceed 255 characters'),
});

type FormErrors = {
  email?: string;
  password?: string;
  submit?: string;
};

type LoadingState = 'idle' | 'signing-in' | 'continuing-with-google';

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const disabled = loadingState !== 'idle';

  const handleInputChange = createInputChangeHandler(setFormData, setErrors);

  function handleSignInWithGoogle() {
    setLoadingState('continuing-with-google');
    window.location.href = apiClient.getGoogleAuthUrl();
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    try {
      const result = signInSchema.safeParse(formData);

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

      setLoadingState('signing-in');

      await signIn(formData);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrors({ submit: 'Incorrect email or password.' });
      } else {
        setErrors({ submit: 'Failed to sign in. Please try again.' });
      }
    } finally {
      setLoadingState('idle');
    }
  }

  return (
    <AuthLayout>
      <FormHeader title="Welcome back" subtitle="Sign in to your account to continue" />

      <ErrorBanner message={errors.submit} />

      <form className="space-y-3 sm:space-y-3.5" onSubmit={handleSubmit} noValidate>
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
            autoComplete="email"
            className="h-9 sm:h-10 text-sm"
            disabled={disabled}
          />
          <FieldError message={errors.email} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground" htmlFor="password">
              Password
            </label>
            <a
              href="/reset-password"
              className="text-xs sm:text-sm font-medium text-primary hover:underline whitespace-nowrap"
            >
              Forgot password?
            </a>
          </div>
          <Password
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            autoComplete="current-password"
            className="h-9 sm:h-10 text-sm"
            disabled={disabled}
          />
          <FieldError message={errors.password} />
        </div>

        <div className="pt-2 sm:pt-3 space-y-2.5 sm:space-y-3">
          <Button type="submit" disabled={disabled}>
            {loadingState === 'signing-in' ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="flex items-center py-1 sm:py-1.5">
            <div className="grow border-t border-border"></div>
            <span className="shrink mx-3 text-[10px] sm:text-xs font-medium text-muted-foreground tracking-wider">
              OR
            </span>
            <div className="grow border-t border-border"></div>
          </div>

          <Button type="button" variant="outline" onClick={handleSignInWithGoogle} disabled={disabled}>
            <SiGoogle className="text-sm sm:text-base" />
            <span>
              {loadingState === 'continuing-with-google' ? 'Continuing with Google...' : 'Continue with Google'}
            </span>
          </Button>
        </div>
      </form>

      <div className="mt-5 sm:mt-6 text-center">
        <p className="text-xs sm:text-sm text-muted-foreground">
          New to artefolio?{' '}
          <a href="/sign-up" className="font-medium text-primary hover:underline">
            Create an account
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
