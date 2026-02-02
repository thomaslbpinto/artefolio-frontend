import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import type { JSX } from 'react/jsx-dev-runtime';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" />;
  }

  return children;
};
