import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme.toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, type SubmitEvent } from 'react';
import { SiGoogle } from 'react-icons/si';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState('');

  async function handleSignInWithGoogle() {
    console.log('Sign in with Google');
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setServerError('Incorrect email or password');

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
            Welcome back
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {serverError && (
          <div className="bg-error-background border border-error-border p-3 mb-4">
            <p className="text-xs sm:text-sm text-error">{serverError}</p>
          </div>
        )}

        <form
          className="space-y-3 sm:space-y-3.5"
          onSubmit={handleSubmit}
          noValidate
        >
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
              onChange={(e) => {
                setEmail(e.target.value);
                setServerError('');
              }}
              placeholder="your@email.com"
              autoComplete="email"
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                className="text-xs sm:text-sm font-medium text-muted-foreground"
                htmlFor="password"
              >
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-xs sm:text-sm font-medium text-primary hover:underline whitespace-nowrap"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setServerError('');
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          <div className="pt-2 sm:pt-3 space-y-2.5 sm:space-y-3">
            <Button
              type="submit"
              className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium"
            >
              Sign in
            </Button>

            <div className="flex items-center py-1 sm:py-1.5">
              <div className="grow border-t border-border"></div>
              <span className="shrink mx-3 text-[10px] sm:text-xs font-medium text-muted-foreground tracking-wider">
                OR CONTINUE WITH
              </span>
              <div className="grow border-t border-border"></div>
            </div>

            <Button
              type="button"
              className="h-9 sm:h-10 flex items-center justify-center gap-2 border border-border bg-background text-foreground hover:bg-border/50 text-xs sm:text-sm font-medium"
              onClick={handleSignInWithGoogle}
            >
              <SiGoogle className="text-sm sm:text-base" />
              <span>Google</span>
            </Button>
          </div>
        </form>

        <div className="mt-5 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            New to artefolio?{' '}
            <a
              href="/sign-up"
              className="font-medium text-primary hover:underline"
            >
              Create an account
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
