import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import type { JSX } from 'react/jsx-dev-runtime';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/sign-in" />;
  }

  return children;
};
