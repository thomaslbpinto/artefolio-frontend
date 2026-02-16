import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme.toggle';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth.context';

export default function LinkGoogleAccountPage() {
  const navigate = useNavigate();
  const { googleLinkAccount } = useAuth();
  const [profile, setProfile] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

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
    setLoading(true);

    try {
      await googleLinkAccount();
      navigate('/');
    } catch {
      setLoading(false);
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
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-8 py-6 sm:gap-8 sm:px-6 sm:py-8">
      <header className="flex w-full max-w-md items-center justify-between">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex w-full max-w-md flex-col">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">Link your Google account</h1>
        </div>

        <div className="bg-border/30 border border-border p-3 mb-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            You have an account with <span className="font-medium text-foreground">{profile.email}</span>.
          </p>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Link your account to sign in with Google in the future.
          </p>
        </div>

        <div className="space-y-2.5">
          <Button
            type="button"
            onClick={handleLinkAccount}
            className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Linking...' : 'Link account'}
          </Button>

          <Button
            type="button"
            onClick={handleCancel}
            className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium border border-border bg-background text-foreground hover:bg-border/50"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </main>
    </div>
  );
}
