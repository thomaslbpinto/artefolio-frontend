import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme.toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, type SubmitEvent } from 'react';
import { SiGoogle } from 'react-icons/si';
import { z } from 'zod';

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
    .email('Please enter a valid email address')
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
};

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  async function handleSignUpWithGoogle() {
    console.log('Sign up with Google');
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const result = signUpSchema.safeParse({ name, username, email, password });

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

    console.log('Name:', name);
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
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
            Join artefolio and start sharing your art with the world
          </p>
        </div>

        <form
          className="space-y-3 sm:space-y-3.5"
          onSubmit={handleSubmit}
          noValidate
        >
          <Button
            type="button"
            className="w-full h-9 sm:h-10 flex items-center justify-center gap-2 border border-border bg-background text-foreground hover:bg-border/50 text-xs sm:text-sm font-medium"
            onClick={handleSignUpWithGoogle}
          >
            <SiGoogle className="text-sm sm:text-base" />
            <span>Continue with Google</span>
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
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="h-9 sm:h-10 text-sm"
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
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              autoComplete="username"
              className="h-9 sm:h-10 text-sm"
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              className="h-9 sm:h-10 text-sm"
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-9 sm:h-10 text-sm"
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
            >
              Sign up
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
