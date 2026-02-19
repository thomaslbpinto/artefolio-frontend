import { useEffect, useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { AuthLayout } from '@/components/ui/auth-layout';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/error-banner';
import { FieldError } from '@/components/ui/field-error';
import { FormHeader } from '@/components/ui/form-header';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth.context';
import { apiClient } from '@/lib/api-client';
import { createInputChangeHandler } from '@/lib/form';
import { nameRules, usernameRules } from '@/lib/validation';
import type { GoogleProfile } from '@/types/auth.types';

type LoadingState = 'idle' | 'submitting';

const completeSignUpSchema = z.object({
  name: nameRules,
  username: usernameRules,
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
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [fetchingProfile, setFetchingProfile] = useState(true);

  const disabled = loadingState !== 'idle';

  const handleInputChange = createInputChangeHandler(setFormData, setErrors);

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

      setLoadingState('submitting');

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
      setLoadingState('idle');
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
    <AuthLayout>
      <FormHeader title="Complete your profile" subtitle="Just a few more details to get started" />

      <ErrorBanner message={errors.submit} />

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

        <div className="pt-1.5 sm:pt-2 space-y-2.5">
          <Button type="submit" disabled={disabled}>
            {loadingState === 'submitting' ? 'Signing up...' : 'Sign up'}
          </Button>

          <Button type="button" variant="outline" onClick={handleGoBack} disabled={disabled}>
            Go back
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
