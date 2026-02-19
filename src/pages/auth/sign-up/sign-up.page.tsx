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
import { nameRules, usernameRules, emailRules, passwordRules } from '@/lib/validation';

const signUpSchema = z.object({
  name: nameRules,
  username: usernameRules,
  email: emailRules,
  password: passwordRules,
});

type FormErrors = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  submit?: string;
};

type LoadingState = 'idle' | 'signing-up' | 'continuing-with-google';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const disabled = loadingState !== 'idle';

  const handleInputChange = createInputChangeHandler(setFormData, setErrors);

  function handleSignUpWithGoogle() {
    setLoadingState('continuing-with-google');
    window.location.href = apiClient.getGoogleAuthUrl();
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    try {
      const result = signUpSchema.safeParse(formData);

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

      setLoadingState('signing-up');

      await signUp(formData);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error: any) {
      if (error.response?.status === 409) {
        const message = error.response.data.message;
        if (message.includes('email')) {
          setErrors({
            email: 'This email is already linked to another account.',
          });
        } else if (message.includes('username')) {
          setErrors({ username: 'This username is already taken.' });
        } else {
          setErrors({ submit: message });
        }
      } else if (error.response?.status === 500) {
        const message = error.response.data?.message ?? 'Failed to create account. Please try again.';
        setErrors({ submit: message });
      } else {
        setErrors({ submit: 'Failed to sign up. Please try again.' });
      }
    } finally {
      setLoadingState('idle');
    }
  }

  return (
    <AuthLayout>
      <FormHeader title="Create your account" subtitle="Join and start sharing your art with the world" />

      <ErrorBanner message={errors.submit} />

      <form className="space-y-3 sm:space-y-3.5" onSubmit={handleSubmit} noValidate>
        <Button type="button" variant="outline" onClick={handleSignUpWithGoogle} disabled={disabled}>
          <SiGoogle className="text-sm sm:text-base" />
          <span>
            {loadingState === 'continuing-with-google' ? 'Continuing with Google...' : 'Continue with Google'}
          </span>
        </Button>

        <div className="flex items-center py-1 sm:py-1.5">
          <div className="grow border-t border-border"></div>
          <span className="shrink mx-3 text-[10px] sm:text-xs font-medium text-muted-foreground tracking-wider">
            OR
          </span>
          <div className="grow border-t border-border"></div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-medium text-muted-foreground" htmlFor="name">
            Name
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your name"
            autoComplete="name"
            className="h-9 sm:h-10 text-sm"
            disabled={disabled}
          />
          <FieldError message={errors.name} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-medium text-muted-foreground" htmlFor="username">
            Username
          </label>
          <Input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="username"
            autoComplete="username"
            className="h-9 sm:h-10 text-sm"
            disabled={disabled}
          />
          <FieldError message={errors.username} />
        </div>

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
          <label className="text-xs sm:text-sm font-medium text-muted-foreground" htmlFor="password">
            Password
          </label>
          <Password
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            autoComplete="new-password"
            className="h-9 sm:h-10 text-sm"
            disabled={disabled}
          />
          <FieldError message={errors.password} />
        </div>

        <div className="pt-1.5 sm:pt-2">
          <Button type="submit" disabled={disabled}>
            {loadingState === 'signing-up' ? 'Signing up...' : 'Sign up'}
          </Button>
        </div>
      </form>

      <div className="mt-5 sm:mt-6 text-center">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
