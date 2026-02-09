import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme.toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth.context';
import { useNavigate } from 'react-router-dom';
import { SiGoogle } from 'react-icons/si';
import { apiClient } from '@/lib/api-client';

const signUpSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^(?!\.)(.*?)(?<!\.)$/, {
      message: 'Username cannot start or end with a dot',
    })
    .regex(/^(?!.*\.\.)/, {
      message: 'Username cannot contain consecutive dots',
    })
    .regex(/^[a-zA-Z0-9._]+$/, {
      message:
        'Username can only contain letters, numbers, underscores, and dots',
    }),
  email: z
    .email('Please enter a valid email')
    .max(255, 'Email must not exceed 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one symbol'),
});

type FormErrors = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  submit?: string;
};

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [continuingWithGoogle, setContinuingWithGoogle] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const isDisabled = loading || continuingWithGoogle;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  function handleSignUpWithGoogle() {
    setContinuingWithGoogle(true);
    window.location.href = `${apiClient.getBaseUrl()}/auth/google`;
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

      setLoading(true);

      await signUp(formData);
      navigate('/');
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
        const message =
          error.response.data?.message ??
          'Failed to create account. Please try again.';
        setErrors({ submit: message });
      } else {
        setErrors({ submit: 'Failed to sign up. Please try again.' });
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
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">
            Create your account
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Join and start sharing your art with the world
          </p>
        </div>

        {errors.submit && (
          <div className="bg-error-background border border-error-border p-3 mb-4">
            <p className="text-xs sm:text-sm text-error">{errors.submit}</p>
          </div>
        )}

        <form
          className="space-y-3 sm:space-y-3.5"
          onSubmit={handleSubmit}
          noValidate
        >
          <Button
            type="button"
            className="w-full h-9 sm:h-10 flex items-center justify-center gap-2 border border-border bg-background text-foreground hover:bg-border/50 text-xs sm:text-sm font-medium"
            onClick={handleSignUpWithGoogle}
            disabled={isDisabled}
          >
            <SiGoogle className="text-sm sm:text-base" />
            <span>
              {continuingWithGoogle
                ? 'Continuing with Google...'
                : 'Continue with Google'}
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
            <label
              className="text-xs sm:text-sm font-medium text-muted-foreground"
              htmlFor="name"
            >
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
              disabled={isDisabled}
            />
            {errors.name && (
              <p className="text-[11px] sm:text-xs text-error mt-1">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs sm:text-sm font-medium text-muted-foreground"
              htmlFor="username"
            >
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
              disabled={isDisabled}
            />
            {errors.username && (
              <p className="text-[11px] sm:text-xs text-error mt-1">
                {errors.username}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs sm:text-sm font-medium text-muted-foreground"
              htmlFor="email"
            >
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
            {errors.email && (
              <p className="text-[11px] sm:text-xs text-error mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs sm:text-sm font-medium text-muted-foreground"
              htmlFor="password"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-9 sm:h-10 text-sm"
              disabled={isDisabled}
            />
            {errors.password && (
              <p className="text-[11px] sm:text-xs text-error mt-1">
                {errors.password}
              </p>
            )}
          </div>

          <div className="pt-1.5 sm:pt-2">
            <Button
              type="submit"
              className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium"
              disabled={isDisabled}
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </Button>
          </div>
        </form>

        <div className="mt-5 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Already have an account?{' '}
            <a
              href="/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
