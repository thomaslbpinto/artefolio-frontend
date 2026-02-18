import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme.toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { useNavigate } from 'react-router-dom';
import { SiGoogle } from 'react-icons/si';
import { apiClient } from '@/lib/api-client';
import z from 'zod';

const signInSchema = z.object({
  email: z.email('Please enter a valid email').max(255, 'Email must not exceed 255 characters'),
  password: z.string().min(1, 'Password is required').max(255, 'Password must not exceed 255 characters'),
});

type FormErrors = {
  email?: string;
  password?: string;
  submit?: string;
};

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [continuingWithGoogle, setContinuingWithGoogle] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const isDisabled = loading || continuingWithGoogle;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  function handleSignInWithGoogle() {
    setContinuingWithGoogle(true);
    window.location.href = `${apiClient.getBaseUrl()}/auth/google`;
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

      setLoading(true);

      await signIn(formData);
      navigate('/');
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrors({ submit: 'Incorrect email or password.' });
      } else {
        setErrors({ submit: 'Failed to sign in. Please try again.' });
      }
    } finally {
      setLoading(false);
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
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Sign in to your account to continue</p>
        </div>

        {errors.submit && (
          <div className="bg-error-background border border-error-border p-3 mb-4">
            <p className="text-xs sm:text-sm text-error">{errors.submit}</p>
          </div>
        )}

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
              disabled={isDisabled}
            />
            {errors.email && <p className="text-[11px] sm:text-xs text-error mt-1">{errors.email}</p>}
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
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-9 sm:h-10 text-sm"
              disabled={isDisabled}
            />
            {errors.password && <p className="text-[11px] sm:text-xs text-error mt-1">{errors.password}</p>}
          </div>

          <div className="pt-2 sm:pt-3 space-y-2.5 sm:space-y-3">
            <Button type="submit" className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium" disabled={isDisabled}>
              {loading && !continuingWithGoogle ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="flex items-center py-1 sm:py-1.5">
              <div className="grow border-t border-border"></div>
              <span className="shrink mx-3 text-[10px] sm:text-xs font-medium text-muted-foreground tracking-wider">
                OR
              </span>
              <div className="grow border-t border-border"></div>
            </div>

            <Button
              type="button"
              className="w-full h-9 sm:h-10 flex items-center justify-center gap-2 border border-border bg-background text-foreground hover:bg-border/50 text-xs sm:text-sm font-medium"
              onClick={handleSignInWithGoogle}
              disabled={isDisabled}
            >
              <SiGoogle className="text-sm sm:text-base" />
              <span>{continuingWithGoogle ? 'Continuing with Google...' : 'Continue with Google'}</span>
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
      </main>
    </div>
  );
}
