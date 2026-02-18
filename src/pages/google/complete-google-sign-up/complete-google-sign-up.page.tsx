import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme.toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, type ChangeEvent, type SubmitEvent } from 'react';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth.context';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import type { GoogleProfile } from '@/types/auth.types';

const completeSignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
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
      message: 'Username can only contain letters, numbers, underscores, and dots',
    }),
});

type FormErrors = {
  name?: string;
  username?: string;
  submit?: string;
};

export default function CompleteGoogleSignUpPage() {
  const navigate = useNavigate();
  const { googleSignUpComplete } = useAuth();
  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const pendingProfile = await apiClient.getGooglePendingSignupProfile();

        if (!pendingProfile) {
          navigate('/sign-up');
          return;
        }

        setProfile(pendingProfile);

        setFormData((prev) => ({
          ...prev,
          name: pendingProfile.name || '',
        }));
      } catch {
        navigate('/sign-up');
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    try {
      const result = completeSignUpSchema.safeParse(formData);

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

      await googleSignUpComplete({
        name: formData.name,
        username: formData.username,
      });
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      const message = error.response?.data?.message as string | undefined;
      if (
        error.response?.status === 400 &&
        (message === 'No pending signup found' || message === 'Invalid or expired pending signup')
      ) {
        navigate('/sign-up');
        return;
      }
      if (error.response?.status === 409) {
        if (message?.includes('username')) {
          setErrors({ username: 'This username is already taken.' });
        } else {
          setErrors({
            submit: message ?? 'An account with this email already exists.',
          });
        }
      } else {
        setErrors({ submit: 'Failed to complete sign up. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoBack() {
    try {
      await apiClient.clearGooglePendingSignupProfile();
    } finally {
      navigate('/sign-up');
    }
  }

  if (fetchingProfile || !profile) {
    return null;
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-8 py-6 sm:gap-8 sm:px-6 sm:py-8">
      <header className="flex w-full max-w-md items-center justify-between">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex w-full max-w-md flex-col">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">Complete your profile</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Just a few more details to get started</p>
        </div>

        {errors.submit && (
          <div className="bg-error-background border border-error-border p-3 mb-4">
            <p className="text-xs sm:text-sm text-error">{errors.submit}</p>
          </div>
        )}

        <form className="space-y-3 sm:space-y-3.5" onSubmit={handleSubmit} noValidate>
          <div className="bg-border/30 border border-border p-3">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Signing up with <span className="font-medium text-foreground">{profile.email}</span>
            </p>
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
              disabled={loading}
            />
            {errors.name && <p className="text-[11px] sm:text-xs text-error mt-1">{errors.name}</p>}
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
              disabled={loading}
            />
            {errors.username && <p className="text-[11px] sm:text-xs text-error mt-1">{errors.username}</p>}
          </div>

          <div className="pt-1.5 sm:pt-2 space-y-2.5">
            <Button type="submit" className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign up'}
            </Button>

            <Button
              type="button"
              onClick={handleGoBack}
              className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium border border-border bg-background text-foreground hover:bg-border/50"
              disabled={loading}
            >
              Go back
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
