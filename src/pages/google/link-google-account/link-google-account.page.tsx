import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/ui/auth-layout';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ui/error-banner';
import { FormHeader } from '@/components/ui/form-header';
import { useAuth } from '@/contexts/auth.context';
import { apiClient } from '@/lib/api-client';

type LoadingState = 'idle' | 'linking';

export default function LinkGoogleAccountPage() {
  const navigate = useNavigate();
  const { googleLinkAccount } = useAuth();
  const [profile, setProfile] = useState<{ email: string } | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | undefined>();
  const [fetchingProfile, setFetchingProfile] = useState(true);

  const disabled = loadingState !== 'idle';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const pendingProfile = await apiClient.getPendingGoogleLinkProfile();

        if (!pendingProfile) {
          navigate('/sign-up');
          return;
        }

        setProfile({ email: pendingProfile.email });
      } catch {
        navigate('/');
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  async function handleLinkAccount() {
    setLoadingState('linking');
    setError(undefined);

    try {
      await googleLinkAccount();
      navigate('/');
    } catch {
      setLoadingState('idle');
    }
  }

  async function handleCancel() {
    try {
      await apiClient.clearGooglePendingLinkProfile();
    } finally {
      navigate('/');
    }
  }

  if (fetchingProfile || !profile) {
    return null;
  }

  return (
    <AuthLayout>
      <FormHeader title="Link your Google account" subtitle="Connect Google to sign in faster next time" />

      <ErrorBanner message={error} />

      <div className="bg-border/30 border border-border p-3 mb-6">
        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
          You have an account with <span className="font-medium text-foreground">{profile.email}</span>.
        </p>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Link your account to sign in with Google in the future.
        </p>
      </div>

      <div className="space-y-2.5">
        <Button type="button" onClick={handleLinkAccount} disabled={disabled}>
          {loadingState === 'linking' ? 'Linking...' : 'Link account'}
        </Button>

        <Button type="button" variant="outline" onClick={handleCancel} disabled={disabled}>
          Cancel
        </Button>
      </div>
    </AuthLayout>
  );
}
